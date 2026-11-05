/* VAL10 order push service worker */
self.addEventListener('install', event => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));

self.addEventListener('push', event => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; }
  catch (_) { payload = { title: 'VAL10 — New Order', body: event.data ? event.data.text() : 'A new order has arrived.' }; }

  const options = {
    body: payload.body || 'A new order has arrived.',
    icon: payload.icon || '/icons/valio-192.png',
    badge: payload.badge || '/icons/valio-96.png',
    tag: payload.tag || `val10-order-${Date.now()}`,
    renotify: true,
    requireInteraction: true,
    timestamp: Date.now(),
    data: { url: payload.url || '/admin?section=orders', orderId: payload.orderId || null }
  };
  event.waitUntil(self.registration.showNotification(payload.title || 'VAL10 — New Order', options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const targetUrl = new URL(event.notification.data?.url || '/admin?section=orders', self.location.origin).href;
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const adminWindow = windows.find(client => new URL(client.url).pathname.startsWith('/admin'));
    if (adminWindow) {
      await adminWindow.navigate(targetUrl);
      return adminWindow.focus();
    }
    return self.clients.openWindow(targetUrl);
  })());
});
