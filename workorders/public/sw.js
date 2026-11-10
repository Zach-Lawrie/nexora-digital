/* Basa work orders: service worker for phone and desktop notifications */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
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
