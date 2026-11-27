/* CarePoint Admin: keeps the app itself on the device so it opens with no network. Data sync is handled by the app. */
const CACHE = 'cp-shell-v2';
const SHELL = ['/', '/index.html', '/js/core.js', '/js/stock.js', '/js/modules.js', '/js/sample.js', '/js/app.js', '/vendor/xlsx.mini.min.js', '/icon.svg', '/icon-192.png', '/manifest.webmanifest'];
self.addEventListener('install', (e) => e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener('activate', (e) => e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin || u.pathname.startsWith('/api/')) return;
  // network first so updates arrive at once; fall back to the saved copy when offline
  e.respondWith(fetch(e.request).then((r) => { if (r.ok) { const c = r.clone(); caches.open(CACHE).then((x) => x.put(e.request, c)); } return r; }).catch(() => caches.match(e.request).then((m) => m || caches.match('/index.html'))));
});
