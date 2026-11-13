import { useEffect, useId, useRef } from 'react';
import { AlertCircle, Loader2, MapPin, Search, X } from 'lucide-react';
import { useCitySearch } from '../hooks/useCitySearch.js';

export function CitySearch({ isOnline, onSelectCity }) {
  const inputId = useId();
  const listboxId = useId();
  const containerRef = useRef(null);

  const {
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
  } = useCitySearch({ isOnline, onSelectCity });

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        closeDropdown();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [closeDropdown]);

  const activeDescendantId =
    isOpen && activeIndex >= 0 && suggestions[activeIndex]
      ? `${listboxId}-option-${activeIndex}`
      : undefined;

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit} role="search" noValidate className="relative">
        <label htmlFor={inputId} className="sr-only">
          Search for a city
        </label>
        <div className="relative flex items-center">
          <Search
            className="pointer-events-none absolute left-3.5 h-4 w-4 text-[#697386] dark:text-[#94A3B8]"
            aria-hidden="true"
          />
          <input
            id={inputId}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onBlur={handleBlurValidation}
            onFocus={() => {
              if (suggestions.length > 0 || apiError || (hasSearched && query.trim().length >= 2)) {
                setIsOpen(true);
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search city (e.g. Karachi, London, Tokyo)..."
            autoComplete="off"
            spellCheck="false"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={isOpen}
            aria-controls={listboxId}
            aria-activedescendant={activeDescendantId}
            aria-invalid={Boolean(validationError)}
            className="min-h-[44px] w-full rounded-xl border border-[#E6EAF1] bg-[#F5F7FB] pl-10 pr-11 text-sm text-[#172033] placeholder-[#697386] transition-colors focus:border-[#4778E8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4778E8]/20 dark:border-[#1F2B3E] dark:bg-[#0B1120] dark:text-[#F1F5F9] dark:placeholder-[#94A3B8] dark:focus:border-[#5C8DF6] dark:focus:bg-[#111827] dark:focus:ring-[#5C8DF6]/20"
          />

          {isLoading ? (
            <span
              className="absolute right-3 flex h-8 w-8 items-center justify-center text-[#4778E8] dark:text-[#5C8DF6]"
              aria-label="Searching cities"
            >
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            </span>
          ) : query ? (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Clear search"
              className="absolute right-1 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-[#697386] transition-colors hover:text-[#172033] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4778E8] dark:text-[#94A3B8] dark:hover:text-[#F1F5F9]"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </form>

      {validationError && (
        <p role="alert" className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">
          {validationError}
        </p>
      )}

      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          aria-label="City suggestions"
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-40 overflow-hidden rounded-xl border border-[#E6EAF1] bg-white shadow-lg dark:border-[#1F2B3E] dark:bg-[#111827]"
        >
          {isLoading && suggestions.length === 0 && (
            <div className="flex items-center gap-2.5 px-4 py-3.5 text-sm text-[#697386] dark:text-[#94A3B8]">
              <Loader2 className="h-4 w-4 animate-spin text-[#4778E8] dark:text-[#5C8DF6]" aria-hidden="true" />
              <span>Searching cities...</span>
            </div>
          )}

          {!isLoading && apiError && (
            <div className="p-4">
              <div className="flex items-start gap-2.5 text-sm text-rose-700 dark:text-rose-300">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{apiError.message}</p>
                  {apiError.guidance && (
                    <p className="mt-1 text-xs text-[#697386] dark:text-[#94A3B8]">
                      {apiError.guidance}
                    </p>
                  )}
                </div>
              </div>
              {isOnline && (
                <button
                  type="button"
                  onClick={retrySearch}
                  className="mt-3 inline-flex min-h-[44px] items-center rounded-lg border border-[#E6EAF1] px-3 py-1.5 text-xs font-medium text-[#172033] transition-colors hover:bg-[#F5F7FB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4778E8] dark:border-[#1F2B3E] dark:text-[#F1F5F9] dark:hover:bg-[#1F2B3E]"
                >
                  Retry search
                </button>
              )}
            </div>
          )}

          {!isLoading && !apiError && suggestions.length > 0 && (
            <ul className="divide-y divide-[#E6EAF1] dark:divide-[#1F2B3E]">
              {suggestions.map((city, index) => {
                const isActive = index === activeIndex;
                return (
                  <li
                    key={city.id}
                    id={`${listboxId}-option-${index}`}
                    role="option"
                    aria-selected={isActive}
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                    }}
                    onClick={() => selectCity(city)}
                    className={`flex min-h-[48px] cursor-pointer items-center justify-between gap-3 px-4 py-2.5 transition-colors ${
                      isActive
                        ? 'bg-[#4778E8]/10 text-[#172033] dark:bg-[#5C8DF6]/15 dark:text-[#F1F5F9]'
                        : 'text-[#172033] hover:bg-[#F5F7FB] dark:text-[#F1F5F9] dark:hover:bg-[#192338]'
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <MapPin
                        className={`h-4 w-4 shrink-0 ${
                          isActive
                            ? 'text-[#4778E8] dark:text-[#5C8DF6]'
                            : 'text-[#697386] dark:text-[#94A3B8]'
                        }`}
                        aria-hidden="true"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{city.name}</p>
                        <p className="truncate text-xs text-[#697386] dark:text-[#94A3B8]">
                          {[city.region, city.country].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 font-mono-tabular text-xs text-[#697386] dark:text-[#94A3B8]">
                      {city.lat.toFixed(2)}, {city.lon.toFixed(2)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}

          {!isLoading && !apiError && hasSearched && suggestions.length === 0 && (
            <div className="px-4 py-3.5 text-sm text-[#697386] dark:text-[#94A3B8]">
              No cities matched &ldquo;{query.trim()}&rdquo;. Check spelling or try a larger nearby city.
            </div>
          )}

          {providerMeta.configNotice && !apiError && (
            <div className="border-t border-[#E6EAF1] bg-[#F5F7FB] px-4 py-2 text-[11px] text-[#697386] dark:border-[#1F2B3E] dark:bg-[#0B1120] dark:text-[#94A3B8]">
              {providerMeta.configNotice}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
