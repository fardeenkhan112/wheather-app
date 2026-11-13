import { Bookmark, BookmarkCheck, Info, RefreshCw } from 'lucide-react';
import {
  formatCityLocalDateTime,
  formatLastUpdated,
  formatUtcOffset,
} from '../utils/dateUtils.js';
import { formatTemperature } from '../utils/temperatureUtils.js';
import { WeatherIcon } from './WeatherIcon.jsx';

export function CurrentWeather({
  weather,
  unit,
  isFavourite,
  isRefreshing,
  isOnline,
  isShowingCachedData,
  onToggleFavourite,
  onRefresh,
}) {
  if (!weather) return null;

  const { city, current, utcOffsetSeconds, observedAtUnix, fetchedAt, providerLabel, isFallback, fallbackReason } =
    weather;

  const locationSubtitle = [city.region, city.country].filter(Boolean).join(', ');
  const localTimeText = formatCityLocalDateTime(observedAtUnix, utcOffsetSeconds);
  const utcOffsetText = formatUtcOffset(utcOffsetSeconds);

  return (
    <section
      aria-labelledby="current-weather-heading"
      className="rounded-2xl border border-[#E6EAF1] bg-white p-5 sm:p-6 dark:border-[#1F2B3E] dark:bg-[#111827]"
    >
      {/* Top row: Location + Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <h1
              id="current-weather-heading"
              className="text-2xl font-bold tracking-tight text-[#172033] sm:text-3xl dark:text-[#F1F5F9]"
            >
              {city.name}
            </h1>
            {locationSubtitle && (
              <span className="text-sm font-medium text-[#697386] dark:text-[#94A3B8]">
                {locationSubtitle}
              </span>
            )}
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-[#697386] tabular-nums dark:text-[#94A3B8]">
            <span>Local observation: {localTimeText}</span>
            {utcOffsetText && (
              <>
                <span aria-hidden="true">·</span>
                <span>{utcOffsetText}</span>
              </>
            )}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onToggleFavourite}
            aria-pressed={isFavourite}
            className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4778E8] whitespace-nowrap ${
              isFavourite
                ? 'border-[#4778E8]/30 bg-[#4778E8]/10 text-[#4778E8] hover:bg-[#4778E8]/15 dark:border-[#5C8DF6]/40 dark:bg-[#5C8DF6]/15 dark:text-[#5C8DF6]'
                : 'border-[#E6EAF1] bg-[#F5F7FB] text-[#172033] hover:bg-[#E6EAF1]/70 dark:border-[#1F2B3E] dark:bg-[#0B1120] dark:text-[#F1F5F9] dark:hover:bg-[#1F2B3E]'
            }`}
          >
            {isFavourite ? (
              <BookmarkCheck className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Bookmark className="h-4 w-4" aria-hidden="true" />
            )}
            <span>{isFavourite ? 'Saved' : 'Save city'}</span>
          </button>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing || !isOnline}
            aria-label="Refresh weather data"
            title={isOnline ? 'Refresh weather data' : 'Offline — cannot refresh'}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-[#E6EAF1] bg-white text-[#697386] transition-colors hover:bg-[#F5F7FB] hover:text-[#172033] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4778E8] dark:border-[#1F2B3E] dark:bg-[#0B1120] dark:text-[#94A3B8] dark:hover:bg-[#1F2B3E] dark:hover:text-[#F1F5F9]"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-[#4778E8] dark:text-[#5C8DF6]' : ''}`}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      {/* Main Temperature & Condition Display */}
      <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#F5F7FB] dark:bg-[#0B1120]">
            <WeatherIcon
              conditionCode={current.conditionCode}
              isDay={current.isDay}
              className="h-10 w-10"
            />
          </div>
          <div>
            <div className="text-5xl font-bold tracking-tight text-[#172033] tabular-nums sm:text-6xl dark:text-[#F1F5F9]">
              {formatTemperature(current.tempC, unit)}
            </div>
            <p className="mt-1 text-base font-medium text-[#172033] dark:text-[#F1F5F9]">
              {current.conditionLabel}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#E6EAF1] pt-4 text-sm text-[#697386] sm:border-t-0 sm:pt-0 sm:text-right dark:border-[#1F2B3E] dark:text-[#94A3B8]">
          <div>
            <span className="block text-xs">Feels like</span>
            <span className="font-semibold text-[#172033] tabular-nums dark:text-[#F1F5F9]">
              {formatTemperature(current.feelsLikeC, unit)}
            </span>
          </div>
          {current.tempHighC !== null && current.tempLowC !== null && (
            <div>
              <span className="block text-xs">High / Low</span>
              <span className="font-semibold text-[#172033] tabular-nums dark:text-[#F1F5F9]">
                {formatTemperature(current.tempHighC, unit, { includeUnit: false })} /{' '}
                {formatTemperature(current.tempLowC, unit, { includeUnit: false })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Honest Provider Attribution & Last Updated Metadata (unboxed text with · separators) */}
      <div className="mt-5 flex flex-col gap-1.5 border-t border-[#E6EAF1] pt-3.5 text-xs text-[#697386] dark:border-[#1F2B3E] dark:text-[#94A3B8]">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>
            Source: <strong className="font-medium text-[#172033] dark:text-[#F1F5F9]">{providerLabel}</strong>
          </span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">
            Updated {formatLastUpdated(fetchedAt)}
          </span>
          {isShowingCachedData && (
            <>
              <span aria-hidden="true">·</span>
              <span className="font-medium text-amber-700 dark:text-amber-300">
                Cached snapshot
              </span>
            </>
          )}
        </div>
        {isFallback && fallbackReason && (
          <p className="flex items-start gap-1.5 text-[11px] text-[#697386] dark:text-[#94A3B8]">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#4778E8] dark:text-[#5C8DF6]" aria-hidden="true" />
            <span>{fallbackReason}</span>
          </p>
        )}
      </div>
    </section>
  );
}
