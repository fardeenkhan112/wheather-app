import { CloudSun, MapPin, WifiOff } from 'lucide-react';

const QUICK_START_CITIES = [
  { id: 'preset:karachi', name: 'Karachi', region: 'Sindh', country: 'Pakistan', lat: 24.8607, lon: 67.0011 },
  { id: 'preset:london', name: 'London', region: 'England', country: 'United Kingdom', lat: 51.5074, lon: -0.1278 },
  { id: 'preset:tokyo', name: 'Tokyo', region: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503 },
  { id: 'preset:new-york', name: 'New York', region: 'New York', country: 'United States', lat: 40.7128, lon: -74.006 },
];

export function EmptyState({ isOnline, onSelectQuickCity }) {
  if (!isOnline) {
    return (
      <section className="rounded-2xl border border-[#E6EAF1] bg-white p-8 text-center dark:border-[#1F2B3E] dark:bg-[#111827]">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
          <WifiOff className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="mt-4 text-lg font-semibold text-[#172033] dark:text-[#F1F5F9]">
          No cached weather available offline
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#697386] dark:text-[#94A3B8]">
          You are currently offline and no city has been viewed yet. Reconnect to search for a city; WeatherBoard will automatically cache your most recent forecast for offline access.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-[#E6EAF1] bg-white p-6 sm:p-8 dark:border-[#1F2B3E] dark:bg-[#111827]">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#4778E8]/10 text-[#4778E8] dark:bg-[#5C8DF6]/15 dark:text-[#5C8DF6]">
        <CloudSun className="h-6 w-6" aria-hidden="true" />
      </div>
      <h1 className="mt-4 text-xl font-bold tracking-tight text-[#172033] sm:text-2xl dark:text-[#F1F5F9]">
        Check live weather and 5-day forecasts
      </h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#697386] dark:text-[#94A3B8]">
        Search for any city in the bar above to load real-time conditions, local atmospheric details, and a 5-day forecast. Save up to five cities for instant switching and offline access.
      </p>

      <div className="mt-6">
        <p className="text-xs font-medium text-[#697386] dark:text-[#94A3B8]">
          Quick start — fetch live weather for:
        </p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {QUICK_START_CITIES.map((city) => (
            <button
              key={city.id}
              type="button"
              onClick={() => onSelectQuickCity(city)}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-[#E6EAF1] bg-[#F5F7FB] px-3.5 py-2 text-xs font-semibold text-[#172033] transition-colors hover:border-[#4778E8]/40 hover:bg-[#4778E8]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4778E8] dark:border-[#1F2B3E] dark:bg-[#0B1120] dark:text-[#F1F5F9] dark:hover:border-[#5C8DF6]/40 dark:hover:bg-[#5C8DF6]/15"
            >
              <MapPin className="h-3.5 w-3.5 text-[#4778E8] dark:text-[#5C8DF6]" aria-hidden="true" />
              <span>
                {city.name}, {city.country}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
