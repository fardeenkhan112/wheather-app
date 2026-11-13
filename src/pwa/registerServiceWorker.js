/**
 * Registers the VitePWA-managed service worker and keeps registration resilient
 * in browsers or test environments without Service Worker support.
 */

import { registerSW } from 'virtual:pwa-register';

export function registerServiceWorker({ onOfflineReady, onNeedRefresh } = {}) {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const updateSW = registerSW({
      immediate: true,
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
      onRegisterError() {
        // Ignore service worker registration errors in restricted contexts
      },
    });
    return updateSW;
  } catch {
    return null;
  }
}
