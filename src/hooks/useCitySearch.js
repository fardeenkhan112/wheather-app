import { useCallback, useEffect, useRef, useState } from 'react';
import { searchCities } from '../features/search/citySearchService.js';
import { validateCitySearchInput } from '../utils/validation.js';

const DEBOUNCE_MS = 250;

export function useCitySearch({ isOnline = true, onSelectCity } = {}) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [hasSearched, setHasSearched] = useState(false);
  const [providerMeta, setProviderMeta] = useState({
    provider: null,
    providerLabel: null,
    isFallback: false,
    configNotice: null,
  });

  const abortControllerRef = useRef(null);
  const lastSubmittedQueryRef = useRef('');
  const lastHadErrorRef = useRef(false);
  const suppressNextDebounceRef = useRef(false);
  const requestIdRef = useRef(0);
  const isOnlineRef = useRef(isOnline);

  useEffect(() => {
    isOnlineRef.current = isOnline;
  }, [isOnline]);

  const abortInFlight = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const executeSearch = useCallback(
    async (rawQuery, { force = false } = {}) => {
      const validation = validateCitySearchInput(rawQuery);
      if (!validation.isValid) {
        abortInFlight();
        setSuggestions([]);
        setIsLoading(false);
        setApiError(null);
        setHasSearched(false);
        setIsOpen(false);
        if (force) {
          setValidationError(validation.error);
        }
        return;
      }

      if (!isOnlineRef.current) {
        abortInFlight();
        setIsLoading(false);
        setSuggestions([]);
        setHasSearched(true);
        setIsOpen(true);
        lastHadErrorRef.current = true;
        setApiError({
          message: 'You are offline. City search requires an internet connection.',
          guidance:
            'Reconnect to search for new cities, or view your cached weather snapshot below.',
          code: 'OFFLINE',
        });
        return;
      }

      const normalized = validation.normalizedQuery.toLowerCase();
      if (!force && normalized === lastSubmittedQueryRef.current && !lastHadErrorRef.current) {
        setIsOpen(true);
        return;
      }

      abortInFlight();
      const controller = new AbortController();
      abortControllerRef.current = controller;
      const currentRequestId = ++requestIdRef.current;
      lastSubmittedQueryRef.current = normalized;
      lastHadErrorRef.current = false;

      setValidationError(null);
      setApiError(null);
      setIsLoading(true);
      setIsOpen(true);

      try {
        const result = await searchCities(validation.normalizedQuery, {
          signal: controller.signal,
        });

        // Ignore stale response if a newer search request has started
        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        setSuggestions(result.cities);
        setHasSearched(true);
        setActiveIndex(result.cities.length > 0 ? 0 : -1);
        setProviderMeta({
          provider: result.provider,
          providerLabel: result.providerLabel,
          isFallback: result.isFallback,
          configNotice: result.configNotice,
        });
      } catch (err) {
        if (err && err.name === 'AbortError') {
          return;
        }
        if (currentRequestId !== requestIdRef.current) {
          return;
        }
        lastHadErrorRef.current = true;
        setSuggestions([]);
        setHasSearched(true);
        setActiveIndex(-1);
        setApiError({
          message: err?.message || 'Unable to search cities right now.',
          guidance: err?.guidance || 'Check your connection or API key and retry.',
          code: err?.code || 'API_ERROR',
        });
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setIsLoading(false);
        }
      }
    },
    [abortInFlight]
  );

  // Debounced autocomplete when >= 2 characters are typed
  useEffect(() => {
    if (suppressNextDebounceRef.current) {
      suppressNextDebounceRef.current = false;
      return undefined;
    }

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      abortInFlight();
      setSuggestions([]);
      setIsLoading(false);
      setApiError(null);
      setHasSearched(false);
      setIsOpen(false);
      setActiveIndex(-1);
      lastSubmittedQueryRef.current = '';
      lastHadErrorRef.current = false;
      return undefined;
    }

    const validation = validateCitySearchInput(query);
    if (!validation.isValid) {
      setValidationError(validation.error);
      setSuggestions([]);
      setIsOpen(false);
      return undefined;
    }

    setValidationError(null);
    const timer = setTimeout(() => {
      executeSearch(query);
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [query, abortInFlight, executeSearch]);

  useEffect(() => {
    return () => abortInFlight();
  }, [abortInFlight]);

  const handleQueryChange = (nextValue) => {
    suppressNextDebounceRef.current = false;
    setQuery(nextValue);
    if (!nextValue.trim()) {
      setValidationError(null);
    }
  };

  const handleBlurValidation = () => {
    const trimmed = query.trim();
    if (trimmed.length > 0 && trimmed.length < 2) {
      const check = validateCitySearchInput(trimmed);
      setValidationError(check.error);
    }
  };

  const selectCity = useCallback(
    (city) => {
      if (!city) return;
      abortInFlight();
      suppressNextDebounceRef.current = true;
      setQuery(`${city.name}${city.country ? `, ${city.country}` : ''}`);
      setIsOpen(false);
      setActiveIndex(-1);
      setValidationError(null);
      setApiError(null);
      lastSubmittedQueryRef.current = '';
      lastHadErrorRef.current = false;
      if (typeof onSelectCity === 'function') {
        onSelectCity(city);
      }
    },
    [abortInFlight, onSelectCity]
  );

  const handleSubmit = (event) => {
    if (event) {
      event.preventDefault();
    }
    const validation = validateCitySearchInput(query);
    if (!validation.isValid) {
      setValidationError(validation.error);
      return;
    }

    if (isOpen && activeIndex >= 0 && suggestions[activeIndex]) {
      selectCity(suggestions[activeIndex]);
      return;
    }

    executeSearch(query, { force: true });
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      if (isOpen) {
        event.preventDefault();
        setIsOpen(false);
        setActiveIndex(-1);
      }
      return;
    }

    if (event.key === 'ArrowDown') {
      if (suggestions.length > 0) {
        event.preventDefault();
        setIsOpen(true);
        setActiveIndex((prev) => (prev + 1) % suggestions.length);
      }
      return;
    }

    if (event.key === 'ArrowUp') {
      if (suggestions.length > 0) {
        event.preventDefault();
        setIsOpen(true);
        setActiveIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
      }
      return;
    }

    if (event.key === 'Enter' && isOpen && activeIndex >= 0 && suggestions[activeIndex]) {
      event.preventDefault();
      selectCity(suggestions[activeIndex]);
    }
  };

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setActiveIndex(-1);
  }, []);

  const clearSearch = useCallback(() => {
    abortInFlight();
    suppressNextDebounceRef.current = false;
    setQuery('');
    setSuggestions([]);
    setIsLoading(false);
    setApiError(null);
    setValidationError(null);
    setIsOpen(false);
    setHasSearched(false);
    setActiveIndex(-1);
    lastSubmittedQueryRef.current = '';
    lastHadErrorRef.current = false;
  }, [abortInFlight]);

  const retrySearch = useCallback(() => {
    executeSearch(query, { force: true });
  }, [executeSearch, query]);

  return {
    query,
    suggestions,
    isLoading,
    apiError,
    validationError,
    isOpen,
    activeIndex,
    hasSearched,
    providerMeta,
    setIsOpen,
    setActiveIndex,
    handleQueryChange,
    handleBlurValidation,
    handleSubmit,
    handleKeyDown,
    selectCity,
    closeDropdown,
    clearSearch,
    retrySearch,
  };
}
