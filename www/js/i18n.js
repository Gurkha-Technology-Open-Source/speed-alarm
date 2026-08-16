/**
 * Nepali (default) and English UI strings.
 */

const STRINGS = {
    ne: {
        appName: 'स्पिड अलार्म',
        tabSpeed: 'गति',
        tabTrips: 'यात्रा',
        tabSettings: 'सेटिङ',
        gpsOff: 'GPS बन्द',
        gpsOn: 'GPS चालु',
        gpsAcquiring: 'GPS खोज्दै…',
        gpsLost: 'GPS सिग्नल हरायो',
        gpsError: 'GPS त्रुटि',
        gpsTapStart: 'GPS बन्द। सुरु गर्न ट्याप गर्नुहोस्।',
        gpsTapStop: 'ट्याप गरेर रोक्नुहोस्।',
        gaugeLabel: 'स्पिडोमिटर',
        limit: 'सीमा',
        limitChange: 'गति सीमा परिवर्तन',
        overspeedBanner: 'बिस्तारै चलाउनुहोस् — सीमा नाघ्यो',
        mute: 'मौन',
        statDistance: 'दूरी',
        statDuration: 'अवधि',
        statAvg: 'औसत',
        statMax: 'अधिकतम',
        startTrip: 'यात्रा सुरु',
        stopTrip: 'यात्रा रोक',
        hintWeb: 'पृष्ठभूमि निगरानी Android एपमा मात्र उपलब्ध छ।',
        hintTracking: 'स्क्रिन बन्द भए पनि GPS पृष्ठभूमिमा चलिरहन्छ। स्थायी सूचना देखिनेछ।',
        hintAlwaysOn: 'सधैं-सक्रिय निगरानी सक्रिय छ — एप खोल्दा GPS स्वत: सुरु हुन्छ।',
        hintIdle: 'GPS ब्याज वा यात्रा सुरु ट्याप गर्नुहोस् (स्क्रिन बन्द पनि चल्छ)।',
        hintBoot: 'फोन रिबुट पछि GPS स्वत: सुरु हुनेछ।',
        tripsTotal: 'जम्मा',
        tripsCount: 'यात्रा',
        safetyScore: 'सुरक्षा अङ्क',
        clearHistory: 'इतिहास मेटाउनुहोस्',
        noTrips: 'अहिलेसम्म कुनै यात्रा छैन।',
        noTripsSub: 'पहिलो यात्रा रेकर्ड गर्न ट्र्याकिङ सुरु गर्नुहोस्।',
        overLimit: 'सीमा नाघ्यो',
        times: 'पटक',
        total: 'जम्मा',
        recovered: 'पुनः प्राप्त',
        today: 'आज',
        speedLimit: 'गति सीमा',
        limitsHint: 'नेपाल: पूर्वनिर्धारित ५० km/h। सडक अनुसार preset छान्नुहोस्। GPS बाट स्वचालित सीमा आउँदैछ।',
        units: 'एकाइ',
        alarmSound: 'अलार्म ध्वनि',
        vibration: 'कम्पन',
        overspeedNotif: 'गति सीमा नाघ्यो सूचना',
        keepAwake: 'ट्र्याकिङमा स्क्रिन जाग्रित राख्नुहोस्',
        alwaysOn: 'सधैं-सक्रिय निगरानी',
        alwaysOnSub: 'GPS स्वत: सुरु गर्छ र पृष्ठभूमिमा चलिरहन्छ (Android मा स्थायी सूचना)',
        bootAutoStart: 'रिबुट पछि स्वत: सुरु',
        bootAutoStartSub: 'फोन रिबुट भएपछि GPS निगरानी स्वत: सुरु गर्छ',
        language: 'भाषा',
        langNe: 'नेपाली',
        langEn: 'English',
        theme: 'थिम',
        themeSystem: 'सिस्टम (Auto)',
        themeLight: 'उज्यालो',
        themeDark: 'अँध्यारो',
        bgInfo: 'पृष्ठभूमि प्रयोग:',
        bgInfoText: 'Android मा GPS सुरु भएपछि स्क्रिन बन्द भए पनि निगरानी जारी रहन्छ। कम्पन र सूचना काम गर्छ; अलार्म ध्वनि फोन अनुसार फरक हुन सक्छ। ट्र्याकिङ रोकियो भने ब्याट्री सेटिङमा Speed Alarm लाई अप्रतिबन्धित प्रयोग दिनुहोस्।',
        batterySettings: 'ब्याट्री सेटिङ खोल्नुहोस्',
        privacy: 'गोपनीयता:',
        privacyText: 'सबै GPS र यात्रा डाटा तपाईंको फोनमै रहन्छ — सर्वरमा पठाइँदैन।',
        privacyLink: 'गोपनीयता नीति',
        tagline: 'नेपालका लागि यातायात सचेतना एप। सुरक्षित चलाउनुहोस् — सकुशल पुग्नुहोस्।',
        preset20: '२० · विद्यालय / आवासीय',
        preset40: '४० · सहरी',
        preset50: '५० · पूर्वनिर्धारित',
        preset60: '६० · अर्ध-सहरी',
        preset80: '८० · राजमार्ग',
        metricDistance: 'दूरी',
        metricDuration: 'अवधि',
        metricAvg: 'औसत',
        metricMax: 'अधिकतम',
        dialogLocationTitle: 'स्थान अनुमति चाहिन्छ',
        dialogLocationMsg: 'गति नाप्न Speed Alarm लाई स्थान अनुमति चाहिन्छ। सेटिङ खोल्ने?',
        dialogOpenSettings: 'सेटिङ खोल्नुहोस्',
        dialogNotNow: 'अहिले होइन',
        dialogClearTitle: 'यात्रा इतिहास मेटाउने?',
        dialogClearMsg: 'सबै यात्रा यो फोनबाट स्थायी रूपमा मेटिनेछ।',
        dialogDelete: 'सबै मेटाउनुहोस्',
        dialogCancel: 'रद्द',
        dialogOk: 'ठीक छ',
        notifBgTitle: 'Speed Alarm सक्रिय',
        notifBgMessage: 'तपाईंको गति निगरानी भइरहेको छ। सुरक्षित चलाउनुहोस्।',
        notifSlowDown: 'बिस्तारै चलाउनुहोस्!',
        notifOverspeedBody: 'तपाईं {speed} मा {limit} सीमामा हुनुहुन्छ।',
    },
    en: {
        appName: 'Speed Alarm',
        tabSpeed: 'Speed',
        tabTrips: 'Trips',
        tabSettings: 'Settings',
        gpsOff: 'GPS off',
        gpsOn: 'GPS on',
        gpsAcquiring: 'Acquiring GPS…',
        gpsLost: 'GPS signal lost',
        gpsError: 'GPS error',
        gpsTapStart: 'GPS off. Tap to start.',
        gpsTapStop: 'Tap to stop.',
        gaugeLabel: 'Speedometer',
        limit: 'LIMIT',
        limitChange: 'Change speed limit',
        overspeedBanner: 'SLOW DOWN — over the limit',
        mute: 'Mute',
        statDistance: 'Distance',
        statDuration: 'Duration',
        statAvg: 'Avg',
        statMax: 'Max',
        startTrip: 'Start trip',
        stopTrip: 'Stop trip',
        hintWeb: 'Background monitoring is only available in the Android app.',
        hintTracking: 'GPS runs in the background with the screen off. A persistent notification stays visible.',
        hintAlwaysOn: 'Always-on monitoring is enabled — GPS starts automatically when you open the app.',
        hintIdle: 'Tap the GPS badge or Start trip to monitor speed in the background (screen can be off).',
        hintBoot: 'GPS will auto-start after phone reboot when this is enabled.',
        tripsTotal: 'total',
        tripsCount: 'trips',
        safetyScore: 'safety score',
        clearHistory: 'Clear history',
        noTrips: 'No trips yet.',
        noTripsSub: 'Start tracking to record your first trip.',
        overLimit: 'Over the limit',
        times: '×',
        total: 'total',
        recovered: 'recovered',
        today: 'Today',
        speedLimit: 'Speed limit',
        limitsHint: 'Nepal: 50 km/h default. Choose a preset for your road type. Auto limits from GPS coming soon.',
        units: 'Units',
        alarmSound: 'Alarm sound',
        vibration: 'Vibration',
        overspeedNotif: 'Overspeed notifications',
        keepAwake: 'Keep screen awake while tracking',
        alwaysOn: 'Always-on monitoring',
        alwaysOnSub: 'Start GPS automatically and keep it running in the background (persistent notification on Android)',
        bootAutoStart: 'Auto-start after reboot',
        bootAutoStartSub: 'Restart speed monitoring automatically when the phone reboots',
        language: 'Language',
        langNe: 'नेपाली',
        langEn: 'English',
        theme: 'Theme',
        themeSystem: 'System (Auto)',
        themeLight: 'Light',
        themeDark: 'Dark',
        bgInfo: 'Background use:',
        bgInfoText: 'On Android, once GPS is on, monitoring continues with the screen off. Vibration and notifications work; alarm sound depends on your device. If tracking stops, allow unrestricted battery use for Speed Alarm.',
        batterySettings: 'Open battery settings',
        privacy: 'Privacy:',
        privacyText: 'All GPS and trip data stays on your device — nothing is sent to a server.',
        privacyLink: 'Privacy Policy',
        tagline: 'Traffic awareness app for Nepal. Drive safely — arrive alive.',
        preset20: '20 · school / residential',
        preset40: '40 · urban',
        preset50: '50 · default',
        preset60: '60 · semi-urban',
        preset80: '80 · highway',
        metricDistance: 'distance',
        metricDuration: 'duration',
        metricAvg: 'avg',
        metricMax: 'max',
        dialogLocationTitle: 'Location required',
        dialogLocationMsg: 'Speed Alarm needs location access to monitor your speed. Open settings to grant permission?',
        dialogOpenSettings: 'Open settings',
        dialogNotNow: 'Not now',
        dialogClearTitle: 'Clear trip history?',
        dialogClearMsg: 'All saved trips will be permanently deleted from this device.',
        dialogDelete: 'Delete all',
        dialogCancel: 'Cancel',
        dialogOk: 'OK',
        notifBgTitle: 'Speed Alarm is active',
        notifBgMessage: 'Monitoring your speed. Drive safely.',
        notifSlowDown: 'Slow down!',
        notifOverspeedBody: 'You are doing {speed} in a {limit} zone.',
    },
};

