import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst } from 'workbox-strategies';

self.skipWaiting();
clientsClaim();

// Precache app shell and static build assets injected by vite-plugin-pwa
precacheAndRoute(self.__WB_MANIFEST || []);
cleanupOutdatedCaches();

// Runtime cache for OpenWeatherMap & Open-Meteo weather API responses.
// Only status 200 responses are cached so failed/rate-limited responses are never stored.
registerRoute(
  ({ url, request }) =>
    request.method === 'GET' &&
    (url.hostname === 'api.openweathermap.org' || url.hostname === 'api.open-meteo.com'),
  new NetworkFirst({
    cacheName: 'weatherboard-api-cache-v1',
    networkTimeoutSeconds: 5,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [200],
      }),
      new ExpirationPlugin({
        maxEntries: 25,
        maxAgeSeconds: 60 * 60 * 24, // 24 hours
      }),
    ],
  })
);

// Runtime cache for Google Fonts stylesheets and font files
registerRoute(
  ({ url }) =>
    url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'weatherboard-fonts-cache-v1',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 12,
        maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
      }),
    ],
  })
);

// Push event handler ready for a future VAPID push server / managed push provider.
self.addEventListener('push', (event) => {
  let payload = {
    title: 'WeatherBoard Daily Forecast',
    body: 'Open WeatherBoard to view today’s forecast.',
    url: '/',
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      payload = {
        title: parsed.title || payload.title,
        body: parsed.body || payload.body,
        url: parsed.url || payload.url,
      };
    } catch {
      const text = event.data.text();
      if (text) {
        payload.body = text;
      }
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: 'weatherboard-push-reminder',
      data: { url: payload.url },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification?.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsList) => {
      for (const client of clientsList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
      return undefined;
    })
  );
});
