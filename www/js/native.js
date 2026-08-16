/**
 * Bridge layer between the app and Capacitor plugins.
 *
 * The app runs in two contexts:
 *  - Native (Android/iOS via Capacitor): window.Capacitor is injected by the
 *    runtime and plugins are called through Capacitor.registerPlugin proxies.
 *  - Plain browser (PWA/dev): every call falls back to a web API or a no-op.
 */

import { t } from './i18n.js';

const cap = typeof window !== 'undefined' ? window.Capacitor : undefined;

export const isNative = !!(cap && cap.isNativePlatform && cap.isNativePlatform());

function plugin(name) {
    if (!cap || !cap.registerPlugin) return null;
    try {
        return cap.registerPlugin(name);
    } catch {
        return null;
    }
}

const BackgroundGeolocation = isNative ? plugin('BackgroundGeolocation') : null;
const LocalNotifications = isNative ? plugin('LocalNotifications') : null;
const Haptics = isNative ? plugin('Haptics') : null;
const Preferences = isNative ? plugin('Preferences') : null;
const KeepAwake = isNative ? plugin('KeepAwake') : null;
const WidgetBridge = isNative ? plugin('WidgetBridge') : null;
const SystemBridge = isNative ? plugin('SystemBridge') : null;
const App = isNative ? plugin('App') : null;

/* ---------------- storage ---------------- */

export async function storageGet(key) {
    if (Preferences) {
        const { value } = await Preferences.get({ key });
        return value;
    }
    return localStorage.getItem(key);
}

export async function storageSet(key, value) {
    if (Preferences) {
        await Preferences.set({ key, value });
    } else {
        localStorage.setItem(key, value);
    }
}

export async function storageRemove(key) {
    if (Preferences) {
        await Preferences.remove({ key });
    } else {
        localStorage.removeItem(key);
    }
}

/* ---------------- location watching ---------------- */

/**
 * Start watching location. Returns an opaque handle for stopWatch().
 * onFix receives { latitude, longitude, accuracy, speedMps|null, time }.
 * onError receives an Error with optional .code ('NOT_AUTHORIZED' | ...).
 */
export async function startWatch(onFix, onError) {
    if (BackgroundGeolocation) {
        const watcherId = await BackgroundGeolocation.addWatcher(
            {
                backgroundMessage: t('notifBgMessage'),
                backgroundTitle: t('notifBgTitle'),
                requestPermissions: true,
                stale: false,
                distanceFilter: 0,
            },
            (location, error) => {
                if (error) {
                    const err = new Error(error.message || 'Location error');
                    err.code = error.code;
                    onError(err);
                    return;
                }
                if (!location) return;
                onFix({
                    latitude: location.latitude,
                    longitude: location.longitude,
                    accuracy: location.accuracy,
                    speedMps:
                        typeof location.speed === 'number' && location.speed >= 0
                            ? location.speed
                            : null,
                    bearing: typeof location.bearing === 'number' ? location.bearing : null,
                    time: location.time || Date.now(),
                });
            }
        );
        return { type: 'native', id: watcherId };
    }

    if (!('geolocation' in navigator)) {
        onError(new Error('Geolocation is not supported on this device.'));
        return null;
    }
    const id = navigator.geolocation.watchPosition(
        (pos) => {
            onFix({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                accuracy: pos.coords.accuracy,
                speedMps:
                    typeof pos.coords.speed === 'number' && pos.coords.speed >= 0
                        ? pos.coords.speed
                        : null,
                time: pos.timestamp || Date.now(),
            });
        },
        (e) => {
            const err = new Error(e.message);
            if (e.code === e.PERMISSION_DENIED) err.code = 'NOT_AUTHORIZED';
            onError(err);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 30000 }
    );
    return { type: 'web', id };
}

export async function stopWatch(handle) {
    if (!handle) return;
    if (handle.type === 'native' && BackgroundGeolocation) {
        await BackgroundGeolocation.removeWatcher({ id: handle.id });
    } else if (handle.type === 'web') {
        navigator.geolocation.clearWatch(handle.id);
    }
}

