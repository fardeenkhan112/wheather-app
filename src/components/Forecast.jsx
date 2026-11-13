import { Droplets } from 'lucide-react';
import { formatForecastDay, getCityLocalDateKey } from '../utils/dateUtils.js';
import { formatTemperature } from '../utils/temperatureUtils.js';
import { WeatherIcon } from './WeatherIcon.jsx';

export function Forecast({ weather, unit }) {
  const forecast = Array.isArray(weather?.forecast) ? weather.forecast : [];
  if (forecast.length === 0) return null;

  const todayDateKey =
    typeof weather?.observedAtUnix === 'number'
      ? getCityLocalDateKey(weather.observedAtUnix, weather.utcOffsetSeconds || 0)
      : forecast[0]?.dateKey;

  return (
    <section
      aria-labelledby="forecast-heading"
      className="rounded-2xl border border-[#E6EAF1] bg-white p-5 sm:p-6 dark:border-[#1F2B3E] dark:bg-[#111827]"
    >
      <div className="flex items-baseline justify-between gap-2">
        <h2
          id="forecast-heading"
          className="text-sm font-semibold text-[#172033] dark:text-[#F1F5F9]"
        >
          5-day forecast
        </h2>
        <span className="text-xs text-[#697386] dark:text-[#94A3B8]">
          City local dates
        </span>
      </div>

      {/* Responsive 5-day cards: clean rows on 375px mobile, 5 columns on md/lg */}
      <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-5">
        {forecast.map((day) => {
          const { dayLabel, dateLabel } = formatForecastDay(day.dateKey, todayDateKey);
          return (
            <article
              key={day.dateKey}
              className="flex items-center justify-between gap-3 rounded-xl border border-[#E6EAF1] bg-[#F5F7FB]/70 px-3.5 py-3 md:flex-col md:items-start md:justify-between md:gap-3 dark:border-[#1F2B3E] dark:bg-[#0B1120]/70"
            >
              <div className="min-w-[82px] md:min-w-0">
                <p className="text-sm font-semibold text-[#172033] dark:text-[#F1F5F9]">
                  {dayLabel}
                </p>
                <p className="text-xs text-[#697386] tabular-nums dark:text-[#94A3B8]">
                  {dateLabel}
                </p>
              </div>

              <div className="flex items-center gap-2 md:w-full md:justify-between">
                <WeatherIcon
                  conditionCode={day.conditionCode}
                  isDay={true}
                  className="h-6 w-6 shrink-0"
                />
                {typeof day.precipitationProbability === 'number' &&
                  day.precipitationProbability > 0 && (
                    <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-[#4778E8] tabular-nums dark:text-[#5C8DF6]">
                      <Droplets className="h-3 w-3" aria-hidden="true" />
                      {day.precipitationProbability}%
                    </span>
                  )}
              </div>

              <div className="text-right md:w-full md:text-left">
                <p className="text-xs text-[#697386] truncate dark:text-[#94A3B8]" title={day.conditionLabel}>
                  {day.conditionLabel}
                </p>
                <p className="mt-0.5 text-sm font-semibold text-[#172033] tabular-nums dark:text-[#F1F5F9]">
                  <span>{formatTemperature(day.tempMaxC, unit, { includeUnit: false })}</span>
                  <span className="mx-1 text-[#697386] dark:text-[#94A3B8]">/</span>
                  <span className="font-normal text-[#697386] dark:text-[#94A3B8]">
                    {formatTemperature(day.tempMinC, unit, { includeUnit: false })}
                  </span>
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
