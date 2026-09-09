self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
    if (!event.data) return;

    let payload = {};
    try {
        payload = event.data.json();
    } catch (e) {
        payload = {
            title: 'InstaPay',
            body: event.data.text()
        };
    }

    const title = payload.title || 'InstaPay Alert';
    const options = {
        body: payload.body || 'You have a new update in InstaPay.',
        icon: payload.icon || '/apple-touch-icon.png',
        badge: payload.badge || '/fav.png',
        data: payload.data || {},
        vibrate: [100, 50, 100],
        renotify: true,
        tag: payload.data?.link_id ? `notif-${payload.data.link_id}` : `notif-${Date.now()}`
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const targetUrl = event.notification.data?.url || '/';

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if ('focus' in client) {
                    if (targetUrl && client.url.includes(self.location.origin)) {
                        client.navigate(targetUrl);
                    }
                    return client.focus();
                }
            }
            if (self.clients.openWindow) {
                return self.clients.openWindow(targetUrl);
            }
        })
    );
});
