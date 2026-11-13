/**
 * Temperature conversion and meteorological unit formatting helpers.
 * Internal normalized weather temperatures are always stored in Celsius (°C)
 * and wind speeds in km/h.
 */

export function celsiusToFahrenheit(celsius) {
  if (typeof celsius !== 'number' || Number.isNaN(celsius)) {
    return null;
  }
  return (celsius * 9) / 5 + 32;
}

export function convertTemperature(celsius, unit = 'C') {
  if (typeof celsius !== 'number' || Number.isNaN(celsius)) {
    return null;
  }
  const value = unit === 'F' ? celsiusToFahrenheit(celsius) : celsius;
  return Math.round(value);
}

export function formatTemperature(celsius, unit = 'C', { includeUnit = true } = {}) {
  const converted = convertTemperature(celsius, unit);
  if (converted === null) {
    return '—';
  }
  return includeUnit ? `${converted}°${unit}` : `${converted}°`;
}

export function formatWindDirection(degrees) {
  if (typeof degrees !== 'number' || Number.isNaN(degrees)) {
    return '';
  }
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const normalized = ((degrees % 360) + 360) % 360;
  const index = Math.round(normalized / 45) % 8;
  return directions[index];
}

export function formatWindSpeed(kmh) {
  if (typeof kmh !== 'number' || Number.isNaN(kmh)) {
    return '—';
  }
  return `${Math.round(kmh)} km/h`;
}
