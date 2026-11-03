const CACHE_NAME = 'medistock-v28';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './db.js',
  './dotacion.js',
  './material_catalog.js',
  './sync.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './bg-medical.jpg',
  './header-doodles.png',
  './vendor-html5-qrcode.min.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Cache one-by-one so a single failure does not break offline
    for (const url of ASSETS) {
      try {
        await cache.add(url);
      } catch (e) {
        console.log('SW skip cache', url, e);
      }
    }
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // API sync: network only (fail gracefully offline in app)
  if (url.pathname.includes('/api/')) {
    event.respondWith(
      fetch(req).catch(() => new Response(JSON.stringify({ offline: true }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }))
    );
    return;
  }

  // Navigation: app shell offline
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        return (await cache.match('./index.html')) || (await cache.match('index.html')) || (await cache.match('./'));
      })
    );
    return;
  }

  // Same-origin: cache first, then network
  if (url.origin === self.location.origin) {
    event.respondWith((async () => {
      const cached = await caches.match(req);
      if (cached) return cached;
      try {
        const res = await fetch(req);
        if (res && res.status === 200) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(req, res.clone());
        }
        return res;
      } catch (e) {
        // fallback index for HTML
        if (req.headers.get('accept') && req.headers.get('accept').includes('text/html')) {
          const cache = await caches.open(CACHE_NAME);
          return (await cache.match('./index.html')) || (await cache.match('index.html'));
        }
        return new Response('Offline', { status: 503 });
      }
    })());
    return;
  }

  // External (CDN): cache if available
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      if (res && res.status === 200) {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(req, clone));
      }
      return res;
    }).catch(() => cached))
  );
});
