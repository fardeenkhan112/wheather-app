
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import {
  cleanupOutdatedCaches,
  precacheAndRoute,
} from 'workbox-precaching';
import {
  NavigationRoute,
  registerRoute,
} from 'workbox-routing';
import {
  CacheFirst,
  NetworkFirst,
} from 'workbox-strategies';

// Activate new service workers immediately and take control of open tabs.
self.skipWaiting();
clientsClaim();

// 1. APP NAVIGATION: Always try the network first.
// This prevents visitors from repeatedly receiving an old cached HTML shell.
// If offline, use the latest previously cached application shell.
registerRoute(
  new NavigationRoute(
    new NetworkFirst({
      cacheName: 'weatherboard-navigation-v2',
      networkTimeoutSeconds: 8,
      plugins: [
        new CacheableResponsePlugin({
          statuses: [200],
        }),
        new ExpirationPlugin({
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 7,
        }),
      ],
    }),
    {
      denylist: [/^\/api\//],
    }
  )
);

// 2. PRECACHE APP SHELL AND HASHED BUILD ASSETS.
precacheAndRoute(self.__WB_MANIFEST || []);
cleanupOutdatedCaches();

// 3. WEATHER API CACHE.
registerRoute(
  ({ url, request }) =>
    request.method === 'GET' &&
    (
      url.hostname === 'api.openweathermap.org' ||
      url.hostname === 'api.open-meteo.com'
    ),
  new NetworkFirst({
    cacheName: 'weatherboard-api-cache-v1',
    networkTimeoutSeconds: 5,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [200],
      }),
      new ExpirationPlugin({
        maxEntries: 25,
        maxAgeSeconds: 60 * 60 * 24,
      }),
    ],
  })
);

// 4. GOOGLE FONTS CACHE.
registerRoute(
  ({ url }) =>
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'weatherboard-fonts-cache-v1',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 12,
        maxAgeSeconds: 60 * 60 * 24 * 365,
      }),
    ],
  })
);

// 5. PUSH NOTIFICATION HANDLER.
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
      data: {
        url: payload.url,
      },
    })
  );
});

// 6. NOTIFICATION CLICK.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification?.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
    }).then((clientsList) => {
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
