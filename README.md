# WeatherBoard

WeatherBoard is a client-side Progressive Web App (PWA) weather dashboard built with React, Vite, Tailwind CSS, and Workbox. Search for any city with debounced autocomplete, inspect live conditions and a 5-day forecast grouped in the city's local timezone, save up to five favourite cities across sessions, configure a daily morning weather reminder, and view the most recently loaded forecast offline.

## Screenshots

> Add genuine screenshots from your local or deployed build before submitting.

- Desktop dashboard (`1280px`): `docs/screenshots/desktop-1280.png` *(placeholder)*
- Tablet layout (`768px`): `docs/screenshots/tablet-768.png` *(placeholder)*
- Mobile layout (`375px`): `docs/screenshots/mobile-375.png` *(placeholder)*
- Offline mode banner & cached forecast: `docs/screenshots/offline-mode.png` *(placeholder)*

## Main Features

- **City Search Autocomplete**: Debounced (250ms) city search using the GeoDB Cities RapidAPI endpoint (with an explicitly labelled Open-Meteo geocoding fallback if `VITE_RAPIDAPI_KEY` is not set), in-memory query caching, `AbortController` stale-request cancellation, and full keyboard navigation (`ArrowDown`, `ArrowUp`, `Enter`, `Escape`).
- **Live Weather & 5-Day Forecast**: Primary integration with OpenWeatherMap (`/weather` and `/forecast`) plus automatic live fallback to Open-Meteo when OpenWeatherMap is unconfigured, rate-limited, or fails. All 3-hour forecast entries are grouped by the selected city's local UTC offset.
- **Saved Favourite Cities**: Pin up to 5 favourite cities in `localStorage` with duplicate prevention, accessible confirmation dialogs before removal, and graceful in-memory fallback if storage is blocked or corrupted.
- **Daily Morning Reminder**: Configurable local reminder time (`HH:MM`) with explicit permission explanation, `ServiceWorkerRegistration.showNotification()` support, a test notification trigger, same-day deduplication, and honest foreground scheduling disclosure.
- **PWA & Offline Support**: Custom Workbox service worker (`vite-plugin-pwa` `injectManifest`) precaching the app shell, runtime caching successful weather API responses (`status 200` only), persisting the last-viewed normalized snapshot for offline access, and offering a refresh prompt upon reconnection.
- **Theme & Temperature Units**: Flash-free light/dark theme detection and toggle, plus live Celsius (`°C`) and Fahrenheit (`°F`) unit switching.

## Technology Stack

- **UI & Build**: React 19, Vite 8, JavaScript (JSX), HTML5, CSS3, Tailwind CSS 4
- **Icons**: `lucide-react`
- **PWA & Offline**: `vite-plugin-pwa`, Workbox (`workbox-precaching`, `workbox-routing`, `workbox-strategies`, `workbox-expiration`, `workbox-cacheable-response`, `workbox-core`)
- **Testing**: Vitest, React Testing Library, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`
- **Browser APIs**: Fetch API, `AbortController`, `localStorage`, `Intl.DateTimeFormat`, Service Worker API, Cache Storage, Notifications API, Push API feature detection

## Project Architecture

```text
public/
  apple-touch-icon.png
  icon.svg
  icons/
    icon-192.png
    icon-512.png
    icon-maskable-512.png
src/
  app/
    App.jsx
  components/
    CitySearch.jsx
    ConfirmDialog.jsx
    CurrentWeather.jsx
    EmptyState.jsx
    ErrorState.jsx
    FavouriteCities.jsx
    Forecast.jsx
    Header.jsx
    LoadingState.jsx
    OfflineBanner.jsx
    ReminderSettings.jsx
    WeatherDetails.jsx
    WeatherIcon.jsx
  features/
    favourites/
      favouritesStorage.js
    reminders/
      reminderService.js
    search/
      citySearchService.js
    weather/
      weatherCodes.js
      weatherNormalizer.js
      weatherService.js
  hooks/
    useCitySearch.js
    useFavourites.js
    useOnlineStatus.js
    usePWAInstall.js
    useTemperatureUnit.js
    useTheme.js
    useWeather.js
  pwa/
    registerServiceWorker.js
  services/
    api/
      geoDbApi.js
      openMeteoApi.js
      openWeatherApi.js
  styles/
    index.css
  test/
    citySearch.test.jsx
    favouritesStorage.test.js
    offlineAndReminders.test.jsx
    setupTests.js
    validation.test.js
    weatherNormalizer.test.js
  utils/
    dateUtils.js
    storage.js
    temperatureUtils.js
    validation.js
  main.jsx
  sw.js
