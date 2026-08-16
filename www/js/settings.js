import { storageGet, storageSet } from './native.js';
import { MIN_LIMIT_KMH, MAX_LIMIT_KMH } from './trips.js';

const KEY = 'speedalarm.settings.v1';

const DEFAULTS = {
    thresholdKmh: 50,
    unit: 'kmh',
    language: 'ne',
    sound: true,
    vibration: true,
    notifications: true,
    keepAwake: true,
    alwaysOnMonitoring: false,
    bootAutoStart: false,
    theme: 'system',
};

let current = { ...DEFAULTS };
const listeners = new Set();

export async function loadSettings() {
    try {
        const raw = await storageGet(KEY);
        if (raw) current = { ...DEFAULTS, ...JSON.parse(raw) };
    current.thresholdKmh = Math.min(
        MAX_LIMIT_KMH,
        Math.max(MIN_LIMIT_KMH, Math.round(current.thresholdKmh || DEFAULTS.thresholdKmh))
    );
    } catch {
        current = { ...DEFAULTS };
    }
    return current;
}

export function getSettings() {
    return current;
}

export async function updateSettings(patch) {
    current = { ...current, ...patch };
    await storageSet(KEY, JSON.stringify(current));
    for (const fn of listeners) fn(current);
    return current;
}

export function onSettingsChange(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
}
