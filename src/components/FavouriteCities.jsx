import { AlertCircle, Bookmark, Trash2 } from 'lucide-react';
import { isSameCity } from '../features/favourites/favouritesStorage.js';
import { formatTemperature } from '../utils/temperatureUtils.js';
import { WeatherIcon } from './WeatherIcon.jsx';

export function FavouriteCities({
  favourites,
  maxFavourites,
  activeCity,
  previewMap,
  unit,
  storageWarning,
  feedback,
  onSelectCity,
  onRequestRemove,
  onClearFeedback,
}) {
  return (
    <section
      aria-labelledby="favourites-heading"
      className="rounded-2xl border border-[#E6EAF1] bg-white p-5 dark:border-[#1F2B3E] dark:bg-[#111827]"
    >
      <div className="flex items-center justify-between gap-2">
        <h2
          id="favourites-heading"
          className="text-sm font-semibold text-[#172033] dark:text-[#F1F5F9]"
        >
          Saved cities
        </h2>
        <span className="text-xs font-medium text-[#697386] tabular-nums dark:text-[#94A3B8]">
          {favourites.length} / {maxFavourites}
        </span>
      </div>

      {storageWarning && (
        <div
          role="status"
          className="mt-3 flex items-start gap-2 rounded-xl border border-amber-300/70 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-200"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{storageWarning}</span>
        </div>
      )}

      {feedback && (
        <div
          role="status"
          className={`mt-3 flex items-start justify-between gap-2 rounded-xl border p-3 text-xs ${
            feedback.type === 'warning'
              ? 'border-amber-300/70 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-200'
              : 'border-[#E6EAF1] bg-[#F5F7FB] text-[#172033] dark:border-[#1F2B3E] dark:bg-[#0B1120] dark:text-[#F1F5F9]'
          }`}
        >
          <span>{feedback.message}</span>
          <button
            type="button"
            onClick={onClearFeedback}
            aria-label="Dismiss notice"
            className="shrink-0 font-medium text-[#4778E8] hover:underline dark:text-[#5C8DF6]"
          >
            Dismiss
          </button>
        </div>
      )}

      {favourites.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-[#E6EAF1] p-4 text-center dark:border-[#1F2B3E]">
          <Bookmark className="mx-auto h-5 w-5 text-[#697386] dark:text-[#94A3B8]" aria-hidden="true" />
          <p className="mt-2 text-xs leading-relaxed text-[#697386] dark:text-[#94A3B8]">
            No favourite cities yet. Search for a city and click <strong>Save city</strong> to pin up to{' '}
            {maxFavourites} locations here.
          </p>
        </div>
      ) : (
        <ul className="mt-3 divide-y divide-[#E6EAF1] dark:divide-[#1F2B3E]">
          {favourites.map((city) => {
            const isActive = isSameCity(city, activeCity);
            const preview = previewMap?.[city.id];
            const subtitle = [city.region, city.country].filter(Boolean).join(', ');

            return (
              <li key={city.id} className="flex items-center gap-2 py-1.5 first:pt-0 last:pb-0">
                <button
                  type="button"
                  onClick={() => onSelectCity(city)}
                  aria-current={isActive ? 'true' : undefined}
                  className={`flex min-h-[48px] min-w-0 flex-1 items-center justify-between gap-3 rounded-xl px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4778E8] ${
                    isActive
                      ? 'bg-[#4778E8]/10 text-[#172033] dark:bg-[#5C8DF6]/15 dark:text-[#F1F5F9]'
                      : 'text-[#172033] hover:bg-[#F5F7FB] dark:text-[#F1F5F9] dark:hover:bg-[#0B1120]'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {city.name}
                      {isActive && (
                        <span className="ml-2 text-[11px] font-medium text-[#4778E8] dark:text-[#5C8DF6]">
                          Active
                        </span>
                      )}
                    </p>
                    {subtitle && (
                      <p className="truncate text-xs text-[#697386] dark:text-[#94A3B8]">
                        {subtitle}
                      </p>
                    )}
                  </div>

                  {preview && (
                    <div className="flex shrink-0 items-center gap-1.5">
                      <WeatherIcon
                        conditionCode={preview.conditionCode}
                        className="h-4 w-4"
                      />
                      <span className="text-sm font-semibold tabular-nums">
                        {formatTemperature(preview.tempC, unit)}
                      </span>
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onRequestRemove(city)}
                  aria-label={`Remove ${city.name} from favourites`}
                  className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl text-[#697386] transition-colors hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4778E8] dark:text-[#94A3B8] dark:hover:bg-rose-950/50 dark:hover:text-rose-400"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
