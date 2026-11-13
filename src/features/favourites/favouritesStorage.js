/**
 * Favourites persistence and business rules:
 * - Maximum of 5 saved cities
 * - Duplicate prevention (by stable ID or matching coordinates/name)
 * - Safe recovery from corrupted or blocked localStorage
 */

import { readJson, writeJson } from '../../utils/storage.js';
import { isValidCityRecord } from '../../utils/validation.js';

export const FAVOURITES_STORAGE_KEY = 'weatherboard_favourites_v1';
export const MAX_FAVOURITES = 5;

export function isSameCity(a, b) {
  if (!a || !b) return false;
  if (a.id && b.id && a.id === b.id) return true;

  const sameCoords =
    Math.abs(Number(a.lat) - Number(b.lat)) < 0.02 &&
    Math.abs(Number(a.lon) - Number(b.lon)) < 0.02;
  const sameName =
    String(a.name || '').trim().toLowerCase() === String(b.name || '').trim().toLowerCase();

  return sameCoords && sameName;
}

export function loadFavourites() {
  const result = readJson(FAVOURITES_STORAGE_KEY, []);

  if (result.storageUnavailable) {
    return {
      items: [],
      storageWarning:
        'Browser storage is blocked or unavailable. Favourites will be kept temporarily in memory for this session.',
    };
  }

  if (result.corrupted || !Array.isArray(result.data)) {
    return {
      items: [],
      storageWarning:
        'Saved favourites data was corrupted and has been safely reset so you can continue using WeatherBoard.',
    };
  }

  const sanitized = result.data.filter(isValidCityRecord).slice(0, MAX_FAVOURITES);
  return {
    items: sanitized,
    storageWarning: null,
  };
}

export function saveFavourites(items) {
  const writeResult = writeJson(FAVOURITES_STORAGE_KEY, items);
  if (!writeResult.ok) {
    return {
      ok: false,
      storageWarning:
        'Unable to persist favourites to browser storage. Changes remain active in memory for this session.',
    };
  }
  return { ok: true, storageWarning: null };
}

export function addFavouriteCity(currentList, city) {
  if (!isValidCityRecord(city)) {
    return {
      ok: false,
      code: 'INVALID_CITY',
      message: 'Selected city is missing valid coordinates.',
      items: currentList,
    };
  }

  if (currentList.some((item) => isSameCity(item, city))) {
    return {
      ok: false,
      code: 'DUPLICATE',
      message: `${city.name} is already saved in your favourites.`,
      items: currentList,
    };
  }

  if (currentList.length >= MAX_FAVOURITES) {
    return {
      ok: false,
      code: 'LIMIT_REACHED',
      message: `You can save up to ${MAX_FAVOURITES} favourite cities. Remove one before adding ${city.name}.`,
      items: currentList,
    };
  }

  const normalizedCity = {
    id: city.id || `city:${city.name}-${Number(city.lat).toFixed(3)}-${Number(city.lon).toFixed(3)}`,
    name: city.name,
    region: city.region || '',
    country: city.country || '',
    lat: Number(city.lat),
    lon: Number(city.lon),
  };

  const nextItems = [...currentList, normalizedCity];
  const persistResult = saveFavourites(nextItems);

  return {
    ok: true,
    items: nextItems,
    storageWarning: persistResult.storageWarning,
  };
}

export function removeFavouriteCity(currentList, cityToRemove) {
  const nextItems = currentList.filter((item) => !isSameCity(item, cityToRemove));
  const persistResult = saveFavourites(nextItems);

  return {
    ok: true,
    items: nextItems,
    storageWarning: persistResult.storageWarning,
  };
}
