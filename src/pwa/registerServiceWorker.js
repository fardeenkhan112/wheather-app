
import { registerSW } from 'virtual:pwa-register';

/**
 * Registers the PWA service worker.
 *
 * Checks for updates on registration, when the user returns
 * to the application, and when internet connectivity returns.
 *
 * Reloads an already-controlled page when a new service worker
 * takes control, avoiding an old JavaScript application remaining open.
 */

let hasReloadedAfterUpdate = false;

export function registerServiceWorker({
  onOfflineReady,
  onNeedRefresh,
} = {}) {
  if (
    typeof window === 'undefined' ||
    !('serviceWorker' in navigator)
  ) {
    return null;
  }

  // Remember whether an existing service worker controlled this page.
  const hadControllerAtStartup = Boolean(
    navigator.serviceWorker.controller
  );

  // Reload an existing page once when a new worker takes control.
  if (hadControllerAtStartup) {
    navigator.serviceWorker.addEventListener(
      'controllerchange',
      () => {
        if (hasReloadedAfterUpdate) return;

        hasReloadedAfterUpdate = true;
        window.location.reload();
      }
    );
  }

  try {
    const updateSW = registerSW({
      immediate: true,

      onRegisteredSW(_swUrl, registration) {
        if (!registration) return;

        let lastUpdateCheck = 0;

        const checkForUpdates = () => {
          if (!navigator.onLine) return;

          if (document.visibilityState === 'hidden') return;

          // Avoid repeatedly checking during rapid focus/visibility events.
          const now = Date.now();

          if (now - lastUpdateCheck < 30000) return;

          lastUpdateCheck = now;

          registration.update().catch(() => {
            // A failed update check must not break the application.
          });
        };

        // Check immediately after registration.
        checkForUpdates();

        // Check when the user returns to the application.
        window.addEventListener('focus', checkForUpdates);

        // Check when network connectivity returns.
        window.addEventListener('online', checkForUpdates);

        // Check when the tab becomes visible again.
        document.addEventListener(
          'visibilitychange',
          checkForUpdates
        );
      },

      onOfflineReady() {
        if (typeof onOfflineReady === 'function') {
          onOfflineReady();
        }
      },

      onNeedRefresh() {
        if (typeof onNeedRefresh === 'function') {
          onNeedRefresh();
        }
      },

      onRegisterError(_error) {
        // Keep the application usable if registration fails.
      },
    });

    return updateSW;
  } catch {
    return null;
  }
}
