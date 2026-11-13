import { describe, expect, it } from 'vitest';
import { normalizeGeoDbCity, normalizeOpenMeteoCity } from '../services/api/geoDbApi.js';
import { mapOpenWeatherCondition, mapWmoWeatherCode } from '../features/weather/weatherCodes.js';
import {
  groupOpenWeatherFiveDayForecast,
  normalizeOpenMeteo,
  normalizeOpenWeather,
} from '../features/weather/weatherNormalizer.js';

describe('search result normalization', () => {
  it('normalizes GeoDB city payload', () => {
    const city = normalizeGeoDbCity({
      id: 9876,
      name: 'Karachi',
      region: 'Sindh',
      country: 'Pakistan',
      countryCode: 'PK',
      latitude: 24.8607,
      longitude: 67.0011,
      population: 14910352,
    });

    expect(city).toEqual({
      id: 'geodb:9876',
      name: 'Karachi',
      region: 'Sindh',
      country: 'Pakistan',
      countryCode: 'PK',
      lat: 24.8607,
      lon: 67.0011,
      population: 14910352,
      source: 'geodb',
    });
  });

  it('normalizes Open-Meteo geocoding city payload', () => {
    const city = normalizeOpenMeteoCity({
      id: 1174872,
      name: 'Karachi',
      admin1: 'Sindh',
      country: 'Pakistan',
      country_code: 'PK',
      latitude: 24.8608,
      longitude: 67.0104,
      population: 11624219,
    });

    expect(city.id).toBe('om:1174872');
    expect(city.region).toBe('Sindh');
    expect(city.source).toBe('open-meteo-geocoding');
  });
});

describe('weather condition code mappings', () => {
  it('maps OpenWeatherMap condition IDs', () => {
    expect(mapOpenWeatherCondition(800, 'clear sky')).toEqual({
      conditionCode: 'clear',
      conditionLabel: 'Clear sky',
    });
    expect(mapOpenWeatherCondition(501, 'moderate rain')).toEqual({
      conditionCode: 'rain',
      conditionLabel: 'Moderate rain',
    });
    expect(mapOpenWeatherCondition(211, 'thunderstorm')).toEqual({
      conditionCode: 'thunderstorm',
      conditionLabel: 'Thunderstorm',
    });
  });

  it('maps Open-Meteo WMO codes accurately', () => {
    expect(mapWmoWeatherCode(0)).toEqual({
      conditionCode: 'clear',
      conditionLabel: 'Clear sky',
    });
    expect(mapWmoWeatherCode(45)).toEqual({
      conditionCode: 'fog',
      conditionLabel: 'Fog',
    });
    expect(mapWmoWeatherCode(63)).toEqual({
      conditionCode: 'rain',
      conditionLabel: 'Moderate rain',
    });
    expect(mapWmoWeatherCode(95)).toEqual({
      conditionCode: 'thunderstorm',
      conditionLabel: 'Thunderstorm',
    });
  });
});

describe('5-day forecast grouping & weather normalization', () => {
  it('groups OpenWeatherMap 3-hour entries by city local date and selects midday representative', () => {
    // UTC+5 (Karachi = +18000s).
    // 2026-11-13T21:00:00Z is 2026-11-14T02:00:00 in Karachi (+5h)!
    const utcOffsetSeconds = 18000;
    const tsDay1LateUtc = Math.floor(Date.UTC(2026, 10, 13, 21, 0, 0) / 1000); // 2026-11-14 02:00 local
    const tsDay1MiddayLocal = Math.floor(Date.UTC(2026, 10, 14, 7, 0, 0) / 1000); // 2026-11-14 12:00 local
    const tsDay2Local = Math.floor(Date.UTC(2026, 10, 15, 7, 0, 0) / 1000); // 2026-11-15 12:00 local

    const grouped = groupOpenWeatherFiveDayForecast(
      {
        list: [
          {
            dt: tsDay1LateUtc,
            main: { temp: 22, temp_min: 20, temp_max: 23 },
            weather: [{ id: 803, description: 'broken clouds' }],
            pop: 0.1,
          },
          {
            dt: tsDay1MiddayLocal,
            main: { temp: 31, temp_min: 29, temp_max: 32 },
            weather: [{ id: 800, description: 'clear sky' }],
            pop: 0.0,
          },
          {
            dt: tsDay2Local,
            main: { temp: 28, temp_min: 24, temp_max: 30 },
            weather: [{ id: 500, description: 'light rain' }],
            pop: 0.65,
          },
        ],
      },
      utcOffsetSeconds
    );

    expect(grouped).toHaveLength(2);
    expect(grouped[0]).toEqual({
      dateKey: '2026-11-14',
      tempMaxC: 32,
      tempMinC: 20,
      conditionCode: 'clear',
      conditionLabel: 'Clear sky',
      precipitationProbability: 10,
    });
    expect(grouped[1].dateKey).toBe('2026-11-15');
    expect(grouped[1].conditionCode).toBe('rain');
    expect(grouped[1].precipitationProbability).toBe(65);
  });

  it('normalizes OpenWeatherMap and Open-Meteo responses into the same schema', () => {
    const city = {
      id: 'geodb:1',
      name: 'Karachi',
      region: 'Sindh',
      country: 'Pakistan',
      lat: 24.86,
      lon: 67.0,
    };

    const owmNormalized = normalizeOpenWeather({
      city,
      currentResponse: {
        dt: 1794560400,
        timezone: 18000,
        visibility: 10000,
        main: { temp: 29.4, feels_like: 30.1, humidity: 58, pressure: 1012 },
        wind: { speed: 5, deg: 225 },
        weather: [{ id: 800, description: 'clear sky', icon: '01d' }],
        sys: { sunrise: 1794534000, sunset: 1794573600 },
      },
      forecastResponse: {
        city: { timezone: 18000 },
        list: [
          {
            dt: 1794560400,
            main: { temp: 29, temp_min: 25, temp_max: 31 },
            weather: [{ id: 800, description: 'clear sky' }],
          },
        ],
      },
    });

    const meteoNormalized = normalizeOpenMeteo({
      city,
      fallbackReason: 'OpenWeatherMap API key is not configured.',
      response: {
        utc_offset_seconds: 18000,
        current: {
          time: '2026-11-13T12:00',
          temperature_2m: 29.4,
          apparent_temperature: 30.1,
          relative_humidity_2m: 58,
          is_day: 1,
          weather_code: 0,
          wind_speed_10m: 18,
          wind_direction_10m: 225,
          pressure_msl: 1012,
        },
        daily: {
          time: ['2026-11-13', '2026-11-14', '2026-11-15', '2026-11-16', '2026-11-17'],
          weather_code: [0, 1, 2, 3, 61],
          temperature_2m_max: [31, 30, 29, 28, 27],
          temperature_2m_min: [22, 21, 20, 20, 19],
          precipitation_probability_max: [0, 5, 10, 20, 70],
          sunrise: ['2026-11-13T06:45'],
          sunset: ['2026-11-13T17:45'],
        },
      },
    });

    expect(owmNormalized.provider).toBe('openweathermap');
    expect(owmNormalized.current.windSpeedKmh).toBe(18);
    expect(meteoNormalized.provider).toBe('open-meteo');
    expect(meteoNormalized.isFallback).toBe(true);
    expect(meteoNormalized.forecast).toHaveLength(5);
    expect(Object.keys(owmNormalized.current)).toEqual(Object.keys(meteoNormalized.current));
  });
});
