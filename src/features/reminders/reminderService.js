/**
 * Daily morning weather reminder service:
 * - Browser feature detection (Notifications, Service Worker, Push API)
 * - Explicit user-triggered permission request
 * - Local persistence & foreground daily scheduler with same-day deduplication
 * - Uses ServiceWorkerRegistration.showNotification() when available
 */

import { getLocalCalendarDateKey } from '../../utils/dateUtils.js';
import { readJson, writeJson } from '../../utils/storage.js';
import { validateReminderTime } from '../../utils/validation.js';

export const REMINDER_STORAGE_KEY = 'weatherboard_reminder_v1';

export const DEFAULT_REMINDER_SETTINGS = {
  enabled: false,
  time: '08:00',
  lastNotifiedDate: null,
};

export function getNotificationCapabilities() {
  const hasWindow = typeof window !== 'undefined';
  const notificationsSupported = hasWindow && 'Notification' in window;
  const serviceWorkerSupported =
    typeof navigator !== 'undefined' && 'serviceWorker' in navigator;
  const pushSupported = hasWindow && 'PushManager' in window;
  const permission = notificationsSupported ? window.Notification.permission : 'unsupported';

  return {
    notificationsSupported,
    serviceWorkerSupported,
    pushSupported,
    permission,
  };
}

export function loadReminderSettings() {
  const result = readJson(REMINDER_STORAGE_KEY, DEFAULT_REMINDER_SETTINGS);
  if (!result.ok || !result.data || typeof result.data !== 'object') {
    return {
      settings: { ...DEFAULT_REMINDER_SETTINGS },
      storageWarning: result.storageUnavailable
        ? 'Browser storage is unavailable. Reminder preferences will reset when you close this tab.'
        : null,
    };
  }

  const timeCheck = validateReminderTime(result.data.time);
  return {
    settings: {
      enabled: Boolean(result.data.enabled),
      time: timeCheck.isValid ? result.data.time : DEFAULT_REMINDER_SETTINGS.time,
      lastNotifiedDate:
        typeof result.data.lastNotifiedDate === 'string'
          ? result.data.lastNotifiedDate
          : null,
    },
    storageWarning: null,
  };
}

export function saveReminderSettings(settings) {
  const writeResult = writeJson(REMINDER_STORAGE_KEY, settings);
  return {
    ok: writeResult.ok,
    storageWarning: writeResult.ok
      ? null
      : 'Could not persist reminder settings to localStorage.',
  };
}

export async function requestNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  try {
    return await window.Notification.requestPermission();
  } catch {
    return window.Notification.permission || 'denied';
  }
}

export async function sendWeatherNotification({
  title,
  body,
  tag = 'weatherboard-daily-reminder',
}) {
  const capabilities = getNotificationCapabilities();
  if (!capabilities.notificationsSupported) {
    return {
      ok: false,
      reason: 'Notifications are not supported in this browser.',
    };
  }

  if (capabilities.permission !== 'granted') {
    return {
      ok: false,
      reason:
        capabilities.permission === 'denied'
          ? 'Notification permission is blocked in your browser site settings.'
          : 'Notification permission has not been granted yet.',
    };
  }

  const options = {
    body,
    tag,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    renotify: false,
    data: { url: '/' },
  };

  if (capabilities.serviceWorkerSupported) {
    try {
      const registration = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise((resolve) => setTimeout(() => resolve(null), 1500)),
      ]);
      if (registration && typeof registration.showNotification === 'function') {
        await registration.showNotification(title, options);
        return { ok: true, method: 'service-worker' };
      }
    } catch {
      // Fall back to standard Notification API below
    }
  }

  try {
    new window.Notification(title, options);
    return { ok: true, method: 'window-notification' };
  } catch (err) {
    return {
      ok: false,
      reason: err instanceof Error ? err.message : 'Unable to display notification.',
    };
  }
}

/**
 * Checks whether the daily morning reminder should fire right now while WeatherBoard is open.
 * Prevents duplicate notifications on the same local calendar day.
 */
export function shouldTriggerReminderToday(settings, now = new Date()) {
  if (!settings?.enabled) {
    return false;
  }

  const timeCheck = validateReminderTime(settings.time);
  if (!timeCheck.isValid) {
    return false;
  }

  const todayKey = getLocalCalendarDateKey(now);
  if (settings.lastNotifiedDate === todayKey) {
    return false;
  }

  const [targetHour, targetMinute] = settings.time.split(':').map(Number);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const targetMinutes = targetHour * 60 + targetMinute;

  return currentMinutes >= targetMinutes;
}
