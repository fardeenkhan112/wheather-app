import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getWeatherForCity,
  loadCachedWeatherSnapshot,
} from '../features/weather/weatherService.js';

export function useWeather({ isOnline = true } = {}) {
  const [weather, setWeather] = useState(() => loadCachedWeatherSnapshot());
  const [selectedCity, setSelectedCity] = useState(() => {
    const cached = loadCachedWeatherSnapshot();
    return cached ? cached.city : null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isShowingCachedData, setIsShowingCachedData] = useState(() => {
    const cached = loadCachedWeatherSnapshot();
    return Boolean(cached && typeof navigator !== 'undefined' && !navigator.onLine);
  });
  const [previewMap, setPreviewMap] = useState(() => {
    const cached = loadCachedWeatherSnapshot();
    if (!cached?.city?.id) return {};
    return {
      [cached.city.id]: {
        tempC: cached.current.tempC,
        conditionCode: cached.current.conditionCode,
      },
    };
  });

  const abortControllerRef = useRef(null);
  const hasInitialFetchedRef = useRef(false);

  const loadWeatherForCity = useCallback(
    async (city, { keepExistingOnFail = true } = {}) => {
      if (!city) return;

      setSelectedCity(city);
      setError(null);

      // If offline, serve cached snapshot if it matches or inform user cleanly
      if (!isOnline) {
        const cached = loadCachedWeatherSnapshot();
        if (cached && cached.city) {
          setWeather(cached);
          setIsShowingCachedData(true);
          if (
            cached.city.id !== city.id &&
            cached.city.name.toLowerCase() !== city.name.toLowerCase()
          ) {
            setError({
              message: `Offline: live weather for ${city.name} cannot be fetched without an internet connection.`,
              guidance: `Showing the last cached snapshot for ${cached.city.name} instead. Reconnect to load ${city.name}.`,
              code: 'OFFLINE',
            });
          }
        } else {
          setWeather(null);
          setIsShowingCachedData(false);
          setError({
            message: `Offline: cannot load weather for ${city.name}.`,
            guidance:
              'No cached weather snapshot is available yet. Connect to the internet and try again.',
            code: 'OFFLINE_NO_CACHE',
          });
        }
        return;
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsLoading(true);
      try {
        const normalized = await getWeatherForCity(city, {
          signal: controller.signal,
        });
        setWeather(normalized);
        setSelectedCity(normalized.city);
        setIsShowingCachedData(false);
        setError(null);
        setPreviewMap((prev) => ({
          ...prev,
          [normalized.city.id]: {
            tempC: normalized.current.tempC,
            conditionCode: normalized.current.conditionCode,
          },
        }));
      } catch (err) {
        if (err && err.name === 'AbortError') {
          return;
        }
        const cached = keepExistingOnFail ? loadCachedWeatherSnapshot() : null;
        if (cached) {
          setWeather(cached);
          setIsShowingCachedData(true);
        }
        setError({
          message: err?.message || `Failed to load weather for ${city.name}.`,
          guidance:
            err?.guidance ||
            'Check your internet connection or API configuration and click Retry.',
          code: err?.code || 'WEATHER_ERROR',
        });
      } finally {
        if (abortControllerRef.current === controller) {
          setIsLoading(false);
        }
      }
    },
    [isOnline]
  );

  // Mark displayed weather as cached snapshot when going offline mid-session
  useEffect(() => {
    if (!isOnline && weather) {
      setIsShowingCachedData(true);
    }
  }, [isOnline, weather]);

  // On initial mount, refresh the last-viewed city if online
  useEffect(() => {
    if (hasInitialFetchedRef.current) return;
    hasInitialFetchedRef.current = true;

    const cached = loadCachedWeatherSnapshot();
    if (cached?.city && isOnline) {
      loadWeatherForCity(cached.city);
    }
  }, [isOnline, loadWeatherForCity]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const refreshWeather = useCallback(() => {
    const targetCity = selectedCity || weather?.city;
    if (targetCity) {
      loadWeatherForCity(targetCity);
    }
  }, [loadWeatherForCity, selectedCity, weather]);

  return {
    weather,
    selectedCity,
    isLoading,
    error,
    isShowingCachedData,
    previewMap,
    loadWeatherForCity,
    refreshWeather,
  };
}
