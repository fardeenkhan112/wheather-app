/**
 * Client-side validation utilities for city search, reminder time, and city data.
 */

export function validateCitySearchInput(rawQuery) {
  const trimmed = typeof rawQuery === 'string' ? rawQuery.trim() : '';

  if (!trimmed) {
    return {
      isValid: false,
      normalizedQuery: '',
      error: 'Enter a city name to search (for example, Karachi or London).',
    };
  }

  if (trimmed.length < 2) {
    return {
      isValid: false,
      normalizedQuery: trimmed,
      error: 'Enter at least 2 characters to search for matching cities.',
    };
  }

  if (trimmed.length > 80) {
    return {
      isValid: false,
      normalizedQuery: trimmed.slice(0, 80),
      error: 'City search query must be 80 characters or fewer.',
    };
  }

  // Require at least one letter (supports international Unicode city names)
  if (!/\p{L}/u.test(trimmed)) {
    return {
      isValid: false,
      normalizedQuery: trimmed,
      error: 'City name must include letters rather than numbers or symbols alone.',
    };
  }

  return {
    isValid: true,
    normalizedQuery: trimmed,
    error: null,
  };
}

export function validateReminderTime(timeString) {
  if (typeof timeString !== 'string' || !timeString.trim()) {
    return {
      isValid: false,
      error: 'Select a daily reminder time in HH:MM format.',
    };
  }

  const match = timeString.trim().match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  if (!match) {
    return {
      isValid: false,
      error: 'Reminder time must be a valid 24-hour time between 00:00 and 23:59.',
    };
  }

  return {
    isValid: true,
    error: null,
  };
}

export function isValidCityRecord(city) {
  if (!city || typeof city !== 'object') {
    return false;
  }
  const hasName = typeof city.name === 'string' && city.name.trim().length > 0;
  const hasLat = typeof city.lat === 'number' && !Number.isNaN(city.lat) && city.lat >= -90 && city.lat <= 90;
  const hasLon = typeof city.lon === 'number' && !Number.isNaN(city.lon) && city.lon >= -180 && city.lon <= 180;
  return hasName && hasLat && hasLon;
}
