import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  addFavouriteCity,
  FAVOURITES_STORAGE_KEY,
  loadFavourites,
  MAX_FAVOURITES,
  removeFavouriteCity,
} from '../features/favourites/favouritesStorage.js';

const makeCity = (n) => ({
  id: `geodb:${n}`,
  name: `City ${n}`,
  region: 'Region',
  country: 'Country',
  lat: 10 + n,
  lon: 20 + n,
});

describe('favourites storage and rules', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('prevents adding duplicate cities', () => {
    const first = addFavouriteCity([], makeCity(1));
    expect(first.ok).toBe(true);
    expect(first.items).toHaveLength(1);

    const dup = addFavouriteCity(first.items, makeCity(1));
    expect(dup.ok).toBe(false);
    expect(dup.code).toBe('DUPLICATE');
    expect(dup.items).toHaveLength(1);
  });

  it('enforces a maximum of five favourite cities', () => {
    let list = [];
    for (let i = 1; i <= MAX_FAVOURITES; i++) {
      const res = addFavouriteCity(list, makeCity(i));
      expect(res.ok).toBe(true);
      list = res.items;
    }

    expect(list).toHaveLength(5);
    const sixth = addFavouriteCity(list, makeCity(6));
    expect(sixth.ok).toBe(false);
    expect(sixth.code).toBe('LIMIT_REACHED');
    expect(sixth.items).toHaveLength(5);
  });

  it('persists favourites to localStorage and removes cities cleanly', () => {
    const added = addFavouriteCity([], makeCity(1));
    expect(loadFavourites().items).toHaveLength(1);

    const removed = removeFavouriteCity(added.items, makeCity(1));
    expect(removed.items).toHaveLength(0);
    expect(loadFavourites().items).toHaveLength(0);
  });

  it('recovers safely when localStorage contains corrupted JSON', () => {
    window.localStorage.setItem(FAVOURITES_STORAGE_KEY, '{corrupted_json');
    const loaded = loadFavourites();
    expect(loaded.items).toEqual([]);
    expect(loaded.storageWarning).toMatch(/corrupted/i);
  });

  it('degrades gracefully to in-memory state when localStorage is blocked', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Blocked', 'SecurityError');
    });

    const loaded = loadFavourites();
    expect(loaded.items).toEqual([]);
    expect(loaded.storageWarning).toMatch(/blocked|unavailable/i);

    const added = addFavouriteCity([], makeCity(1));
    expect(added.ok).toBe(true);
    expect(added.items).toHaveLength(1);
    expect(added.storageWarning).toMatch(/in memory/i);

    spy.mockRestore();
  });
});
