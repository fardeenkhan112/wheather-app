import { RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { formatLastUpdated } from '../utils/dateUtils.js';

export function OfflineBanner({
  isOnline,
  isShowingCachedData,
  reconnectedSinceOffline,
  lastUpdated,
  cityName,
  onRefresh,
  onDismissReconnected,
}) {
  if (!isOnline) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="mb-5 flex flex-col gap-2 rounded-2xl border border-amber-300/80 bg-amber-50 px-4 py-3 text-sm text-amber-950 sm:flex-row sm:items-center sm:justify-between dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-100"
      >
        <div className="flex items-start gap-2.5 sm:items-center">
          <WifiOff className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 sm:mt-0 dark:text-amber-300" aria-hidden="true" />
          <div>
            <p className="font-semibold">You are offline</p>
            <p className="text-xs text-amber-800 dark:text-amber-200/90">
              {isShowingCachedData && cityName
                ? `Showing cached weather for ${cityName} · Last updated ${formatLastUpdated(lastUpdated)}.`
                : 'Live weather and city search require an internet connection.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (reconnectedSinceOffline && isShowingCachedData) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="mb-5 flex flex-col gap-3 rounded-2xl border border-emerald-300/80 bg-emerald-50 px-4 py-3 text-sm text-emerald-950 sm:flex-row sm:items-center sm:justify-between dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-100"
      >
        <div className="flex items-center gap-2.5">
          <Wifi className="h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-300" aria-hidden="true" />
          <p className="text-xs sm:text-sm">
            Connection restored. Refresh to fetch the latest weather for {cityName || 'this city'}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              onRefresh();
              onDismissReconnected();
            }}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 whitespace-nowrap"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            Refresh weather
          </button>
        </div>
      </div>
    );
  }

  return null;
}
