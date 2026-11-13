
/**
 * City search service with in-memory result caching, duplicate request prevention,
 * and GeoDB-first / Open-Meteo geocoding fallback.
 *
 * GeoDB may return an empty CITY list for some well-known places (for example,
 * Lahore can be indexed as an administrative division rather than a CITY).
 * In that case, or when GeoDB is unavailable, Open-Meteo geocoding is used.
 */

import {
  CitySearchApiError,
  searchGeoDbCities,
  searchOpenMeteoGeocoding,
} from '../../services/api/geoDbApi.js';

const MAX_CACHE_ENTRIES = 60;
const searchMemoryCache = new Map();

export function clearCitySearchCache() {
  searchMemoryCache.clear();
}

export function getRapidApiKey() {
  return (import.meta.env.VITE_RAPIDAPI_KEY || '').trim();
}

function setCachedResult(cacheKey, value) {
  if (searchMemoryCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = searchMemoryCache.keys().next().value;

    if (oldestKey !== undefined) {
      searchMemoryCache.delete(oldestKey);
    }
  }

  searchMemoryCache.set(cacheKey, value);
}

function getGeoDbFailureReason(error) {
  if (error?.code === 'INVALID_KEY') {
    return 'RapidAPI rejected the GeoDB API key';
  }

  if (error?.code === 'RATE_LIMITED') {
    return 'GeoDB rate limit was reached';
  }

  if (error?.code === 'NETWORK_ERROR') {
    return 'GeoDB could not be reached because of a network error';
  }

  return error?.message || 'GeoDB request failed';
}

async function searchWithOpenMeteoFallback(
  query,
  { signal, cacheKey, configNotice }
) {
  const cities = await searchOpenMeteoGeocoding(query, { signal });

  const result = {
    cities,
    provider: 'open-meteo-geocoding',
    providerLabel: 'Open-Meteo Geocoding',
    isFallback: true,
    configNotice,
    fromCache: false,
  };

  // Cache only non-empty results so a temporary empty response can be retried.
  if (cities.length > 0) {
    setCachedResult(cacheKey, result);
  }

  return result;
}

/**
 * Searches matching cities with GeoDB as the primary provider and Open-Meteo
 * as a fallback when GeoDB has no CITY matches or cannot complete the request.
 */
export async function searchCities(
  query,
  { signal, rapidApiKey = getRapidApiKey() } = {}
) {
  const trimmedQuery = query.trim();
  const normalizedQuery = trimmedQuery.toLowerCase();
  const hasGeoDbKey = Boolean(rapidApiKey);
  const cacheKey = `${hasGeoDbKey ? 'geodb' : 'om'}:${normalizedQuery}`;

  if (searchMemoryCache.has(cacheKey)) {
    return {
      ...searchMemoryCache.get(cacheKey),
      fromCache: true,
    };
  }

  // No GeoDB key: use the free Open-Meteo geocoder.
  if (!hasGeoDbKey) {
    try {
      return await searchWithOpenMeteoFallback(trimmedQuery, {
        signal,
        cacheKey,
        configNotice:
          'VITE_RAPIDAPI_KEY is not configured. Using Open-Meteo Geocoding fallback instead of GeoDB.',
      });
    } catch (error) {
      if (error?.name === 'AbortError') {
        throw error;
      }

      throw new CitySearchApiError(
        error?.message ||
          'City search failed and the GeoDB API key is not configured.',
        {
          code: error?.code || 'MISSING_KEY',
          status: error?.status || null,
          guidance:
            error?.guidance ||
            'Add VITE_RAPIDAPI_KEY to .env.local or check your internet connection.',
        }
      );
    }
  }

  // Keep GeoDB as the primary source whenever it returns actual city records.
  let geoDbCities;

  try {
    geoDbCities = await searchGeoDbCities(trimmedQuery, {
      signal,
      apiKey: rapidApiKey,
    });
  } catch (geoDbError) {
    if (geoDbError?.name === 'AbortError') {
      throw geoDbError;
    }

    // Invalid key, rate limit, network failure, and other GeoDB errors.
    try {
      return await searchWithOpenMeteoFallback(trimmedQuery, {
        signal,
        cacheKey,
        configNotice: `GeoDB is unavailable (${getGeoDbFailureReason(
          geoDbError
        )}). Using Open-Meteo Geocoding fallback.`,
      });
    } catch (fallbackError) {
      if (fallbackError?.name === 'AbortError') {
        throw fallbackError;
      }

      throw new CitySearchApiError(
        `City search failed. GeoDB: ${
          geoDbError?.message || 'request failed'
        }. Open-Meteo: ${
          fallbackError?.message || 'fallback failed'
        }.`,
        {
          code:
            fallbackError?.code ||
            geoDbError?.code ||
            'ALL_SEARCH_PROVIDERS_FAILED',
          status: fallbackError?.status || geoDbError?.status || null,
          guidance:
            fallbackError?.guidance ||
            geoDbError?.guidance ||
            'Check your internet connection and try searching again.',
        }
      );
    }
  }

  if (geoDbCities.length > 0) {
    const result = {
      cities: geoDbCities,
      provider: 'geodb',
      providerLabel: 'GeoDB Cities',
      isFallback: false,
      configNotice: null,
      fromCache: false,
    };

    setCachedResult(cacheKey, result);
    return result;
  }

  // GeoDB returned HTTP 200 but no matching CITY records.
  // Search Open-Meteo instead of incorrectly showing no city found.
  return searchWithOpenMeteoFallback(trimmedQuery, {
    signal,
    cacheKey,
    configNotice:
      'GeoDB returned no matching CITY records for this search. Showing Open-Meteo Geocoding results instead.',
  });
}
