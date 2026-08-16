import { SpeedEngine } from './speed-engine.js';
import { AlarmController } from './alarm.js';
import { Gauge } from './gauge.js';
import {
    TripRecorder,
    loadTrips,
    saveTrip,
    clearTrips,
    recoverInterruptedTrip,
    aggregateStats,
    MIN_LIMIT_KMH,
    MAX_LIMIT_KMH,
    isTripWorthSaving,
} from './trips.js';
import { loadSettings, getSettings, updateSettings } from './settings.js';
import {
    isNative,
    ensureTrackingPermissions,
    keepAwake,
    updateWidget,
    openLocationSettings,
    openBatterySettings,
    onAppResume,
    syncBootAutoStart,
    consumeAutoStartFlag,
} from './native.js';
import {
    kmhToUnit,
    unitToKmh,
    unitLabel,
    formatDuration,
    formatDistance,
    formatTotalNumber,
    distanceUnitShort,
} from './util.js';
import { confirmDialog } from './dialog.js';
import { initTheme } from './theme.js';
import {
    t,
    setLanguage,
    applyStaticI18n,
    presetLabel,
    formatTripDateLocalized,
    onLanguageChange,
} from './i18n.js';

/* ---------------- elements ---------------- */

const el = (id) => document.getElementById(id);
const speedValue = el('speed-value');
const speedUnit = el('speed-unit');
const gpsStatus = el('gps-status');
const startStopBtn = el('start-stop-btn');
const overspeedBanner = el('overspeed-banner');
const overspeedFlash = el('overspeed-flash');
const muteBtn = el('mute-btn');
const limitChip = el('limit-chip');
const limitChipValue = el('limit-chip-value');
const limitChipUnit = el('limit-chip-unit');
const statDistance = el('stat-distance');
const statDuration = el('stat-duration');
const statAvg = el('stat-avg');
const statMax = el('stat-max');
const tripList = el('trip-list');
const clearHistoryBtn = el('clear-history-btn');
const thresholdInput = el('threshold-input');
const thresholdUnitLabel = el('threshold-unit-label');
const unitSelect = el('unit-select');
const languageSelect = el('language-select');
const themeSelect = el('theme-select');
const presetRow = el('preset-row');
const homeHint = el('home-hint');

/** Nepal speed limits — manual override until per-road lat/lng DB is added. */
const NEPAL_LIMIT_PRESETS = [20, 40, 50, 60, 80];

/* ---------------- state ---------------- */

const engine = new SpeedEngine();
const gauge = new Gauge(el('gauge'));
let recorder = null;
let tripTicker = null;
/** Set when the user explicitly stops GPS; cleared on manual/auto start. */
let userStoppedMonitoring = false;

const alarm = new AlarmController({
    soundSrc: 'assets/alarm.mp3',
    onStateChange(active) {
        overspeedBanner.classList.toggle('hidden', !active);
        overspeedFlash.classList.toggle('flashing', active);
        speedValue.classList.toggle('over', active);
    },
});
alarm.setSettingsProvider(() => {
    const s = getSettings();
    return { sound: s.sound, vibration: s.vibration, notifications: s.notifications };
});

/* ---------------- helpers ---------------- */

function fmtSpeed(kmh) {
    const s = getSettings();
    return `${Math.round(kmhToUnit(kmh, s.unit))} ${unitLabel(s.unit)}`;
}

function applyLanguage() {
    applyStaticI18n();
    refreshLimitUI();
    renderLiveTripStats();
    if (engine.running) {
        startStopBtn.textContent = t('stopTrip');
    } else {
        startStopBtn.textContent = t('startTrip');
    }
    updateHomeHint();
    if (document.querySelector('#screen-trips.active')) renderTrips();
}

function refreshLimitUI() {
    const s = getSettings();
    const displayLimit = Math.round(kmhToUnit(s.thresholdKmh, s.unit));
    limitChipValue.textContent = displayLimit;
    limitChipUnit.textContent = unitLabel(s.unit);
    speedUnit.textContent = unitLabel(s.unit);
    thresholdUnitLabel.textContent = unitLabel(s.unit);
    thresholdInput.min = Math.round(kmhToUnit(MIN_LIMIT_KMH, s.unit));
    thresholdInput.max = Math.round(kmhToUnit(MAX_LIMIT_KMH, s.unit));
    thresholdInput.value = displayLimit;
    unitSelect.value = s.unit;
    languageSelect.value = s.language;
    themeSelect.value = s.theme || 'system';
    gauge.setLimit(kmhToUnit(s.thresholdKmh, s.unit));
    refreshPresetLabels();
    for (const btn of presetRow.children) {
        btn.classList.toggle('active', Number(btn.dataset.kmh) === s.thresholdKmh);
    }
    el('toggle-sound').checked = s.sound;
    el('toggle-vibration').checked = s.vibration;
    el('toggle-notifications').checked = s.notifications;
    el('toggle-awake').checked = s.keepAwake;
    el('toggle-always-on').checked = s.alwaysOnMonitoring;
    el('toggle-boot-auto').checked = s.bootAutoStart;
    el('total-distance-label').textContent = `${distanceUnitShort(s.unit)} ${t('tripsTotal')}`;
}

