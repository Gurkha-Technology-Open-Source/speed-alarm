import { haversineMeters, KMH_PER_MPS, clamp } from './util.js';
import { startWatch, stopWatch } from './native.js';

/**
 * Turns raw GPS fixes into a stable, accurate speed reading.
 *
 * Accuracy strategy (best → worst source):
 *  1. GPS doppler speed (`fix.speedMps`) — measured by the chip from satellite
 *     shift; typically ±1–3 km/h in open sky, ±3–5 km/h in urban areas.
 *  2. Median of recent Haversine-derived speeds — fallback when doppler is
 *     missing; noisier (±5–15 km/h) but smoothed across 3 samples.
 *
 * Additional filters:
 *  - Horizontal accuracy gate (tighter when using position-derived speed).
 *  - Outlier rejection based on plausible vehicle acceleration.
 *  - Adaptive EMA: trust good fixes faster, smooth poor fixes more.
 *  - Zero-clamp for stationary GPS drift.
 */
export class SpeedEngine extends EventTarget {
    /** Max horizontal accuracy (m) when GPS chip provides doppler speed. */
    static DOPPLER_MAX_ACCURACY_M = 30;
    /** Max horizontal accuracy (m) for position-derived speed fallback. */
    static HAVERSINE_MAX_ACCURACY_M = 20;
    static STALE_AFTER_MS = 10000;
    static ZERO_CLAMP_KMH = 2;
    static MAX_PLAUSIBLE_KMH = 400;
    /** ~1.2 g — rejects impossible single-fix speed spikes. */
    static MAX_ACCEL_MS2 = 12;
    static HAVERSINE_BUFFER_SIZE = 3;

    constructor() {
        super();
        this.handle = null;
        this.lastFix = null;
        this.smoothedKmh = null;
        this.lastSpeedTime = null;
        this.haversineBuf = [];
        this.staleTimer = null;
        this.running = false;
    }

    async start() {
        if (this.running) return;
        this.running = true;
        this.lastFix = null;
        this.smoothedKmh = null;
        this.lastSpeedTime = null;
        this.haversineBuf = [];
        this._emitStatus('acquiring');
        try {
            this.handle = await startWatch(
                (fix) => this._onFix(fix),
                (err) => this._onError(err)
            );
        } catch (err) {
            this.running = false;
            this._onError(err);
            throw err;
        }
        this._armStaleTimer();
    }

    async stop() {
        if (!this.running) return;
        this.running = false;
        clearTimeout(this.staleTimer);
        this.staleTimer = null;
        const h = this.handle;
        this.handle = null;
        this.haversineBuf = [];
        await stopWatch(h);
        this._emitStatus('off');
    }

    _onFix(fix) {
        if (!this.running) return;

        const acc = fix.accuracy ?? 999;
        const hasDoppler = fix.speedMps != null && fix.speedMps >= 0;
        const maxAcc = hasDoppler
            ? SpeedEngine.DOPPLER_MAX_ACCURACY_M
            : SpeedEngine.HAVERSINE_MAX_ACCURACY_M;

        if (acc > maxAcc) {
            this._emitStatus('active', `weak ±${Math.round(acc)}m`);
            this._armStaleTimer();
            return;
        }

        let kmh = null;
        let source = 'none';

        if (hasDoppler) {
            kmh = fix.speedMps * KMH_PER_MPS;
            source = 'doppler';
            this.haversineBuf = [];
        } else if (this.lastFix) {
            const dtSec = (fix.time - this.lastFix.time) / 1000;
            if (dtSec >= 0.4 && dtSec <= 15) {
                const meters = haversineMeters(
                    this.lastFix.latitude,
                    this.lastFix.longitude,
                    fix.latitude,
                    fix.longitude
                );
                const derived = (meters / dtSec) * KMH_PER_MPS;
                this.haversineBuf.push(derived);
                if (this.haversineBuf.length > SpeedEngine.HAVERSINE_BUFFER_SIZE) {
                    this.haversineBuf.shift();
                }
                const sorted = [...this.haversineBuf].sort((a, b) => a - b);
                kmh = sorted[Math.floor(sorted.length / 2)];
                source = 'haversine';
            }
        }

        this.lastFix = fix;
        this.dispatchEvent(new CustomEvent('fix', { detail: fix }));
        this._armStaleTimer();

        if (kmh == null || kmh > SpeedEngine.MAX_PLAUSIBLE_KMH) {
            this._emitStatus('active', `±${Math.round(acc)}m`);
            return;
        }

        if (kmh < SpeedEngine.ZERO_CLAMP_KMH) kmh = 0;

        if (this._isOutlier(kmh, fix.time)) {
            this._emitStatus('active', `±${Math.round(acc)}m`);
            return;
        }

        const alpha = this._adaptiveAlpha(acc, source);
        this.smoothedKmh =
            this.smoothedKmh == null
                ? kmh
                : this.smoothedKmh + alpha * (kmh - this.smoothedKmh);

        if (kmh === 0 && this.smoothedKmh < SpeedEngine.ZERO_CLAMP_KMH) {
            this.smoothedKmh = 0;
        }

        this.lastSpeedTime = fix.time;

        const srcTag = source === 'doppler' ? '' : ' ~';
        this._emitStatus('active', `±${Math.round(acc)}m${srcTag}`);
        this.dispatchEvent(
            new CustomEvent('speed', {
                detail: {
                    kmh: this.smoothedKmh,
                    accuracy: acc,
                    source,
                    fix,
                },
            })
        );
    }

    /** Reject single-fix spikes that exceed plausible acceleration. */
    _isOutlier(kmh, time) {
        if (this.smoothedKmh == null || this.lastSpeedTime == null) return false;
        const dtSec = (time - this.lastSpeedTime) / 1000;
        if (dtSec <= 0 || dtSec > 5) return false;

        const prevMps = this.smoothedKmh / KMH_PER_MPS;
        const newMps = kmh / KMH_PER_MPS;
        const accel = Math.abs(newMps - prevMps) / dtSec;

        if (accel > SpeedEngine.MAX_ACCEL_MS2) return true;

        // Also reject jumps > 20 km/h in under a second (GPS position glitch).
        if (dtSec < 1.5 && Math.abs(kmh - this.smoothedKmh) > 20) return true;

        return false;
    }

    /**
     * Good doppler fixes get a higher alpha (snappier display).
     * Poor accuracy or haversine fallback gets lower alpha (more smoothing).
     */
    _adaptiveAlpha(accuracyM, source) {
        if (source === 'doppler' && accuracyM <= 10) return 0.55;
        if (source === 'doppler' && accuracyM <= 20) return 0.45;
        if (source === 'doppler') return 0.35;
        // Haversine median — smooth heavily.
        return clamp(0.3 - accuracyM * 0.008, 0.12, 0.3);
    }

    _onError(err) {
        this._emitStatus('error', err.message || 'Location error', err.code);
    }

    _armStaleTimer() {
        clearTimeout(this.staleTimer);
        this.staleTimer = setTimeout(() => {
            if (this.running) this._emitStatus('lost');
        }, SpeedEngine.STALE_AFTER_MS);
    }

    _emitStatus(state, message, code) {
        this.dispatchEvent(
            new CustomEvent('status', { detail: { state, message, code } })
        );
    }
}
