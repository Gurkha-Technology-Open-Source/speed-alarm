const CACHE_NAME = 'speed-alarm-v6';
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './css/app.css',
    './js/app.js',
    './js/alarm.js',
    './js/gauge.js',
    './js/native.js',
    './js/settings.js',
    './js/speed-engine.js',
    './js/trips.js',
    './js/theme.js',
    './js/i18n.js',
    './js/dialog.js',
    './js/util.js',
    './privacy.html',
    './assets/alarm.mp3',
    './assets/icon.svg',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
            )
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
});
