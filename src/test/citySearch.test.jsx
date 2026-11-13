
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CitySearch } from '../components/CitySearch.jsx';
import {
  clearCitySearchCache,
  searchCities,
} from '../features/search/citySearchService.js';

function jsonResponse(payload, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
  };
}

describe('CitySearch component and provider fallback', () => {
  beforeEach(() => {
    clearCitySearchCache();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    clearCitySearchCache();
  });

  it('uses Open-Meteo when GeoDB returns no CITY match for Lahore', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({ data: [], metadata: { totalCount: 0 } })
      )
      .mockResolvedValueOnce(
        jsonResponse({
          results: [
            {
              id: 1172451,
              name: 'Lahore',
              latitude: 31.558,
              longitude: 74.35071,
              timezone: 'Asia/Karachi',
              country_code: 'PK',
              country: 'Pakistan',
              admin1: 'Punjab',
              admin2: 'Lahore District',
              population: 13004135,
            },
          ],
        })
      );

    vi.stubGlobal('fetch', fetchMock);

    const result = await searchCities('Lahore', {
      rapidApiKey: 'test-rapidapi-key',
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);

    const geoDbUrl = new URL(fetchMock.mock.calls[0][0]);

    expect(geoDbUrl.hostname).toBe('wft-geo-db.p.rapidapi.com');
    expect(geoDbUrl.searchParams.get('namePrefix')).toBe('Lahore');
    expect(geoDbUrl.searchParams.get('types')).toBe('CITY');

    const openMeteoUrl = new URL(fetchMock.mock.calls[1][0]);

    expect(openMeteoUrl.hostname).toBe('geocoding-api.open-meteo.com');
    expect(openMeteoUrl.searchParams.get('name')).toBe('Lahore');
    expect(openMeteoUrl.searchParams.get('countryCode')).toBeNull();

    expect(result.provider).toBe('open-meteo-geocoding');
    expect(result.providerLabel).toBe('Open-Meteo Geocoding');
    expect(result.isFallback).toBe(true);
    expect(result.configNotice).toMatch(
      /GeoDB returned no matching CITY records/i
    );

    expect(result.cities[0]).toEqual(
      expect.objectContaining({
        name: 'Lahore',
        country: 'Pakistan',
        countryCode: 'PK',
        region: 'Punjab',
        lat: 31.558,
        lon: 74.35071,
      })
    );
  });

  it('uses Open-Meteo when GeoDB is rate-limited', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({}, 429))
      .mockResolvedValueOnce(
        jsonResponse({
          results: [
            {
              id: 1172451,
              name: 'Lahore',
              latitude: 31.558,
              longitude: 74.35071,
              country_code: 'PK',
              country: 'Pakistan',
              admin1: 'Punjab',
            },
          ],
        })
      );

    vi.stubGlobal('fetch', fetchMock);

    const result = await searchCities('Lahore', {
      rapidApiKey: 'test-rapidapi-key',
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.isFallback).toBe(true);
    expect(result.configNotice).toMatch(/rate limit/i);
    expect(result.cities[0].name).toBe('Lahore');
  });

  it('keeps GeoDB as the primary provider when it returns a city', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        data: [
          {
            id: 92643,
            type: 'CITY',
            city: 'Karachi',
            name: 'Karachi',
            country: 'Pakistan',
            countryCode: 'PK',
            region: 'Sindh',
            latitude: 24.86,
            longitude: 67.01,
            population: 14910352,
          },
        ],
      })
    );

    vi.stubGlobal('fetch', fetchMock);

    const result = await searchCities('Karachi', {
      rapidApiKey: 'test-rapidapi-key',
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.provider).toBe('geodb');
    expect(result.isFallback).toBe(false);

    expect(result.cities[0]).toEqual(
      expect.objectContaining({
        name: 'Karachi',
        lat: 24.86,
        lon: 67.01,
      })
    );
  });

  it('aborts earlier in-flight requests so stale results do not overwrite newer queries', async () => {
    let firstSignal;

    const fetchMock = vi.fn((url, options) => {
      const parsed = new URL(url);
      const q =
        parsed.searchParams.get('name') ||
        parsed.searchParams.get('namePrefix');

      if (q === 'Ka') {
        firstSignal = options?.signal;

        return new Promise((_, reject) => {
          firstSignal?.addEventListener('abort', () => {
            const err = new Error('Aborted');
            err.name = 'AbortError';
            reject(err);
          });
        });
      }

      return Promise.resolve(
        jsonResponse({
          data: [
            {
              id: 92643,
              type: 'CITY',
              city: 'Karachi',
              name: 'Karachi',
              country: 'Pakistan',
              countryCode: 'PK',
              region: 'Sindh',
              latitude: 24.8607,
              longitude: 67.0011,
            },
          ],
        })
      );
    });

    vi.stubGlobal('fetch', fetchMock);
    const onSelectCity = vi.fn();

    render(<CitySearch isOnline={true} onSelectCity={onSelectCity} />);

    const input = screen.getByRole('combobox', {
      name: /search for a city/i,
    });

    fireEvent.change(input, {
      target: { value: 'Ka' },
    });

    await act(async () => {
      vi.advanceTimersByTime(260);
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);

    fireEvent.change(input, {
      target: { value: 'Karachi' },
    });

    await act(async () => {
      vi.advanceTimersByTime(260);
    });

    expect(firstSignal.aborted).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const option = screen.getByRole('option', {
      name: /karachi/i,
    });

    fireEvent.click(option);

    expect(onSelectCity).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Karachi',
        lat: 24.8607,
        lon: 67.0011,
      })
    );

    await act(async () => {
      vi.advanceTimersByTime(400);
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('does not loop API calls when GeoDB and its fallback are rate-limited', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({}, 429))
      .mockResolvedValueOnce(jsonResponse({}, 429));

    vi.stubGlobal('fetch', fetchMock);

    render(<CitySearch isOnline={true} onSelectCity={vi.fn()} />);

    const input = screen.getByRole('combobox', {
      name: /search for a city/i,
    });

    fireEvent.change(input, {
      target: { value: 'London' },
    });

    await act(async () => {
      vi.advanceTimersByTime(260);
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(screen.getByText(/rate limit reached/i)).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
