const CACHE = 'recipes-v1';
const ASSETS = [
  './index.html',
  './manifest.json',
  './icon.png',
  './icon-192.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Only cache same-origin requests, let API calls through
  if (!e.request.url.startsWith(self.location.origin)) return;
  if (e.request.url.includes('api.anthropic.com')) return;

  e.respondWith(
    caches.open(CACHE).then(c =>
      c.match(e.request).then(cached => {
        const fresh = fetch(e.request)
          .then(res => { c.put(e.request, res.clone()); return res; })
          .catch(() => cached);
        return cached || fresh;
      })
    )
  );
});