```

## APIs Used and Their Purposes

1. **GeoDB Cities API (via RapidAPI)** (`https://wft-geo-db.p.rapidapi.com/v1/geo/cities`): City prefix autocomplete sorted by population (`types=CITY`, `limit=6`), returning city name, region, country, and coordinates (`latitude`, `longitude`). Free Basic tier allows 1,000 requests/day and 1 request/second.
2. **OpenWeatherMap API** (`https://api.openweathermap.org/data/2.5/weather` & `/forecast`): Primary weather provider when `VITE_OPENWEATHER_API_KEY` is configured (`units=metric`).
3. **Open-Meteo Weather API** (`https://api.open-meteo.com/v1/forecast`): Keyless live fallback provider whenever OpenWeatherMap is unconfigured, rate-limited, or unavailable.
4. **Open-Meteo Geocoding API** (`https://geocoding-api.open-meteo.com/v1/search`): Clearly labelled development fallback for city search only when `VITE_RAPIDAPI_KEY` is missing.

## API Key Setup Instructions

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Add your API keys in `.env.local`:
   - **OpenWeatherMap**: Create a free account at [openweathermap.org/api](https://openweathermap.org/api) and copy your API key into `VITE_OPENWEATHER_API_KEY`.
   - **RapidAPI GeoDB Cities**: Subscribe to the Basic (free) plan for [GeoDB Cities on RapidAPI](https://rapidapi.com/wirefreethought/api/geodb-cities) and copy your `X-RapidAPI-Key` into `VITE_RAPIDAPI_KEY`.
3. Never commit `.env.local` (it is ignored by `.gitignore`).

## Local Installation Instructions

```bash
npm install
```

## Development Commands

```bash
npm run dev
```

Starts the Vite development server on port `3000` (`http://localhost:3000`). Service worker dev mode is enabled in `vite.config.js`.

## Test Commands

```bash
npm run test
```

Runs the Vitest unit and React Testing Library test suite. For watch mode during development:

```bash
npm run test:watch
```

## Production Build Command

```bash
npm run build
```

Outputs the static production bundle, manifest (`dist/manifest.webmanifest`), and compiled Workbox service worker (`dist/sw.js`) to `dist/`. You can inspect the production build locally using:

```bash
npm run preview
```

## Deployment Instructions (Vercel)

1. Push this repository to a public GitHub repository (verify `.env.local` is not tracked).
2. Import the repository into [Vercel](https://vercel.com).
3. Keep the detected **Vite** framework preset:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add environment variables in **Project Settings → Environment Variables**:
   - `VITE_OPENWEATHER_API_KEY`
   - `VITE_RAPIDAPI_KEY`
5. Deploy. `vercel.json` configures SPA rewrites and ensures `/sw.js` is served with `Cache-Control: public, max-age=0, must-revalidate` over HTTPS.

## PWA and Offline Behaviour

- **App Shell Precaching**: Workbox precaches HTML, JS, CSS, SVG, and PNG icons (`192x192`, `512x512`, maskable `512x512`, and `180x180` Apple touch icon).
- **Weather API Caching**: `src/sw.js` uses a `NetworkFirst` strategy (5s network timeout) with `CacheableResponsePlugin({ statuses: [200] })` so failed or rate-limited responses are never cached as valid weather.
- **Last-Viewed Snapshot**: Every successful normalized weather fetch is also persisted to `localStorage` (`weatherboard_last_weather_v1`). When offline (`navigator.onLine === false`), WeatherBoard renders an offline banner with the snapshot's last-updated time, or a clear offline empty state if no city has been viewed yet.
- **Online Recovery**: When connectivity returns while cached data is displayed, WeatherBoard offers a one-click **Refresh weather** action.

## Notification Behaviour and Limitations

- WeatherBoard detects `Notification`, `navigator.serviceWorker`, and `PushManager` support without breaking any weather features if unsupported or denied.
- Permission is requested only after an explicit user click, preceded by a plain-language explanation.
- Notifications are dispatched via `ServiceWorkerRegistration.showNotification()` when an active service worker is available (with fallback to `new Notification()`).
- **Client-Only Limitation**: Because WeatherBoard has no custom backend, scheduled daily morning reminders run in the **foreground** (checked every 30 seconds while WeatherBoard is open) and deduplicate per local calendar day. A browser cannot wake a closed tab at an arbitrary time via `setTimeout`/`setInterval` alone.
- **Completing Closed-Tab Daily Push**: `src/sw.js` already includes a `push` event listener and `notificationclick` handler. To support closed-tab delivery in a future full-stack version:
  1. Generate a VAPID keypair on a backend server (keeping the private VAPID key strictly on the server—never in frontend code).
  2. Subscribe via `registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey })` and send the subscription + user timezone/reminder time to the backend.
  3. Trigger a scheduled server cron/worker (e.g. Supabase Edge Functions, Cloudflare Workers Cron, or Web Push with `web-push`) to send encrypted push payloads at the user's chosen morning time.

## Security and API-Key Exposure Notes

- In a Vite client-only SPA, all `import.meta.env.VITE_*` variables are embedded into the public JavaScript bundle during build and are visible in browser network requests.
- Do **not** store private credentials or private VAPID keys in `VITE_*` variables.
- Restrict your OpenWeatherMap and RapidAPI keys where supported (HTTP referrer / domain restrictions and quota caps) when deploying publicly.

## Known Limitations

- **GeoDB Free Tier Rate Limit**: GeoDB Cities Basic tier allows 1 request/second and 1,000 requests/day. Rapid typing beyond cached queries can hit `429 Too Many Requests`; WeatherBoard mitigates this with 250ms debouncing, `AbortController`, and in-memory result caching.
- **Foreground-Only Reminders**: Daily reminders require WeatherBoard to remain open in a browser tab in this client-only architecture.
- **Preview Temperature Indicators**: Saved favourite city cards display cached temperature previews once those cities have been loaded, avoiding extra background API calls on initial page load that could exhaust free-tier quotas.

## Manual QA Checklist

- [ ] Fresh load shows clean welcome state (or auto-loads last-viewed city).
- [ ] City autocomplete triggers after >= 2 characters, caches results, and supports keyboard navigation (`ArrowDown`, `ArrowUp`, `Enter`, `Escape`).
- [ ] Search `Karachi`, another country, ambiguous names, and nonsense string (no-results state).
- [ ] Test missing API keys (`VITE_RAPIDAPI_KEY` / `VITE_OPENWEATHER_API_KEY`) and confirm honest fallback messaging.
- [ ] Verify 5-day forecast displays 5 distinct local dates matching the searched city's timezone.
- [ ] Toggle `°C` / `°F` and Light / Dark mode; reload to verify persistence without theme flash.
- [ ] Save 5 favourite cities, verify 6th attempt shows clear limit message, remove one via confirmation dialog, and reload to verify persistence.
- [ ] Simulate blocked `localStorage` and verify graceful in-memory fallback.
- [ ] Switch browser to Offline, reload app, verify offline banner + cached city weather; switch back Online and click Refresh.
- [ ] Test notification permission grant, denial, test notification, and foreground reminder time validation.
- [ ] Verify responsive layout, >= 44x44px touch targets, and zero horizontal overflow at `375px`, `768px`, and `1280px`.

## Live Deployment URL

> Pending Vercel deployment: `https://<your-vercel-deployment-url>.vercel.app` *(placeholder — deploy to populate)*
