/**
 * Normalizes OpenWeatherMap and Open-Meteo responses into a single shared
 * WeatherBoard internal schema. Internal temperatures are stored in Celsius (°C)
 * and wind speeds in km/h.
 */

import { getCityLocalDateKey, getCityLocalHour } from '../../utils/dateUtils.js';
import { mapOpenWeatherCondition, mapWmoWeatherCode } from './weatherCodes.js';

/**
 * Groups OpenWeatherMap 3-hour forecast entries by the city's local calendar date
 * (using city.timezone UTC offset in seconds), picks the entry nearest local midday (12:00),
 * and calculates daily min/max temperatures from all entries in that day.
 */
export function groupOpenWeatherFiveDayForecast(forecastResponse, utcOffsetSeconds = 0) {
  const entries = Array.isArray(forecastResponse?.list) ? forecastResponse.list : [];
  if (entries.length === 0) {
    return [];
  }

  const dayMap = new Map();

  for (const entry of entries) {
    if (typeof entry?.dt !== 'number' || !entry?.main) {
      continue;
    }
    const dateKey = getCityLocalDateKey(entry.dt, utcOffsetSeconds);
    if (!dayMap.has(dateKey)) {
      dayMap.set(dateKey, []);
    }
    dayMap.get(dateKey).push(entry);
  }

  const dailyCards = [];
  for (const [dateKey, dayEntries] of dayMap.entries()) {
    let tempMin = Infinity;
    let tempMax = -Infinity;
    let representative = dayEntries[0];
    let bestHourDistance = Infinity;
    let maxPop = 0;

    for (const item of dayEntries) {
      const low = typeof item.main.temp_min === 'number' ? item.main.temp_min : item.main.temp;
      const high = typeof item.main.temp_max === 'number' ? item.main.temp_max : item.main.temp;
      if (low < tempMin) tempMin = low;
      if (high > tempMax) tempMax = high;

      if (typeof item.pop === 'number' && item.pop > maxPop) {
        maxPop = item.pop;
      }

      const localHour = getCityLocalHour(item.dt, utcOffsetSeconds);
      const distanceFromMidday = Math.abs(localHour - 12);
      if (distanceFromMidday < bestHourDistance) {
        bestHourDistance = distanceFromMidday;
        representative = item;
      }
    }

    const weatherInfo = representative?.weather?.[0];
    const mapped = mapOpenWeatherCondition(weatherInfo?.id, weatherInfo?.description);

    dailyCards.push({
      dateKey,
      tempMaxC: Number.isFinite(tempMax) ? tempMax : representative.main.temp,
      tempMinC: Number.isFinite(tempMin) ? tempMin : representative.main.temp,
      conditionCode: mapped.conditionCode,
      conditionLabel: mapped.conditionLabel,
      precipitationProbability: Math.round(maxPop * 100),
    });
  }

  return dailyCards.slice(0, 5);
}

export function normalizeOpenWeather({ currentResponse, forecastResponse, city }) {
  const utcOffsetSeconds =
    typeof currentResponse?.timezone === 'number'
      ? currentResponse.timezone
      : typeof forecastResponse?.city?.timezone === 'number'
        ? forecastResponse.city.timezone
        : 0;

  const currentWeatherObj = currentResponse?.weather?.[0] || {};
  const mappedCurrent = mapOpenWeatherCondition(
    currentWeatherObj.id,
    currentWeatherObj.description
  );

  const iconStr = String(currentWeatherObj.icon || '');
  const isDay = iconStr ? !iconStr.endsWith('n') : true;

  const forecast = groupOpenWeatherFiveDayForecast(forecastResponse, utcOffsetSeconds);
  const todayKey =
    typeof currentResponse?.dt === 'number'
      ? getCityLocalDateKey(currentResponse.dt, utcOffsetSeconds)
      : null;
  const todayForecast = todayKey ? forecast.find((d) => d.dateKey === todayKey) : forecast[0];

  const windSpeedMs = currentResponse?.wind?.speed;
  const windSpeedKmh = typeof windSpeedMs === 'number' ? windSpeedMs * 3.6 : null;

  return {
    city: {
      id: city.id,
      name: city.name || currentResponse?.name || 'Unknown City',
      region: city.region || '',
      country: city.country || currentResponse?.sys?.country || '',
      lat: Number(city.lat),
      lon: Number(city.lon),
    },
    provider: 'openweathermap',
    providerLabel: 'OpenWeatherMap',
    isFallback: false,
    fallbackReason: null,
    utcOffsetSeconds,
    observedAtUnix:
      typeof currentResponse?.dt === 'number'
        ? currentResponse.dt
        : Math.floor(Date.now() / 1000),
    fetchedAt: new Date().toISOString(),
    current: {
      tempC: Number(currentResponse?.main?.temp),
      feelsLikeC: Number(currentResponse?.main?.feels_like ?? currentResponse?.main?.temp),
      tempHighC:
        todayForecast?.tempMaxC ??
        (typeof currentResponse?.main?.temp_max === 'number'
          ? currentResponse.main.temp_max
          : null),
      tempLowC:
        todayForecast?.tempMinC ??
        (typeof currentResponse?.main?.temp_min === 'number'
          ? currentResponse.main.temp_min
          : null),
      conditionCode: mappedCurrent.conditionCode,
      conditionLabel: mappedCurrent.conditionLabel,
      isDay,
      humidity:
        typeof currentResponse?.main?.humidity === 'number'
          ? currentResponse.main.humidity
          : null,
      windSpeedKmh,
      windDirectionDeg:
        typeof currentResponse?.wind?.deg === 'number' ? currentResponse.wind.deg : null,
      pressureHpa:
        typeof currentResponse?.main?.pressure === 'number'
          ? currentResponse.main.pressure
          : null,
      visibilityMeters:
        typeof currentResponse?.visibility === 'number' ? currentResponse.visibility : null,
      sunrise:
        typeof currentResponse?.sys?.sunrise === 'number'
          ? currentResponse.sys.sunrise
          : null,
      sunset:
        typeof currentResponse?.sys?.sunset === 'number' ? currentResponse.sys.sunset : null,
    },
    forecast,
  };
}