function updateHomeHint() {
    if (!isNative) {
        homeHint.textContent = t('hintWeb');
        homeHint.classList.remove('hidden');
        return;
    }
    const s = getSettings();
    if (engine.running) {
        homeHint.textContent = t('hintTracking');
    } else if (s.bootAutoStart) {
        homeHint.textContent = t('hintBoot');
    } else if (s.alwaysOnMonitoring) {
        homeHint.textContent = t('hintAlwaysOn');
    } else {
        homeHint.textContent = t('hintIdle');
    }
    homeHint.classList.remove('hidden');
}

function setGpsStatus(state, message) {
    const map = {
        off: ['status-idle', 'gpsOff'],
        acquiring: ['status-warn', 'gpsAcquiring'],
        active: ['status-ok', message ? `GPS ${message}` : 'gpsOn'],
        lost: ['status-bad', 'gpsLost'],
        error: ['status-bad', message || 'gpsError'],
    };
    const [cls, key] = map[state] || map.off;
    const text = key === 'active' && message ? `GPS ${message}` : t(key);
    gpsStatus.className = `status-pill ${cls}`;
    gpsStatus.textContent = text;
    const tracking = engine.running;
    gpsStatus.setAttribute(
        'aria-label',
        tracking ? `${text}. ${t('gpsTapStop')}` : `${text}. ${t('gpsTapStart')}`
    );
}

function setTrackingBusy(busy) {
    startStopBtn.disabled = busy;
    gpsStatus.disabled = busy;
}

function renderLiveTripStats() {
    const s = getSettings();
    if (!recorder) {
        statDistance.textContent = formatDistance(0, s.unit);
        statDuration.textContent = '0:00';
        statAvg.textContent = '--';
        statMax.textContent = '--';
        return;
    }
    statDistance.textContent = formatDistance(recorder.distanceM, s.unit);
    statDuration.textContent = formatDuration(recorder.elapsedSeconds);
    statAvg.textContent = recorder.movingAvgKmh > 0 ? fmtSpeed(recorder.movingAvgKmh) : '--';
    statMax.textContent = recorder.maxKmh > 0 ? fmtSpeed(recorder.maxKmh) : '--';
}

function scoreClass(score) {
    if (score >= 85) return 'score-good';
    if (score >= 60) return 'score-mid';
    return 'score-bad';
}

async function renderTrips() {
    const s = getSettings();
    const trips = await loadTrips();
    const agg = aggregateStats(trips);

    el('total-distance').textContent = formatTotalNumber(agg.distanceM, s.unit);
    el('total-distance-label').textContent = `${distanceUnitShort(s.unit)} ${t('tripsTotal')}`;
    el('total-trips').textContent = agg.count;
    el('total-score').textContent = agg.avgScore ?? '--';

    clearHistoryBtn.classList.toggle('hidden', trips.length === 0);

    if (!trips.length) {
        tripList.innerHTML = `<div class="empty-list">${t('noTrips')}<br>${t('noTripsSub')}</div>`;
        return;
    }

    tripList.innerHTML = trips
        .map((trip) => {
            const over =
                trip.overspeedEpisodes > 0
                    ? `<div class="trip-overspeed">${t('overLimit')} ${trip.overspeedEpisodes}${t('times')} · ${formatDuration(trip.overspeedSec)} ${t('total')}</div>`
                    : '';
            const recovered = trip.recovered ? ` (${t('recovered')})` : '';
            return `
            <div class="trip-card">
                <div class="trip-card-head">
                    <span class="trip-date">${formatTripDateLocalized(trip.startedAt)}${recovered}</span>
                    <span class="trip-score ${scoreClass(trip.score)}">${trip.score}</span>
                </div>
                <div class="trip-metrics">
                    <span><b>${formatDistance(trip.distanceM, s.unit)}</b>${t('metricDistance')}</span>
                    <span><b>${formatDuration(trip.durationSec)}</b>${t('metricDuration')}</span>
                    <span><b>${trip.avgKmh ? fmtSpeed(trip.avgKmh) : '--'}</b>${t('metricAvg')}</span>
                    <span><b>${trip.maxKmh ? fmtSpeed(trip.maxKmh) : '--'}</b>${t('metricMax')}</span>
                </div>
                ${over}
            </div>`;
        })
        .join('');
}