export async function openLocationSettings() {
    if (BackgroundGeolocation) {
        try {
            await BackgroundGeolocation.openSettings();
        } catch {
            /* not fatal */
        }
    }
}

/** Request permissions needed before starting background GPS (Android 13+/14+). */
export async function ensureTrackingPermissions() {
    await ensureNotificationPermission();
    if (SystemBridge) {
        try {
            await SystemBridge.ensureTrackingPermissions();
        } catch {
            /* proceed — plugin may still work on older Android versions */
        }
    }
}

export async function openBatterySettings() {
    if (SystemBridge) {
        try {
            await SystemBridge.openBatterySettings();
        } catch {
            /* ignore */
        }
    }
}

export async function syncBootAutoStart(enabled) {
    if (!SystemBridge) return;
    try {
        await SystemBridge.setBootAutoStart({ enabled: !!enabled });
    } catch {
        /* ignore */
    }
}

export async function consumeAutoStartFlag() {
    if (!SystemBridge) return { autoStart: false };
    try {
        return await SystemBridge.consumeAutoStartFlag();
    } catch {
        return { autoStart: false };
    }
}

/* ---------------- notifications ---------------- */

const OVERSPEED_NOTIFICATION_ID = 42;
let channelReady = false;

export async function ensureNotificationPermission() {
    if (!LocalNotifications) return false;
    try {
        let status = await LocalNotifications.checkPermissions();
        if (status.display !== 'granted') {
            status = await LocalNotifications.requestPermissions();
        }
        if (status.display !== 'granted') return false;
        if (!channelReady) {
            await LocalNotifications.createChannel({
                id: 'overspeed',
                name: 'Overspeed alerts',
                description: 'Alerts when you exceed your speed limit',
                importance: 5,
                visibility: 1,
                vibration: true,
            });
            channelReady = true;
        }
        return true;
    } catch {
        return false;
    }
}

export async function notifyOverspeed(speedText, limitText) {
    if (!LocalNotifications) return;
    try {
        await LocalNotifications.schedule({
            notifications: [
                {
                    id: OVERSPEED_NOTIFICATION_ID,
                    title: t('notifSlowDown'),
                    body: t('notifOverspeedBody', { speed: speedText, limit: limitText }),
                    channelId: 'overspeed',
                    ongoing: false,
                    autoCancel: true,
                },
            ],
        });
    } catch {
        /* notification failure must never break tracking */
    }
}

export async function cancelOverspeedNotification() {
    if (!LocalNotifications) return;
    try {
        await LocalNotifications.cancel({
            notifications: [{ id: OVERSPEED_NOTIFICATION_ID }],
        });
    } catch {
        /* ignore */
    }
}

/* ---------------- haptics ---------------- */

export async function vibrate(ms = 500) {
    if (Haptics) {
        try {
            await Haptics.vibrate({ duration: ms });
            return;
        } catch {
            /* fall through to web API */
        }
    }
    if (navigator.vibrate) navigator.vibrate(ms);
}

/* ---------------- keep awake ---------------- */

export async function keepAwake(enable) {
    if (!KeepAwake) return;
    try {
        if (enable) await KeepAwake.keepAwake();
        else await KeepAwake.allowSleep();
    } catch {
        /* ignore */
    }
}

/* ---------------- home-screen widget ---------------- */

/** Push a data snapshot to the Android home-screen widget. */
export async function updateWidget(data) {
    if (!WidgetBridge) return;
    try {
        await WidgetBridge.update({ data: JSON.stringify(data) });
    } catch {
        /* widget is best-effort */
    }
}

/** Call `fn` whenever the app returns to the foreground (native only). */
export function onAppResume(fn) {
    if (!App) return () => {};
    const handlePromise = App.addListener('appStateChange', ({ isActive }) => {
        if (isActive) fn();
    });
    return () => handlePromise.then((h) => h.remove());
}
