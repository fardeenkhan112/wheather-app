export function LoadingState({ cityName }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={cityName ? `Loading weather for ${cityName}` : 'Loading weather'}
      className="space-y-5"
    >
      <div className="rounded-2xl border border-[#E6EAF1] bg-white p-6 dark:border-[#1F2B3E] dark:bg-[#111827]">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-7 w-44 animate-pulse rounded-lg bg-[#E6EAF1] dark:bg-[#1F2B3E]" />
            <div className="h-3.5 w-56 animate-pulse rounded bg-[#E6EAF1] dark:bg-[#1F2B3E]" />
          </div>
          <div className="h-11 w-28 animate-pulse rounded-xl bg-[#E6EAF1] dark:bg-[#1F2B3E]" />
        </div>
        <div className="mt-6 flex items-center gap-4">
          <div className="h-16 w-16 animate-pulse rounded-2xl bg-[#E6EAF1] dark:bg-[#1F2B3E]" />
          <div className="space-y-2">
            <div className="h-12 w-32 animate-pulse rounded-lg bg-[#E6EAF1] dark:bg-[#1F2B3E]" />
            <div className="h-4 w-28 animate-pulse rounded bg-[#E6EAF1] dark:bg-[#1F2B3E]" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#E6EAF1] bg-white p-6 dark:border-[#1F2B3E] dark:bg-[#111827]">
        <div className="h-4 w-36 animate-pulse rounded bg-[#E6EAF1] dark:bg-[#1F2B3E]" />
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="space-y-2 border-t border-[#E6EAF1] pt-3 dark:border-[#1F2B3E]">
              <div className="h-3 w-16 animate-pulse rounded bg-[#E6EAF1] dark:bg-[#1F2B3E]" />
              <div className="h-5 w-20 animate-pulse rounded bg-[#E6EAF1] dark:bg-[#1F2B3E]" />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-[#E6EAF1] bg-white p-6 dark:border-[#1F2B3E] dark:bg-[#111827]">
        <div className="h-4 w-32 animate-pulse rounded bg-[#E6EAF1] dark:bg-[#1F2B3E]" />
        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-5">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={idx}
              className="h-24 animate-pulse rounded-xl border border-[#E6EAF1] bg-[#F5F7FB] dark:border-[#1F2B3E] dark:bg-[#0B1120]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
