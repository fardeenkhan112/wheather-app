/**
 * Orchestrates weather fetching (OpenWeatherMap primary, Open-Meteo fallback)
 * and persists the last-viewed normalized weather snapshot for offline fallback.
 */

import { fetchOpenMeteoData } from '../../services/api/openMeteoApi.js';
import { fetchOpenWeatherData, WeatherProviderError } from '../../services/api/openWeatherApi.js';
import { readJson, writeJson } from '../../utils/storage.js';
import { normalizeOpenMeteo, normalizeOpenWeather } from './weatherNormalizer.js';

export const LAST_WEATHER_CACHE_KEY = 'weatherboard_last_weather_v1';

export function getOpenWeatherApiKey() {
  return (import.meta.env.VITE_OPENWEATHER_API_KEY || '').trim();
}

export function loadCachedWeatherSnapshot() {
  const result = readJson(LAST_WEATHER_CACHE_KEY, null);
  if (!result.ok || !result.data || !result.data.city || !result.data.current) {
    return null;
  }
  return result.data;
}

export function saveCachedWeatherSnapshot(snapshot) {
  return writeJson(LAST_WEATHER_CACHE_KEY, snapshot);
}

/**
 * Fetches live weather for a city:
 * 1) Attempts OpenWeatherMap when VITE_OPENWEATHER_API_KEY is configured.
 * 2) Falls back to Open-Meteo if key is missing, rate-limited, or OpenWeatherMap fails.
 * 3) Persists successful normalized weather snapshot to localStorage for offline usage.
 */
export async function getWeatherForCity(
  city,
  { signal, openWeatherApiKey = getOpenWeatherApiKey() } = {}
) {
  let fallbackReason = null;

  if (openWeatherApiKey) {
    try {
      const { currentResponse, forecastResponse } = await fetchOpenWeatherData({
        lat: city.lat,
        lon: city.lon,
        apiKey: openWeatherApiKey,
        signal,
      });
      const normalized = normalizeOpenWeather({ currentResponse, forecastResponse, city });
      saveCachedWeatherSnapshot(normalized);
      return normalized;
    } catch (err) {
      if (err && err.name === 'AbortError') {
        throw err;
      }
      if (err?.code === 'RATE_LIMITED') {
        fallbackReason =
          'OpenWeatherMap rate limit reached — displaying Open-Meteo fallback data.';
      } else if (err?.code === 'INVALID_KEY') {
        fallbackReason =
          'OpenWeatherMap rejected the API key — displaying Open-Meteo fallback data.';
      } else {
        fallbackReason = `OpenWeatherMap request failed (${err?.message || 'error'}) — displaying Open-Meteo fallback data.`;
      }
    }
  } else {
    fallbackReason =
      'VITE_OPENWEATHER_API_KEY is not configured — displaying Open-Meteo live fallback data.';
  }

  try {
    const openMeteoResponse = await fetchOpenMeteoData({
      lat: city.lat,
      lon: city.lon,
      signal,
    });
    const normalized = normalizeOpenMeteo({
      response: openMeteoResponse,
      city,
      fallbackReason,
    });
    saveCachedWeatherSnapshot(normalized);
    return normalized;
  } catch (fallbackErr) {
    if (fallbackErr && fallbackErr.name === 'AbortError') {
      throw fallbackErr;
    }
    throw new WeatherProviderError(
      `Unable to load weather for ${city.name}. ${fallbackErr?.message || ''}`.trim(),
      {
        provider: 'Weather Providers',
        code: fallbackErr?.code || 'ALL_PROVIDERS_FAILED',
        guidance:
          'Check your network connection or try refreshing in a moment. Previously cached city data remains available offline.',
      }
    );
  }
}