async function pushWidgetUpdate() {
    const s = getSettings();
    const trips = await loadTrips();
    const last = trips[0];
    await updateWidget({
        limit: `${Math.round(kmhToUnit(s.thresholdKmh, s.unit))} ${unitLabel(s.unit)}`,
        lastTrip: last
            ? {
                  date: formatTripDateLocalized(last.startedAt),
                  distance: formatDistance(last.distanceM, s.unit),
                  avg: last.avgKmh ? fmtSpeed(last.avgKmh) : '--',
                  max: last.maxKmh ? fmtSpeed(last.maxKmh) : '--',
                  score: String(last.score),
              }
            : null,
    });
}

/* ---------------- tracking lifecycle ---------------- */

async function startTracking() {
    userStoppedMonitoring = false;
    setTrackingBusy(true);
    try {
        await alarm.unlockAudio();
        await ensureTrackingPermissions();

        recorder = new TripRecorder(getSettings().thresholdKmh);
        await engine.start();

        if (getSettings().keepAwake) await keepAwake(true);

        startStopBtn.textContent = t('stopTrip');
        startStopBtn.classList.add('stop');
        updateHomeHint();
        tripTicker = setInterval(renderLiveTripStats, 1000);
    } catch (err) {
        recorder = null;
        setGpsStatus('error', err.message);
    } finally {
        setTrackingBusy(false);
    }
}

async function stopTracking() {
    userStoppedMonitoring = true;
    setTrackingBusy(true);
    try {
        clearInterval(tripTicker);
        tripTicker = null;
        await engine.stop();
        alarm.reset();
        await keepAwake(false);

        if (recorder && isTripWorthSaving(recorder)) {
            await saveTrip(recorder.toTrip());
            await renderTrips();
            await pushWidgetUpdate();
        }
        recorder = null;

        speedValue.textContent = '--';
        gauge.setValue(0);
        renderLiveTripStats();
        startStopBtn.textContent = t('startTrip');
        startStopBtn.classList.remove('stop');
        updateHomeHint();
    } finally {
        setTrackingBusy(false);
    }
}

async function toggleTracking() {
    if (startStopBtn.disabled) return;
    if (engine.running) await stopTracking();
    else await startTracking();
}

/** Start GPS automatically when always-on is enabled and the user hasn't manually stopped. */
async function maybeAutoStartMonitoring() {
    const s = getSettings();
    if (!s.alwaysOnMonitoring || userStoppedMonitoring || engine.running || startStopBtn.disabled) {
        return;
    }
    await startTracking();
}

/* ---------------- engine events ---------------- */

engine.addEventListener('speed', (e) => {
    const { kmh, fix } = e.detail;
    const s = getSettings();
    const display = kmhToUnit(kmh, s.unit);
    speedValue.textContent = String(Math.round(display));
    gauge.setValue(display);

    alarm.update(
        kmh,
        s.thresholdKmh,
        fmtSpeed(kmh),
        fmtSpeed(s.thresholdKmh)
    );
    if (recorder) recorder.addSpeed(kmh, fix.time);
});

engine.addEventListener('fix', (e) => {
    if (recorder) recorder.addFix(e.detail);
});

engine.addEventListener('status', (e) => {
    const { state, message, code } = e.detail;
    setGpsStatus(state, message);
    if (state === 'lost') {
        speedValue.textContent = '--';
        gauge.setValue(0);
        alarm.reset();
    }
    if (state === 'error' && code === 'NOT_AUTHORIZED') {
        confirmDialog({
            title: t('dialogLocationTitle'),
            message: t('dialogLocationMsg'),
            confirmText: t('dialogOpenSettings'),
            cancelText: t('dialogNotNow'),
        }).then((ok) => {
            if (ok) openLocationSettings();
        });
    }
});

/* ---------------- UI events ---------------- */

startStopBtn.addEventListener('click', () => toggleTracking());
gpsStatus.addEventListener('click', () => toggleTracking());

muteBtn.addEventListener('click', () => alarm.mute());

limitChip.addEventListener('click', () => switchScreen('settings'));

thresholdInput.addEventListener('change', async () => {
    const s = getSettings();
    const val = Number(thresholdInput.value);
    if (!Number.isFinite(val)) {
        refreshLimitUI();
        return;
    }
    const thresholdKmh = Math.round(unitToKmh(val, s.unit));
    if (thresholdKmh < MIN_LIMIT_KMH || thresholdKmh > MAX_LIMIT_KMH) {
        refreshLimitUI();
        return;
    }
    await updateSettings({ thresholdKmh });
    if (recorder) recorder.limitKmh = thresholdKmh;
    refreshLimitUI();
    pushWidgetUpdate();
});

