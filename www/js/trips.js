import { haversineMeters } from './util.js';
import { storageGet, storageSet, storageRemove } from './native.js';

const HISTORY_KEY = 'speedalarm.trips.v1';
const ACTIVE_SNAPSHOT_KEY = 'speedalarm.activeTrip.v1';
const MAX_TRIPS = 200;
const SNAPSHOT_INTERVAL_MS = 15000;

/** Nepal speed limit bounds (always stored in km/h). */
export const MIN_LIMIT_KMH = 20;
export const MAX_LIMIT_KMH = 80;

/** Minimum trip stats to persist (normal stop and crash recovery use the same bar). */
export const MIN_TRIP_DISTANCE_M = 50;
export const MIN_TRIP_MOVING_SEC = 30;

export function isTripWorthSaving({ distanceM, movingSec, movingSeconds }) {
    const moving = movingSec ?? movingSeconds ?? 0;
    return distanceM > MIN_TRIP_DISTANCE_M || moving > MIN_TRIP_MOVING_SEC;
}

/** Distance is only accumulated across fixes at least this accurate. */
const DISTANCE_MAX_ACCURACY_M = 35;
/** Below this speed we treat the vehicle as stationary (GPS drift guard). */
const MOVING_KMH = 3;

/**
 * Records one trip: distance, moving time, average/max speed, and overspeed
 * statistics (number of episodes and total seconds spent over the limit).
 * Periodically snapshots itself to storage so a killed app doesn't lose the trip.
 */
export class TripRecorder {
    constructor(limitKmh) {
        this.startedAt = Date.now();
        this.limitKmh = limitKmh;
        this.distanceM = 0;
        this.movingSeconds = 0;
        this.maxKmh = 0;
        this.overspeedSeconds = 0;
        this.overspeedEpisodes = 0;
        this._wasOver = false;
        this._lastFix = null;
        this._lastSpeedAt = null;
        this._lastSnapshotAt = 0;
    }

    addFix(fix) {
        if (fix.accuracy != null && fix.accuracy > DISTANCE_MAX_ACCURACY_M) return;
        if (this._lastFix) {
            const dtSec = (fix.time - this._lastFix.time) / 1000;
            if (dtSec > 0 && dtSec <= 30) {
                const meters = haversineMeters(
                    this._lastFix.latitude, this._lastFix.longitude,
                    fix.latitude, fix.longitude
                );
                // Ignore sub-jitter movement while stationary.
                const impliedKmh = (meters / dtSec) * 3.6;
                if (impliedKmh >= MOVING_KMH) {
                    this.distanceM += meters;
                }
            }
        }
        this._lastFix = fix;
    }

    addSpeed(kmh, time) {
        if (this._lastSpeedAt != null) {
            const dtSec = (time - this._lastSpeedAt) / 1000;
            if (dtSec > 0 && dtSec <= 30) {
                if (kmh >= MOVING_KMH) this.movingSeconds += dtSec;
                if (kmh > this.limitKmh) this.overspeedSeconds += dtSec;
            }
        }
        this._lastSpeedAt = time;

        if (kmh > this.maxKmh) this.maxKmh = kmh;

        const over = kmh > this.limitKmh;
        if (over && !this._wasOver) this.overspeedEpisodes += 1;
        this._wasOver = over;

        this._maybeSnapshot();
    }

    get elapsedSeconds() {
        return (Date.now() - this.startedAt) / 1000;
    }

    /** Average of time actually spent moving — red lights don't dilute it. */
    get movingAvgKmh() {
        if (this.movingSeconds < 5) return 0;
        return (this.distanceM / 1000) / (this.movingSeconds / 3600);
    }

    toTrip(endedAt = Date.now()) {
        return {
            id: `${this.startedAt}`,
            startedAt: this.startedAt,
            endedAt,
            limitKmh: this.limitKmh,
            distanceM: Math.round(this.distanceM),
            durationSec: Math.round((endedAt - this.startedAt) / 1000),
            movingSec: Math.round(this.movingSeconds),
            avgKmh: Math.round(this.movingAvgKmh * 10) / 10,
            maxKmh: Math.round(this.maxKmh * 10) / 10,
            overspeedSec: Math.round(this.overspeedSeconds),
            overspeedEpisodes: this.overspeedEpisodes,
            score: computeScore(this.movingSeconds, this.overspeedSeconds, this.overspeedEpisodes),
        };
    }

    async _maybeSnapshot() {
        const now = Date.now();
        if (now - this._lastSnapshotAt < SNAPSHOT_INTERVAL_MS) return;
        this._lastSnapshotAt = now;
        try {
            await storageSet(ACTIVE_SNAPSHOT_KEY, JSON.stringify(this.toTrip(now)));
        } catch {
            /* snapshot is best-effort */
        }
    }
}

/**
 * Safety score 0–100: penalized by the fraction of moving time spent over
 * the limit, plus a small penalty per distinct overspeed episode.
 */
export function computeScore(movingSec, overspeedSec, episodes) {
    if (movingSec < 10) return 100;
    const fraction = Math.min(1, overspeedSec / movingSec);
    const score = 100 - 80 * fraction - 3 * episodes;
    return Math.max(0, Math.round(score));
}

/* ---------------- persistence ---------------- */

export async function loadTrips() {
    try {
        const raw = await storageGet(HISTORY_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export async function saveTrip(trip) {
    const trips = await loadTrips();
    trips.unshift(trip);
    if (trips.length > MAX_TRIPS) trips.length = MAX_TRIPS;
    await storageSet(HISTORY_KEY, JSON.stringify(trips));
    await storageRemove(ACTIVE_SNAPSHOT_KEY);
    return trips;
}

export async function clearTrips() {
    await storageRemove(HISTORY_KEY);
    await storageRemove(ACTIVE_SNAPSHOT_KEY);
}

/**
 * If the app was killed mid-trip, the last snapshot is recovered into
 * history on next launch so no data is lost.
 */
export async function recoverInterruptedTrip() {
    try {
        const raw = await storageGet(ACTIVE_SNAPSHOT_KEY);
        if (!raw) return null;
        await storageRemove(ACTIVE_SNAPSHOT_KEY);
        const trip = JSON.parse(raw);
        // Only keep it if it recorded something meaningful.
        if (isTripWorthSaving(trip)) {
            trip.recovered = true;
            const trips = await loadTrips();
            trips.unshift(trip);
            if (trips.length > MAX_TRIPS) trips.length = MAX_TRIPS;
            await storageSet(HISTORY_KEY, JSON.stringify(trips));
            return trip;
        }
        return null;
    } catch {
        return null;
    }
}

export function aggregateStats(trips) {
    if (!trips.length) return { distanceM: 0, count: 0, avgScore: null };
    const distanceM = trips.reduce((s, t) => s + (t.distanceM || 0), 0);
    const avgScore = Math.round(
        trips.reduce((s, t) => s + (t.score ?? 100), 0) / trips.length
    );
    return { distanceM, count: trips.length, avgScore };
}
