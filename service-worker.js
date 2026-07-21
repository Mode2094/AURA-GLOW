self.addEventListener('install', function(e) {
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(clients.claim());
});

self.addEventListener('push', function(e) {
  var data = e.data ? e.data.json() : {};
  self.registration.showNotification(data.title || 'AURA GLOW', {
    body: data.body || 'طلب جديد',
    icon: '/logo.png',
    badge: '/logo.png',
    vibrate: [200, 100, 200],
    tag: 'aura-order-' + Date.now(),
    data: { url: data.url || '/mode/' }
  });
});

self.addEventListener('notificationclick', function(e) {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data.url || '/mode/'));
});
