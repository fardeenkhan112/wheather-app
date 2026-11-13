import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../app/App.jsx';
import { shouldTriggerReminderToday } from '../features/reminders/reminderService.js';
import {
  LAST_WEATHER_CACHE_KEY,
  saveCachedWeatherSnapshot,
} from '../features/weather/weatherService.js';

describe('Offline cached-weather fallback and reminder scheduling', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('displays cached weather snapshot and offline banner when offline', () => {
    saveCachedWeatherSnapshot({
      city: {
        id: 'geodb:1',
        name: 'Karachi',
        region: 'Sindh',
        country: 'Pakistan',
        lat: 24.8607,
        lon: 67.0011,
      },
      provider: 'open-meteo',
      providerLabel: 'Open-Meteo',
      isFallback: true,
      fallbackReason: 'OpenWeatherMap API key is not configured.',
      utcOffsetSeconds: 18000,
      observedAtUnix: 1794560400,
      fetchedAt: '2026-11-13T10:00:00.000Z',
      current: {
        tempC: 29,
        feelsLikeC: 30,
        tempHighC: 31,
        tempLowC: 22,
        conditionCode: 'clear',
        conditionLabel: 'Clear sky',
        isDay: true,
        humidity: 55,
        windSpeedKmh: 16,
        windDirectionDeg: 240,
        pressureHpa: 1013,
        visibilityMeters: null,
        sunrise: '2026-11-13T06:45',
        sunset: '2026-11-13T17:45',
      },
      forecast: [
        {
          dateKey: '2026-11-13',
          tempMaxC: 31,
          tempMinC: 22,
          conditionCode: 'clear',
          conditionLabel: 'Clear sky',
          precipitationProbability: 0,
        },
      ],
    });

    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);

    render(<App />);

    expect(screen.getByText('You are offline')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Karachi' })).toBeInTheDocument();
    expect(screen.getByText('29°C')).toBeInTheDocument();
    expect(window.localStorage.getItem(LAST_WEATHER_CACHE_KEY)).toBeTruthy();
  });

  it('triggers daily reminder only after scheduled time and prevents same-day duplicates', () => {
    const morningBefore = new Date(2026, 10, 13, 7, 45, 0);
    const morningAfter = new Date(2026, 10, 13, 8, 5, 0);

    const settings = {
      enabled: true,
      time: '08:00',
      lastNotifiedDate: null,
    };

    expect(shouldTriggerReminderToday(settings, morningBefore)).toBe(false);
    expect(shouldTriggerReminderToday(settings, morningAfter)).toBe(true);

    const alreadySentToday = {
      ...settings,
      lastNotifiedDate: '2026-11-13',
    };
    expect(shouldTriggerReminderToday(alreadySentToday, morningAfter)).toBe(false);
  });
});
