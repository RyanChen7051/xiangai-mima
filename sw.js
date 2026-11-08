/* 享爱密码 PWA · Service Worker
   策略：同源 GET 走 network-first，离线回退缓存；导航请求离线回退 index.html。
   跨域请求一律不缓存。 */
const CACHE_NAME = 'xiangai-mima-v5';
const PRECACHE = [
  './',
  './index.html',
  './app.css',
  './app.js',
  './prototype.html',
  './cloud-config.js',
  './legal-model.js',
  './app-cloud.js',
  './assets/logo-badge-320.png',
  './manifest.webmanifest',
  './assets/icon-192.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(new URL('index.html', self.registration.scope).href, copy));
          return res;
        })
        .catch(() => caches.match(new URL('index.html', self.registration.scope).href))
    );
    return;
  }

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req))
  );
});