export function normalizeOpenMeteo({ response, city, fallbackReason = null }) {
  const current = response?.current || {};
  const daily = response?.daily || {};
  const utcOffsetSeconds =
    typeof response?.utc_offset_seconds === 'number' ? response.utc_offset_seconds : 0;

  const mappedCurrent = mapWmoWeatherCode(current.weather_code);
  const times = Array.isArray(daily.time) ? daily.time : [];

  const forecast = times.slice(0, 5).map((dateKey, index) => {
    const code = Array.isArray(daily.weather_code) ? daily.weather_code[index] : 0;
    const mapped = mapWmoWeatherCode(code);
    const maxVal = Array.isArray(daily.temperature_2m_max)
      ? daily.temperature_2m_max[index]
      : null;
    const minVal = Array.isArray(daily.temperature_2m_min)
      ? daily.temperature_2m_min[index]
      : null;
    const popVal = Array.isArray(daily.precipitation_probability_max)
      ? daily.precipitation_probability_max[index]
      : null;

    return {
      dateKey,
      tempMaxC: typeof maxVal === 'number' ? maxVal : Number(current.temperature_2m ?? 0),
      tempMinC: typeof minVal === 'number' ? minVal : Number(current.temperature_2m ?? 0),
      conditionCode: mapped.conditionCode,
      conditionLabel: mapped.conditionLabel,
      precipitationProbability: typeof popVal === 'number' ? popVal : null,
    };
  });

  let observedAtUnix = Math.floor(Date.now() / 1000);
  if (typeof current.time === 'string') {
    const isoUtcStr = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(current.time)
      ? `${current.time}:00Z`
      : current.time.endsWith('Z')
        ? current.time
        : `${current.time}Z`;
    const parsedMs = Date.parse(isoUtcStr);
    if (!Number.isNaN(parsedMs)) {
      observedAtUnix = Math.floor(parsedMs / 1000) - utcOffsetSeconds;
    }
  }

  const sunriseToday = Array.isArray(daily.sunrise) ? daily.sunrise[0] ?? null : null;
  const sunsetToday = Array.isArray(daily.sunset) ? daily.sunset[0] ?? null : null;

  return {
    city: {
      id: city.id,
      name: city.name,
      region: city.region || '',
      country: city.country || '',
      lat: Number(city.lat),
      lon: Number(city.lon),
    },
    provider: 'open-meteo',
    providerLabel: 'Open-Meteo',
    isFallback: true,
    fallbackReason,
    utcOffsetSeconds,
    observedAtUnix: Number.isNaN(observedAtUnix)
      ? Math.floor(Date.now() / 1000)
      : observedAtUnix,
    fetchedAt: new Date().toISOString(),
    current: {
      tempC: Number(current.temperature_2m),
      feelsLikeC: Number(current.apparent_temperature ?? current.temperature_2m),
      tempHighC: forecast[0]?.tempMaxC ?? null,
      tempLowC: forecast[0]?.tempMinC ?? null,
      conditionCode: mappedCurrent.conditionCode,
      conditionLabel: mappedCurrent.conditionLabel,
      isDay: current.is_day === 0 ? false : true,
      humidity:
        typeof current.relative_humidity_2m === 'number'
          ? current.relative_humidity_2m
          : null,
      windSpeedKmh:
        typeof current.wind_speed_10m === 'number' ? current.wind_speed_10m : null,
      windDirectionDeg:
        typeof current.wind_direction_10m === 'number' ? current.wind_direction_10m : null,
      pressureHpa:
        typeof current.pressure_msl === 'number' ? current.pressure_msl : null,
      visibilityMeters: null,
      sunrise: sunriseToday,
      sunset: sunsetToday,
    },
    forecast,
  };
}
