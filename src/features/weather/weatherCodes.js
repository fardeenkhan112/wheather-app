/**
 * Weather condition code mappings for OpenWeatherMap condition IDs
 * and Open-Meteo WMO weather interpretation codes.
 */

export function mapOpenWeatherCondition(weatherId, description = '') {
  const id = Number(weatherId);
  const label = description
    ? description.charAt(0).toUpperCase() + description.slice(1)
    : 'Clear sky';

  if (id >= 200 && id < 300) {
    return { conditionCode: 'thunderstorm', conditionLabel: label };
  }
  if (id >= 300 && id < 400) {
    return { conditionCode: 'drizzle', conditionLabel: label };
  }
  if (id === 511) {
    return { conditionCode: 'freezing-rain', conditionLabel: label };
  }
  if (id >= 500 && id < 600) {
    return { conditionCode: 'rain', conditionLabel: label };
  }
  if (id >= 600 && id < 700) {
    return { conditionCode: 'snow', conditionLabel: label };
  }
  if (id >= 700 && id < 800) {
    return { conditionCode: 'fog', conditionLabel: label };
  }
  if (id === 800) {
    return { conditionCode: 'clear', conditionLabel: label };
  }
  if (id === 801 || id === 802) {
    return { conditionCode: 'partly-cloudy', conditionLabel: label };
  }
  if (id === 803 || id === 804) {
    return { conditionCode: 'cloudy', conditionLabel: label };
  }

  return { conditionCode: 'partly-cloudy', conditionLabel: label };
}

const WMO_WEATHER_MAP = {
  0: { conditionCode: 'clear', conditionLabel: 'Clear sky' },
  1: { conditionCode: 'clear', conditionLabel: 'Mainly clear' },
  2: { conditionCode: 'partly-cloudy', conditionLabel: 'Partly cloudy' },
  3: { conditionCode: 'cloudy', conditionLabel: 'Overcast' },
  45: { conditionCode: 'fog', conditionLabel: 'Fog' },
  48: { conditionCode: 'fog', conditionLabel: 'Depositing rime fog' },
  51: { conditionCode: 'drizzle', conditionLabel: 'Light drizzle' },
  53: { conditionCode: 'drizzle', conditionLabel: 'Moderate drizzle' },
  55: { conditionCode: 'drizzle', conditionLabel: 'Dense drizzle' },
  56: { conditionCode: 'freezing-rain', conditionLabel: 'Light freezing drizzle' },
  57: { conditionCode: 'freezing-rain', conditionLabel: 'Dense freezing drizzle' },
  61: { conditionCode: 'rain', conditionLabel: 'Slight rain' },
  63: { conditionCode: 'rain', conditionLabel: 'Moderate rain' },
  65: { conditionCode: 'rain', conditionLabel: 'Heavy rain' },
  66: { conditionCode: 'freezing-rain', conditionLabel: 'Light freezing rain' },
  67: { conditionCode: 'freezing-rain', conditionLabel: 'Heavy freezing rain' },
  71: { conditionCode: 'snow', conditionLabel: 'Slight snowfall' },
  73: { conditionCode: 'snow', conditionLabel: 'Moderate snowfall' },
  75: { conditionCode: 'snow', conditionLabel: 'Heavy snowfall' },
  77: { conditionCode: 'snow', conditionLabel: 'Snow grains' },
  80: { conditionCode: 'rain', conditionLabel: 'Slight rain showers' },
  81: { conditionCode: 'rain', conditionLabel: 'Moderate rain showers' },
  82: { conditionCode: 'rain', conditionLabel: 'Violent rain showers' },
  85: { conditionCode: 'snow', conditionLabel: 'Slight snow showers' },
  86: { conditionCode: 'snow', conditionLabel: 'Heavy snow showers' },
  95: { conditionCode: 'thunderstorm', conditionLabel: 'Thunderstorm' },
  96: { conditionCode: 'thunderstorm', conditionLabel: 'Thunderstorm with slight hail' },
  99: { conditionCode: 'thunderstorm', conditionLabel: 'Thunderstorm with heavy hail' },
};

export function mapWmoWeatherCode(wmoCode) {
  const code = Number(wmoCode);
  if (Object.prototype.hasOwnProperty.call(WMO_WEATHER_MAP, code)) {
    return WMO_WEATHER_MAP[code];
  }
  return { conditionCode: 'partly-cloudy', conditionLabel: 'Variable conditions' };
}
