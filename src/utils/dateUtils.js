/**
 * Date and timezone utilities that respect the selected city's UTC offset
 * rather than assuming the user's local browser timezone.
 */

function pad2(num) {
  return String(num).padStart(2, '0');
}

/**
 * Computes YYYY-MM-DD in the city's local timezone given a UTC Unix timestamp (seconds)
 * and the city's utcOffsetSeconds.
 */
export function getCityLocalDateKey(unixSeconds, utcOffsetSeconds = 0) {
  const shiftedMs = (unixSeconds + utcOffsetSeconds) * 1000;
  const d = new Date(shiftedMs);
  const year = d.getUTCFullYear();
  const month = pad2(d.getUTCMonth() + 1);
  const day = pad2(d.getUTCDate());
  return `${year}-${month}-${day}`;
}

/**
 * Returns the hour (0-23) in the city's local timezone.
 */
export function getCityLocalHour(unixSeconds, utcOffsetSeconds = 0) {
  const shiftedMs = (unixSeconds + utcOffsetSeconds) * 1000;
  return new Date(shiftedMs).getUTCHours();
}

/**
 * Formats a UTC Unix timestamp (seconds) in the city's local timezone.
 */
export function formatCityLocalDateTime(unixSeconds, utcOffsetSeconds = 0) {
  if (typeof unixSeconds !== 'number' || Number.isNaN(unixSeconds)) {
    return '—';
  }
  const shiftedDate = new Date((unixSeconds + utcOffsetSeconds) * 1000);
  const formattedDate = new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(shiftedDate);

  const formattedTime = `${pad2(shiftedDate.getUTCHours())}:${pad2(shiftedDate.getUTCMinutes())}`;
  return `${formattedDate} · ${formattedTime}`;
}

/**
 * Formats a city's UTC offset (seconds) as e.g. "UTC+5" or "UTC-4:30".
 */
export function formatUtcOffset(utcOffsetSeconds = 0) {
  if (typeof utcOffsetSeconds !== 'number' || Number.isNaN(utcOffsetSeconds)) {
    return '';
  }
  const sign = utcOffsetSeconds >= 0 ? '+' : '-';
  const absMinutes = Math.round(Math.abs(utcOffsetSeconds) / 60);
  const hours = Math.floor(absMinutes / 60);
  const minutes = absMinutes % 60;
  return minutes === 0 ? `UTC${sign}${hours}` : `UTC${sign}${hours}:${pad2(minutes)}`;
}

/**
 * Formats sunrise/sunset from either a Unix timestamp (seconds, shifted by utcOffsetSeconds)
 * or an ISO-like local string from Open-Meteo ("2026-11-13T06:45").
 */
export function formatSunTime(value, utcOffsetSeconds = 0) {
  if (value === null || value === undefined || value === '') {
    return '—';
  }
  if (typeof value === 'string') {
    const match = value.match(/T(\d{2}:\d{2})/);
    if (match) {
      return match[1];
    }
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) {
      const d = new Date(parsed + utcOffsetSeconds * 1000);
      return `${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}`;
    }
    return '—';
  }
  if (typeof value === 'number' && !Number.isNaN(value)) {
    const d = new Date((value + utcOffsetSeconds) * 1000);
    return `${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}`;
  }
  return '—';
}

/**
 * Formats a YYYY-MM-DD date string into a friendly day label + short date.
 * Uses UTC parsing to prevent browser timezone shift bugs.
 */
export function formatForecastDay(dateKey, todayDateKey) {
  if (!dateKey || typeof dateKey !== 'string') {
    return { dayLabel: '—', dateLabel: '' };
  }
  const [year, month, day] = dateKey.split('-').map(Number);
  if (!year || !month || !day) {
    return { dayLabel: dateKey, dateLabel: '' };
  }

  const targetUtc = Date.UTC(year, month - 1, day);
  const targetDate = new Date(targetUtc);

  let dayLabel = new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    timeZone: 'UTC',
  }).format(targetDate);

  if (todayDateKey && dateKey === todayDateKey) {
    dayLabel = 'Today';
  } else if (todayDateKey) {
    const [ty, tm, td] = todayDateKey.split('-').map(Number);
    if (ty && tm && td) {
      const todayUtc = Date.UTC(ty, tm - 1, td);
      const diffDays = Math.round((targetUtc - todayUtc) / 86400000);
      if (diffDays === 1) {
        dayLabel = 'Tomorrow';
      }
    }
  }

  const dateLabel = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(targetDate);

  return { dayLabel, dateLabel };
}

/**
 * Formats a timestamp (ms or ISO string) for "Last updated" display in the user's local time.
 */
export function formatLastUpdated(timestamp) {
  if (!timestamp) {
    return '—';
  }
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Returns local calendar day string YYYY-MM-DD in the user's browser timezone.
 * Used for daily morning reminder deduplication.
 */
export function getLocalCalendarDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());
  return `${year}-${month}-${day}`;
}
