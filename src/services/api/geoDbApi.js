/**
 * GeoDB Cities API client (via RapidAPI) and Open-Meteo Geocoding development fallback.
 */

const GEODB_ENDPOINT = 'https://wft-geo-db.p.rapidapi.com/v1/geo/cities';
const GEODB_HOST = 'wft-geo-db.p.rapidapi.com';
const OPEN_METEO_GEOCODING_ENDPOINT = 'https://geocoding-api.open-meteo.com/v1/search';

export class CitySearchApiError extends Error {
  constructor(message, { code = 'API_ERROR', status = null, guidance = '' } = {}) {
    super(message);
    this.name = 'CitySearchApiError';
    this.code = code;
    this.status = status;
    this.guidance = guidance;
  }
}

export function normalizeGeoDbCity(item) {
  return {
    id: `geodb:${item.id ?? `${item.name}-${item.latitude}-${item.longitude}`}`,
    name: String(item.name || item.city || '').trim(),
    region: String(item.region || item.regionCode || '').trim(),
    country: String(item.country || item.countryCode || '').trim(),
    countryCode: String(item.countryCode || '').trim(),
    lat: Number(item.latitude),
    lon: Number(item.longitude),
    population: typeof item.population === 'number' ? item.population : null,
    source: 'geodb',
  };
}

export function normalizeOpenMeteoCity(item) {
  return {
    id: `om:${item.id ?? `${item.name}-${item.latitude}-${item.longitude}`}`,
    name: String(item.name || '').trim(),
    region: String(item.admin1 || item.admin2 || '').trim(),
    country: String(item.country || item.country_code || '').trim(),
    countryCode: String(item.country_code || '').trim(),
    lat: Number(item.latitude),
    lon: Number(item.longitude),
    population: typeof item.population === 'number' ? item.population : null,
    source: 'open-meteo-geocoding',
  };
}

export async function searchGeoDbCities(query, { signal, apiKey } = {}) {
  if (!apiKey) {
    throw new CitySearchApiError('GeoDB RapidAPI key is missing.', {
      code: 'MISSING_KEY',
      guidance: 'Set VITE_RAPIDAPI_KEY in .env.local to enable GeoDB city autocomplete.',
    });
  }

  const url = new URL(GEODB_ENDPOINT);
  url.searchParams.set('namePrefix', query);
  url.searchParams.set('limit', '6');
  url.searchParams.set('sort', '-population');
  url.searchParams.set('types', 'CITY');

  let response;
  try {
    response = await fetch(url.toString(), {
      method: 'GET',
      signal,
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': GEODB_HOST,
      },
    });
  } catch (err) {
    if (err && err.name === 'AbortError') {
      throw err;
    }
    throw new CitySearchApiError('Network error while contacting GeoDB city search.', {
      code: 'NETWORK_ERROR',
      guidance: 'Check your internet connection and try again.',
    });
  }

  if (response.status === 401 || response.status === 403) {
    throw new CitySearchApiError('GeoDB RapidAPI key was rejected (401/403).', {
      code: 'INVALID_KEY',
      status: response.status,
      guidance: 'Verify VITE_RAPIDAPI_KEY and your GeoDB Cities RapidAPI subscription.',
    });
  }

  if (response.status === 429) {
    throw new CitySearchApiError('GeoDB rate limit reached (1 request/sec or daily quota).', {
      code: 'RATE_LIMITED',
      status: 429,
      guidance: 'Pause briefly before typing or rely on cached suggestions.',
    });
  }

  if (!response.ok) {
    throw new CitySearchApiError(`GeoDB API returned HTTP ${response.status}.`, {
      code: 'API_ERROR',
      status: response.status,
      guidance: 'Wait a moment and retry your city search.',
    });
  }

  const payload = await response.json();
  const list = Array.isArray(payload?.data) ? payload.data : [];

  return list
    .map(normalizeGeoDbCity)
    .filter((city) => city.name && !Number.isNaN(city.lat) && !Number.isNaN(city.lon));
}

export async function searchOpenMeteoGeocoding(query, { signal } = {}) {
  const url = new URL(OPEN_METEO_GEOCODING_ENDPOINT);
  url.searchParams.set('name', query);
  url.searchParams.set('count', '6');
  url.searchParams.set('language', 'en');
  url.searchParams.set('format', 'json');

  let response;
  try {
    response = await fetch(url.toString(), {
      method: 'GET',
      signal,
    });
  } catch (err) {
    if (err && err.name === 'AbortError') {
      throw err;
    }
    throw new CitySearchApiError('Network error while contacting Open-Meteo geocoding.', {
      code: 'NETWORK_ERROR',
      guidance: 'Check your internet connection and try again.',
    });
  }

  if (response.status === 429) {
    throw new CitySearchApiError('Geocoding rate limit reached.', {
      code: 'RATE_LIMITED',
      status: 429,
      guidance: 'Wait a few seconds before searching again.',
    });
  }

  if (!response.ok) {
    throw new CitySearchApiError(`Geocoding service returned HTTP ${response.status}.`, {
      code: 'API_ERROR',
      status: response.status,
      guidance: 'Try searching again in a moment.',
    });
  }

  const payload = await response.json();
  const results = Array.isArray(payload?.results) ? payload.results : [];

  return results
    .map(normalizeOpenMeteoCity)
    .filter((city) => city.name && !Number.isNaN(city.lat) && !Number.isNaN(city.lon));
}