unitSelect.addEventListener('change', async () => {
    await updateSettings({ unit: unitSelect.value });
    applyLanguage();
    pushWidgetUpdate();
});

languageSelect.addEventListener('change', async () => {
    await updateSettings({ language: languageSelect.value });
    setLanguage(languageSelect.value);
    applyLanguage();
});

themeSelect.addEventListener('change', async () => {
    await updateSettings({ theme: themeSelect.value });
    initTheme(themeSelect.value);
});

for (const [id, key] of [
    ['toggle-sound', 'sound'],
    ['toggle-vibration', 'vibration'],
    ['toggle-notifications', 'notifications'],
    ['toggle-awake', 'keepAwake'],
]) {
    el(id).addEventListener('change', async (e) => {
        await updateSettings({ [key]: e.target.checked });
        if (key === 'notifications' && e.target.checked) ensureTrackingPermissions();
        if (key === 'keepAwake' && engine.running) keepAwake(e.target.checked);
    });
}

el('toggle-always-on').addEventListener('change', async (e) => {
    const enabled = e.target.checked;
    await updateSettings({ alwaysOnMonitoring: enabled });
    updateHomeHint();
    if (enabled) {
        userStoppedMonitoring = false;
        await maybeAutoStartMonitoring();
    }
});

el('toggle-boot-auto').addEventListener('change', async (e) => {
    const enabled = e.target.checked;
    await updateSettings({ bootAutoStart: enabled });
    if (isNative) await syncBootAutoStart(enabled);
    updateHomeHint();
});

clearHistoryBtn.addEventListener('click', async () => {
    const ok = await confirmDialog({
        title: t('dialogClearTitle'),
        message: t('dialogClearMsg'),
        confirmText: t('dialogDelete'),
        cancelText: t('dialogCancel'),
        danger: true,
    });
    if (!ok) return;
    await clearTrips();
    await renderTrips();
    await pushWidgetUpdate();
});

el('battery-settings-btn').addEventListener('click', () => openBatterySettings());

/* ---------------- tabs ---------------- */

function switchScreen(name) {
    for (const s of document.querySelectorAll('.screen')) {
        s.classList.toggle('active', s.id === `screen-${name}`);
    }
    for (const t of document.querySelectorAll('.tab')) {
        t.classList.toggle('active', t.dataset.screen === name);
    }
    if (name === 'trips') renderTrips();
}

for (const tab of document.querySelectorAll('.tab')) {
    tab.addEventListener('click', () => switchScreen(tab.dataset.screen));
}

/* ---------------- presets ---------------- */

function buildPresets() {
    presetRow.innerHTML = '';
    for (const kmh of NEPAL_LIMIT_PRESETS) {
        const btn = document.createElement('button');
        btn.className = 'preset-btn';
        btn.dataset.kmh = kmh;
        btn.addEventListener('click', async () => {
            await updateSettings({ thresholdKmh: kmh });
            if (recorder) recorder.limitKmh = kmh;
            refreshLimitUI();
            pushWidgetUpdate();
        });
        presetRow.appendChild(btn);
    }
    refreshPresetLabels();
}

function refreshPresetLabels() {
    const s = getSettings();
    for (const btn of presetRow.children) {
        const kmh = Number(btn.dataset.kmh);
        if (s.unit === 'kmh') {
            btn.textContent = presetLabel(kmh);
        } else {
            btn.textContent = Math.round(kmhToUnit(kmh, s.unit));
        }
    }
}

/* ---------------- boot ---------------- */

async function boot() {
    await loadSettings();
    initTheme(getSettings().theme || 'system');
    setLanguage(getSettings().language);
    buildPresets();
    applyLanguage();

    onLanguageChange(() => applyLanguage());

    const recovered = await recoverInterruptedTrip();
    await renderTrips();
    if (recovered) pushWidgetUpdate();

    setGpsStatus('off');

    onAppResume(() => maybeAutoStartMonitoring());

    if (!isNative && 'serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js').catch(() => {});
    }

    el('battery-settings-btn').classList.toggle('hidden', !isNative);
    el('toggle-boot-auto').closest('.toggle-row').classList.toggle('hidden', !isNative);

    if (isNative) {
        await syncBootAutoStart(getSettings().bootAutoStart);
        const { autoStart } = await consumeAutoStartFlag();
        if (autoStart) {
            userStoppedMonitoring = false;
            await startTracking();
            return;
        }
    }

    await maybeAutoStartMonitoring();
}

boot();
