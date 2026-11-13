/**
 * OpenWeatherMap REST API client (Current Weather + 5-day / 3-hour Forecast).
 */

const OWM_BASE_URL = 'https://api.openweathermap.org/data/2.5';

export class WeatherProviderError extends Error {
  constructor(message, { provider, code = 'API_ERROR', status = null, guidance = '' } = {}) {
    super(message);
    this.name = 'WeatherProviderError';
    this.provider = provider;
    this.code = code;
    this.status = status;
    this.guidance = guidance;
  }
}

async function fetchJsonWithHandling(url, { signal, provider }) {
  let response;
  try {
    response = await fetch(url, { method: 'GET', signal });
  } catch (err) {
    if (err && err.name === 'AbortError') {
      throw err;
    }
    throw new WeatherProviderError(`Network error contacting ${provider}.`, {
      provider,
      code: 'NETWORK_ERROR',
      guidance: 'Check your internet connection and retry.',
    });
  }

  if (response.status === 401 || response.status === 403) {
    throw new WeatherProviderError(`${provider} rejected the configured API key.`, {
      provider,
      code: 'INVALID_KEY',
      status: response.status,
      guidance: 'Check VITE_OPENWEATHER_API_KEY in .env.local.',
    });
  }

  if (response.status === 429) {
    throw new WeatherProviderError(`${provider} API rate limit exceeded.`, {
      provider,
      code: 'RATE_LIMITED',
      status: 429,
      guidance: 'Wait briefly before refreshing weather data.',
    });
  }

  if (!response.ok) {
    throw new WeatherProviderError(`${provider} returned HTTP ${response.status}.`, {
      provider,
      code: 'API_ERROR',
      status: response.status,
      guidance: 'Retry in a moment or inspect provider availability.',
    });
  }

  return response.json();
}

export async function fetchOpenWeatherData({ lat, lon, apiKey, signal }) {
  if (!apiKey) {
    throw new WeatherProviderError('OpenWeatherMap API key is not configured.', {
      provider: 'OpenWeatherMap',
      code: 'MISSING_KEY',
      guidance: 'Set VITE_OPENWEATHER_API_KEY in .env.local to use OpenWeatherMap.',
    });
  }

  const currentUrl = new URL(`${OWM_BASE_URL}/weather`);
  currentUrl.searchParams.set('lat', String(lat));
  currentUrl.searchParams.set('lon', String(lon));
  currentUrl.searchParams.set('appid', apiKey);
  currentUrl.searchParams.set('units', 'metric');

  const forecastUrl = new URL(`${OWM_BASE_URL}/forecast`);
  forecastUrl.searchParams.set('lat', String(lat));
  forecastUrl.searchParams.set('lon', String(lon));
  forecastUrl.searchParams.set('appid', apiKey);
  forecastUrl.searchParams.set('units', 'metric');

  const [currentResponse, forecastResponse] = await Promise.all([
    fetchJsonWithHandling(currentUrl.toString(), { signal, provider: 'OpenWeatherMap' }),
    fetchJsonWithHandling(forecastUrl.toString(), { signal, provider: 'OpenWeatherMap' }),
  ]);

  return { currentResponse, forecastResponse };
}
