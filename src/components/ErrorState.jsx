import { AlertTriangle, RefreshCw } from 'lucide-react';

export function ErrorState({ error, isOnline, onRetry }) {
  if (!error) return null;

  return (
    <section
      role="alert"
      className="rounded-2xl border border-rose-300/80 bg-white p-5 sm:p-6 dark:border-rose-500/30 dark:bg-[#111827]"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold text-[#172033] dark:text-[#F1F5F9]">
            Unable to update weather
          </h2>
          <p className="mt-1 text-sm text-[#172033] dark:text-[#F1F5F9]">
            {error.message}
          </p>
          {error.guidance && (
            <p className="mt-1 text-xs leading-relaxed text-[#697386] dark:text-[#94A3B8]">
              {error.guidance}
            </p>
          )}
          {isOnline && onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#4778E8] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#3866D1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4778E8] dark:bg-[#5C8DF6] dark:hover:bg-[#4778E8]"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              Retry weather request
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
