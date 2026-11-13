/**
 * Open-Meteo free weather forecast API client (no API key required).
 * Serves as the live fallback provider when OpenWeatherMap is unconfigured,
 * rate-limited, or unavailable.
 */

import { WeatherProviderError } from './openWeatherApi.js';

const OPEN_METEO_ENDPOINT = 'https://api.open-meteo.com/v1/forecast';

export async function fetchOpenMeteoData({ lat, lon, signal }) {
  const url = new URL(OPEN_METEO_ENDPOINT);
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lon));
  url.searchParams.set(
    'current',
    [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'is_day',
      'precipitation',
      'weather_code',
      'wind_speed_10m',
      'wind_direction_10m',
      'pressure_msl',
    ].join(',')
  );
  url.searchParams.set(
    'daily',
    [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_probability_max',
      'sunrise',
      'sunset',
    ].join(',')
  );
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('forecast_days', '5');
  url.searchParams.set('temperature_unit', 'celsius');
  url.searchParams.set('wind_speed_unit', 'kmh');

  let response;
  try {
    response = await fetch(url.toString(), { method: 'GET', signal });
  } catch (err) {
    if (err && err.name === 'AbortError') {
      throw err;
    }
    throw new WeatherProviderError('Network error while contacting Open-Meteo.', {
      provider: 'Open-Meteo',
      code: 'NETWORK_ERROR',
      guidance: 'Verify your internet connection and retry.',
    });
  }

  if (response.status === 429) {
    throw new WeatherProviderError('Open-Meteo rate limit exceeded.', {
      provider: 'Open-Meteo',
      code: 'RATE_LIMITED',
      status: 429,
      guidance: 'Wait a moment before refreshing weather data.',
    });
  }

  if (!response.ok) {
    throw new WeatherProviderError(`Open-Meteo returned HTTP ${response.status}.`, {
      provider: 'Open-Meteo',
      code: 'API_ERROR',
      status: response.status,
      guidance: 'Try again shortly.',
    });
  }

  return response.json();
}
