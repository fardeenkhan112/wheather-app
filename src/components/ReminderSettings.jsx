import { useEffect, useId, useState } from 'react';
import { Bell, BellOff, CheckCircle2, Info, Send, ShieldAlert } from 'lucide-react';
import {
  getNotificationCapabilities,
  loadReminderSettings,
  requestNotificationPermission,
  saveReminderSettings,
  sendWeatherNotification,
  shouldTriggerReminderToday,
} from '../features/reminders/reminderService.js';
import { getLocalCalendarDateKey } from '../utils/dateUtils.js';
import { formatTemperature } from '../utils/temperatureUtils.js';
import { validateReminderTime } from '../utils/validation.js';

export function ReminderSettings({ weather, unit }) {
  const timeInputId = useId();
  const [capabilities, setCapabilities] = useState(() => getNotificationCapabilities());
  const [initialLoaded] = useState(() => loadReminderSettings());
  const [settings, setSettings] = useState(initialLoaded.settings);
  const [timeInput, setTimeInput] = useState(initialLoaded.settings.time);
  const [timeError, setTimeError] = useState(null);
  const [statusMessage, setStatusMessage] = useState(() =>
    initialLoaded.storageWarning
      ? { type: 'warning', text: initialLoaded.storageWarning }
      : null
  );
  const [isSendingTest, setIsSendingTest] = useState(false);

  const buildSummaryText = () => {
    if (weather?.city && weather?.current) {
      const temp = formatTemperature(weather.current.tempC, unit);
      return `${weather.city.name}: ${temp}, ${weather.current.conditionLabel}.`;
    }
    return 'Open WeatherBoard to check today’s latest local forecast.';
  };

  // Foreground scheduler while WeatherBoard remains open
  useEffect(() => {
    if (!settings.enabled || capabilities.permission !== 'granted') {
      return undefined;
    }

    const checkAndNotify = async () => {
      const now = new Date();
      if (!shouldTriggerReminderToday(settings, now)) {
        return;
      }

      const result = await sendWeatherNotification({
        title: 'WeatherBoard Morning Forecast',
        body: buildSummaryText(),
        tag: `weatherboard-daily-${getLocalCalendarDateKey(now)}`,
      });

      if (result.ok) {
        const updated = {
          ...settings,
          lastNotifiedDate: getLocalCalendarDateKey(now),
        };
        setSettings(updated);
        saveReminderSettings(updated);
      }
    };

    checkAndNotify();
    const intervalId = setInterval(checkAndNotify, 30000);
    return () => clearInterval(intervalId);
  }, [settings, capabilities.permission, weather, unit]);

  const handleRequestPermission = async () => {
    const result = await requestNotificationPermission();
    setCapabilities(getNotificationCapabilities());
    if (result === 'granted') {
      setStatusMessage({
        type: 'success',
        text: 'Notifications enabled. Save a reminder time below or send a test notification.',
      });
    } else if (result === 'denied') {
      setStatusMessage({
        type: 'warning',
        text: 'Notification permission was denied. You can re-enable it anytime in browser site settings.',
      });
    }
  };

  const handleToggleEnabled = async () => {
    if (!settings.enabled && capabilities.notificationsSupported && capabilities.permission === 'default') {
      const permission = await requestNotificationPermission();
      setCapabilities(getNotificationCapabilities());
      if (permission !== 'granted') {
        setStatusMessage({
          type: 'warning',
          text: 'Permission is required to show notifications. Weather features remain unaffected.',
        });
        return;
      }
    }

    const next = {
      ...settings,
      enabled: !settings.enabled,
    };
    setSettings(next);
    const saved = saveReminderSettings(next);
    setStatusMessage({
      type: saved.ok ? 'info' : 'warning',
      text: saved.ok
        ? next.enabled
          ? `Morning reminder enabled for ${next.time} (active while WeatherBoard is open).`
          : 'Daily morning reminder paused.'
        : saved.storageWarning,
    });
  };

  const handleTimeBlur = () => {
    const check = validateReminderTime(timeInput);
    setTimeError(check.isValid ? null : check.error);
  };

  const handleSaveTime = (event) => {
    event.preventDefault();
    const check = validateReminderTime(timeInput);
    if (!check.isValid) {
      setTimeError(check.error);
      return;
    }

    setTimeError(null);
    const next = {
      ...settings,
      time: timeInput.trim(),
    };
    setSettings(next);
    const saved = saveReminderSettings(next);
    setStatusMessage({
      type: saved.ok ? 'success' : 'warning',
      text: saved.ok
        ? `Reminder time saved for ${next.time} local time.`
        : saved.storageWarning,
    });
  };

  const handleTestNotification = async () => {
    setIsSendingTest(true);
    try {
      const result = await sendWeatherNotification({
        title: 'WeatherBoard Test Notification',
        body: buildSummaryText(),
        tag: 'weatherboard-test-notification',
      });
      setStatusMessage({
        type: result.ok ? 'success' : 'warning',
        text: result.ok
          ? `Test notification sent via ${result.method === 'service-worker' ? 'Service Worker' : 'Browser Notifications'}.`
          : result.reason,
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  const permissionLabel = {
    granted: 'Allowed',
    denied: 'Blocked in browser',
    default: 'Not yet requested',
    unsupported: 'Not supported',
  }[capabilities.permission];

  return (
    <section
      aria-labelledby="reminder-heading"
      className="rounded-2xl border border-[#E6EAF1] bg-white p-5 dark:border-[#1F2B3E] dark:bg-[#111827]"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-[#4778E8] dark:text-[#5C8DF6]" aria-hidden="true" />
          <h2 id="reminder-heading" className="text-sm font-semibold text-[#172033] dark:text-[#F1F5F9]">
            Daily morning reminder
          </h2>
        </div>
        <span className="text-xs text-[#697386] dark:text-[#94A3B8]">
          {permissionLabel}
        </span>
      </div>

      {!capabilities.notificationsSupported ? (
        <div className="mt-3 rounded-xl border border-[#E6EAF1] bg-[#F5F7FB] p-3.5 text-xs leading-relaxed text-[#697386] dark:border-[#1F2B3E] dark:bg-[#0B1120] dark:text-[#94A3B8]">
          <p className="flex items-center gap-1.5 font-medium text-[#172033] dark:text-[#F1F5F9]">
            <BellOff className="h-4 w-4" aria-hidden="true" />
            Notifications unavailable in this browser
          </p>
          <p className="mt-1">
            Your browser does not support the Web Notifications API. All weather search, forecast, and favourite features continue to work normally.
          </p>
        </div>
      ) : (
        <div className="mt-3 space-y-4">
          {capabilities.permission === 'default' && (
            <div className="rounded-xl border border-[#E6EAF1] bg-[#F5F7FB] p-3.5 text-xs leading-relaxed text-[#697386] dark:border-[#1F2B3E] dark:bg-[#0B1120] dark:text-[#94A3B8]">
              <p className="font-medium text-[#172033] dark:text-[#F1F5F9]">
                Why WeatherBoard asks for notification permission
              </p>
              <p className="mt-1">
                Morning reminders show a single summary with today&rsquo;s temperature and sky condition for your selected city. Permission is only requested when you click below.
              </p>
              <button
                type="button"
                onClick={handleRequestPermission}
                className="mt-3 inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-[#4778E8] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#3866D1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4778E8] dark:bg-[#5C8DF6] dark:hover:bg-[#4778E8]"
              >
                <Bell className="h-3.5 w-3.5" aria-hidden="true" />
                Allow notifications
              </button>
            </div>
          )}

          {capabilities.permission === 'denied' && (
            <div className="flex items-start gap-2 rounded-xl border border-amber-300/70 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-200">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                Notifications are blocked in your browser settings. Enable site notifications for this domain if you want morning reminders.
              </span>
            </div>
          )}

          {/* Enable/disable control & Time Picker */}
          <form onSubmit={handleSaveTime} noValidate className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-medium text-[#172033] dark:text-[#F1F5F9]">
                Reminder schedule
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={settings.enabled}
                onClick={handleToggleEnabled}
                className={`inline-flex min-h-[44px] items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4778E8] ${
                  settings.enabled
                    ? 'border-[#4778E8]/30 bg-[#4778E8]/10 text-[#4778E8] dark:border-[#5C8DF6]/40 dark:bg-[#5C8DF6]/15 dark:text-[#5C8DF6]'
                    : 'border-[#E6EAF1] bg-[#F5F7FB] text-[#697386] dark:border-[#1F2B3E] dark:bg-[#0B1120] dark:text-[#94A3B8]'
                }`}
              >
                {settings.enabled ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Enabled</span>
                  </>
                ) : (
                  <span>Disabled</span>
                )}
              </button>
            </div>

            <div>
              <label
                htmlFor={timeInputId}
                className="block text-xs text-[#697386] dark:text-[#94A3B8]"
              >
                Preferred local time (24h)
              </label>
              <div className="mt-1.5 flex items-center gap-2">
                <input
                  id={timeInputId}
                  type="time"
                  value={timeInput}
                  onChange={(e) => setTimeInput(e.target.value)}
                  onBlur={handleTimeBlur}
                  aria-invalid={Boolean(timeError)}
                  className="min-h-[44px] flex-1 rounded-xl border border-[#E6EAF1] bg-[#F5F7FB] px-3 text-sm text-[#172033] tabular-nums focus:border-[#4778E8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4778E8]/20 dark:border-[#1F2B3E] dark:bg-[#0B1120] dark:text-[#F1F5F9] dark:focus:border-[#5C8DF6] dark:focus:bg-[#111827]"
                />
                <button
                  type="submit"
                  className="min-h-[44px] rounded-xl border border-[#E6EAF1] bg-white px-4 py-2 text-xs font-semibold text-[#172033] transition-colors hover:bg-[#F5F7FB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4778E8] dark:border-[#1F2B3E] dark:bg-[#0B1120] dark:text-[#F1F5F9] dark:hover:bg-[#1F2B3E]"
                >
                  Save time
                </button>
              </div>
              {timeError && (
                <p role="alert" className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">
                  {timeError}
                </p>
              )}
            </div>
          </form>

          <button
            type="button"
            onClick={handleTestNotification}
            disabled={isSendingTest || capabilities.permission !== 'granted'}
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-[#E6EAF1] bg-[#F5F7FB] px-4 py-2 text-xs font-semibold text-[#172033] transition-colors hover:bg-[#E6EAF1]/70 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4778E8] dark:border-[#1F2B3E] dark:bg-[#0B1120] dark:text-[#F1F5F9] dark:hover:bg-[#1F2B3E]"
          >
            <Send className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{isSendingTest ? 'Sending...' : 'Send test notification'}</span>
          </button>

          {statusMessage?.text && (
            <p
              role="status"
              className={`text-xs leading-relaxed ${
                statusMessage.type === 'warning'
                  ? 'text-amber-700 dark:text-amber-300'
                  : statusMessage.type === 'success'
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : 'text-[#697386] dark:text-[#94A3B8]'
              }`}
            >
              {statusMessage.text}
            </p>
          )}
        </div>
      )}

      {/* Honest limitation disclosure */}
      <div className="mt-4 border-t border-[#E6EAF1] pt-3 text-[11px] leading-relaxed text-[#697386] dark:border-[#1F2B3E] dark:text-[#94A3B8]">
        <p className="flex items-start gap-1.5">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#4778E8] dark:text-[#5C8DF6]" aria-hidden="true" />
          <span>
            In this client-only build, daily reminders fire in the foreground while WeatherBoard is open (at most once per calendar day).
            {capabilities.pushSupported
              ? ' Push API and service-worker push handlers are ready for a future server-side VAPID push sender.'
              : ' Push API is not supported in this browser.'}
          </span>
        </p>
      </div>
    </section>
  );
}