let lang = 'ne';
const listeners = new Set();

export function setLanguage(code) {
    lang = STRINGS[code] ? code : 'ne';
    document.documentElement.lang = lang === 'ne' ? 'ne' : 'en';
    for (const fn of listeners) fn(lang);
}

export function getLanguage() {
    return lang;
}

export function onLanguageChange(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
}

/** Translate a key. Supports `{name}` placeholders via second arg. */
export function t(key, vars) {
    const table = STRINGS[lang] || STRINGS.ne;
    let text = table[key] ?? STRINGS.en[key] ?? key;
    if (vars) {
        for (const [k, v] of Object.entries(vars)) {
            text = text.replace(`{${k}}`, v);
        }
    }
    return text;
}

/** Apply data-i18n attributes in the DOM. */
export function applyStaticI18n(root = document) {
    root.querySelectorAll('[data-i18n]').forEach((el) => {
        el.textContent = t(el.dataset.i18n);
    });
    root.querySelectorAll('[data-i18n-html]').forEach((el) => {
        const key = el.dataset.i18nHtml;
        if (key === 'privacyBlock') {
            el.innerHTML = `<strong>${t('privacy')}</strong> ${t('privacyText')} <a href="privacy.html" class="link">${t('privacyLink')}</a>`;
        } else if (key === 'bgBlock') {
            el.innerHTML = `<strong>${t('bgInfo')}</strong> ${t('bgInfoText')}`;
        }
    });
    root.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
        el.placeholder = t(el.dataset.i18nPlaceholder);
    });
    root.querySelectorAll('[data-i18n-aria]').forEach((el) => {
        el.setAttribute('aria-label', t(el.dataset.i18nAria));
    });
    document.title = t('appName');
}

export function presetLabel(kmh) {
    const map = { 20: 'preset20', 40: 'preset40', 50: 'preset50', 60: 'preset60', 80: 'preset80' };
    return t(map[kmh] || String(kmh));
}

export function formatTripDateLocalized(ts) {
    const d = new Date(ts);
    const today = new Date();
    const sameDay = d.toDateString() === today.toDateString();
    const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (sameDay) return `${t('today')} ${time}`;
    return `${d.toLocaleDateString(lang === 'ne' ? 'ne-NP' : undefined, { month: 'short', day: 'numeric' })} ${time}`;
}
