// service-worker.js
const CACHE_NAME = 'speedometer-app-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/alarm.mp3'
];

self.addEventListener('install', event => {
    // Activate new SW immediately
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .catch(err => {
                // keep install from failing silently
                console.error('Service Worker install: cache.addAll failed', err);
            })
    );
});

self.addEventListener('activate', event => {
    // Remove old caches and take control of clients
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.map(key => {
                if (key !== CACHE_NAME) return caches.delete(key);
                return Promise.resolve();
            }))
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    // Only handle GET requests (safe for API/post/etc)
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            // Start a network fetch to update cache in background
            const networkFetch = fetch(event.request)
                .then(networkResponse => {
                    // Only cache valid successful same-origin responses
                    if (
                        networkResponse &&
                        networkResponse.status === 200 &&
                        event.request.url.startsWith(self.location.origin)
                    ) {
                        const cloned = networkResponse.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, cloned));
                    }
                    return networkResponse;
                })
                .catch(() => null);

            // Prefer cached response, otherwise use network result, otherwise fallback to index.html if available
            return cachedResponse || networkFetch.then(res => res) || caches.match('/index.html');
        })
    );
});
