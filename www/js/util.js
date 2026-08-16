export const KMH_PER_MPS = 3.6;
export const MPH_PER_KMH = 0.621371;

export function clamp(v, min, max) {
    return Math.min(max, Math.max(min, v));
}

/** Great-circle distance between two lat/lon points, in meters. */
export function haversineMeters(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function kmhToUnit(kmh, unit) {
    return unit === 'mph' ? kmh * MPH_PER_KMH : kmh;
}

export function unitToKmh(value, unit) {
    return unit === 'mph' ? value / MPH_PER_KMH : value;
}

export function unitLabel(unit) {
    return unit === 'mph' ? 'mph' : 'km/h';
}

export function distanceUnitShort(unit) {
    return unit === 'mph' ? 'mi' : 'km';
}

/** Compact number for totals cards (no unit suffix). */
export function formatTotalNumber(meters, unit) {
    const km = meters / 1000;
    const val = unit === 'mph' ? km * MPH_PER_KMH : km;
    if (val < 10) return val.toFixed(1);
    return val >= 100 ? val.toFixed(0) : val.toFixed(1);
}

/** 95 -> "1:35", 3725 -> "1:02:05" */
export function formatDuration(totalSeconds) {
    const s = Math.max(0, Math.round(totalSeconds));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    return `${m}:${String(sec).padStart(2, '0')}`;
}

export function formatDistance(meters, unit) {
    const km = meters / 1000;
    const val = unit === 'mph' ? km * MPH_PER_KMH : km;
    const suffix = unit === 'mph' ? 'mi' : 'km';
    return `${val < 10 ? val.toFixed(2) : val.toFixed(1)} ${suffix}`;
}

export function formatTripDate(ts) {
    const d = new Date(ts);
    const today = new Date();
    const sameDay = d.toDateString() === today.toDateString();
    const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (sameDay) return `Today ${time}`;
    return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${time}`;
}
