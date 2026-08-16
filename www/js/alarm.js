import {
    vibrate,
    notifyOverspeed,
    cancelOverspeedNotification,
} from './native.js';

/**
 * Overspeed alarm with hysteresis so it doesn't chatter at the limit:
 * triggers when speed exceeds the limit, and only resets once speed drops
 * below RESET_FRACTION of the limit (e.g. 50 -> resets at 46).
 *
 * While active it loops the alarm sound, fires a repeating vibration, posts
 * one high-priority notification (renewed at most every NOTIFY_COOLDOWN_MS),
 * and invokes onStateChange(active) for UI feedback.
 *
 * mute() silences sound/vibration for the current overspeed episode only —
 * the next episode alarms again.
 */
export class AlarmController {
    static RESET_FRACTION = 0.92;
    static VIBRATE_INTERVAL_MS = 1200;
    static NOTIFY_COOLDOWN_MS = 30000;

    constructor({ soundSrc, onStateChange }) {
        this.audio = new Audio(soundSrc);
        this.audio.loop = true;
        this.onStateChange = onStateChange || (() => {});
        this.active = false;
        this.muted = false;
        this.vibrateTimer = null;
        this.lastNotifyAt = 0;
        this.settingsProvider = () => ({ sound: true, vibration: true, notifications: true });
        this.audioUnlocked = false;
    }

    /** settingsProvider: () => { sound, vibration, notifications } */
    setSettingsProvider(fn) {
        this.settingsProvider = fn;
    }

    /**
     * Mobile browsers refuse to play audio without a user gesture; call this
     * from the Start button handler to unlock the audio element.
     */
    async unlockAudio() {
        if (this.audioUnlocked) return;
        try {
            this.audio.muted = true;
            await this.audio.play();
            this.audio.pause();
            this.audio.currentTime = 0;
            this.audio.muted = false;
            this.audioUnlocked = true;
        } catch {
            this.audio.muted = false;
        }
    }

    /** Feed every speed update through here. */
    update(speedKmh, limitKmh, speedText, limitText) {
        if (!this.active && speedKmh > limitKmh) {
            this.active = true;
            this.muted = false;
            this._startAlerting(speedText, limitText);
            this.onStateChange(true);
        } else if (this.active && speedKmh < limitKmh * AlarmController.RESET_FRACTION) {
            this.active = false;
            this._stopAlerting();
            this.onStateChange(false);
        } else if (this.active) {
            // Still speeding: renew the notification occasionally with fresh numbers.
            this._maybeNotify(speedText, limitText);
        }
    }

    mute() {
        if (!this.active) return;
        this.muted = true;
        this.audio.pause();
        clearInterval(this.vibrateTimer);
        this.vibrateTimer = null;
    }

    /** Hard stop, e.g. when the trip ends. */
    reset() {
        this.active = false;
        this._stopAlerting();
        this.onStateChange(false);
    }

    _startAlerting(speedText, limitText) {
        const prefs = this.settingsProvider();
        if (prefs.sound && !this.muted) {
            this.audio.currentTime = 0;
            this.audio.play().catch(() => {});
        }
        if (prefs.vibration && !this.muted) {
            vibrate(600);
            this.vibrateTimer = setInterval(
                () => vibrate(600),
                AlarmController.VIBRATE_INTERVAL_MS
            );
        }
        this._maybeNotify(speedText, limitText, true);
    }

    _stopAlerting() {
        this.audio.pause();
        this.audio.currentTime = 0;
        clearInterval(this.vibrateTimer);
        this.vibrateTimer = null;
        cancelOverspeedNotification();
    }

    _maybeNotify(speedText, limitText, force = false) {
        const prefs = this.settingsProvider();
        if (!prefs.notifications) return;
        const now = Date.now();
        if (!force && now - this.lastNotifyAt < AlarmController.NOTIFY_COOLDOWN_MS) return;
        this.lastNotifyAt = now;
        notifyOverspeed(speedText, limitText);
    }
}
