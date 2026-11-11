/* Basa work orders: service worker for phone and desktop notifications */
/* offline: the app shell is cached; job data falls back to the last copy when there is no signal */
const SHELL = 'basa-shell-v3', DATA = 'basa-api';
const FILES = ['/', '/app.js', '/app.css', '/icon.svg', '/icon-192.png', '/manifest.webmanifest', '/report.html'];
self.addEventListener('install', (e) => { self.skipWaiting(); e.waitUntil(caches.open(SHELL).then((c) => c.addAll(FILES)).catch(() => {})); });
self.addEventListener('activate', (e) => e.waitUntil((async () => { for (const k of await caches.keys()) if (k.startsWith('basa-shell') && k !== SHELL) await caches.delete(k); await self.clients.claim(); })()));
const API_CACHE = /^\/api\/(me|lookups|dashboard|wo|wo\/\d+|notifications|stores|cm|projects(\/\d+)?|labour|photo\/\d+)$/;
self.addEventListener('fetch', (e) => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url); if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) {
    if (!API_CACHE.test(url.pathname)) return;
    e.respondWith((async () => {
      try { const r = await fetch(req); if (r.ok) { const c = await caches.open(DATA); c.put(req, r.clone()); } return r; }
      catch (err) { const hit = await caches.match(req); if (hit) return hit; return new Response(JSON.stringify({ error: 'You are offline and this page has not been opened before on this phone.' }), { status: 503, headers: { 'content-type': 'application/json' } }); }
    })());
    return;
  }
  e.respondWith((async () => {
    const c = await caches.open(SHELL), key = url.pathname === '/index.html' ? '/' : url.pathname;
    const hit = await c.match(key);
    const net = fetch(req).then((r) => { if (r.ok && FILES.includes(key)) c.put(key, r.clone()); return r; }).catch(() => null);
    if (hit) { e.waitUntil(net); return hit; }
    return (await net) || (req.mode === 'navigate' ? c.match('/') : new Response('Offline', { status: 503 }));
  })());
});
self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) { d = { body: e.data ? e.data.text() : '' }; }
  e.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const open = wins.find((c) => c.focused && c.visibilityState === 'visible');
    if (open) { open.postMessage({ type: 'push', d }); return; } // the open app shows it as a live alert
    await self.registration.showNotification(d.title || 'Work orders', {
      body: d.body || '', icon: '/icon-192.png', badge: '/icon-192.png', tag: d.tag, renotify: !!d.tag,
      requireInteraction: !!d.urgent, vibrate: d.urgent ? [200, 100, 200, 100, 300] : [150], data: { url: d.url || '/#/' },
    });
  })());
});
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || '/#/', self.location.origin).href;
  e.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const w = wins.find((c) => new URL(c.url).origin === self.location.origin);
    if (w) { await w.focus(); w.postMessage({ type: 'go', url }); return; }
    await self.clients.openWindow(url);
  })());
});
