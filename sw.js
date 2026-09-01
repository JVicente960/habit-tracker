// Habit Tracker service worker
// Strategy: cache-first for the static app shell; NEVER cache the data API.
const CACHE = 'habit-tracker-v1';
const SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // Never handle the data API or non-GET requests — always go to the network,
  // so habit data is never served stale and PUT saves always hit Cloudflare.
  if (req.method !== 'GET' || url.pathname.startsWith('/api/')) {
    return; // falls through to the browser's default network fetch
  }

  // Cache-first for the app shell / static assets.
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(res => {
        // cache successful same-origin GETs for next time
        if (res.ok && url.origin === self.location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => cached); // offline and not cached → let it fail gracefully
    })
  );
});
