import { Compass, Droplets, Eye, Gauge, Sunrise, Sunset, Wind } from 'lucide-react';
import { formatSunTime } from '../utils/dateUtils.js';
import { formatWindDirection, formatWindSpeed } from '../utils/temperatureUtils.js';

export function WeatherDetails({ weather }) {
  if (!weather?.current) return null;

  const { current, utcOffsetSeconds } = weather;
  const windDir = formatWindDirection(current.windDirectionDeg);
  const windDisplay =
    current.windSpeedKmh !== null
      ? `${formatWindSpeed(current.windSpeedKmh)}${windDir ? ` ${windDir}` : ''}`
      : '—';

  const visibilityKm =
    typeof current.visibilityMeters === 'number'
      ? `${(current.visibilityMeters / 1000).toFixed(1)} km`
      : null;

  const metrics = [
    {
      label: 'Humidity',
      value: current.humidity !== null ? `${Math.round(current.humidity)}%` : '—',
      Icon: Droplets,
    },
    {
      label: 'Wind',
      value: windDisplay,
      Icon: Wind,
    },
    {
      label: 'Pressure',
      value: current.pressureHpa !== null ? `${Math.round(current.pressureHpa)} hPa` : '—',
      Icon: Gauge,
    },
    {
      label: 'Sunrise',
      value: formatSunTime(current.sunrise, utcOffsetSeconds),
      Icon: Sunrise,
    },
    {
      label: 'Sunset',
      value: formatSunTime(current.sunset, utcOffsetSeconds),
      Icon: Sunset,
    },
    visibilityKm
      ? {
          label: 'Visibility',
          value: visibilityKm,
          Icon: Eye,
        }
      : {
          label: 'Wind bearing',
          value:
            typeof current.windDirectionDeg === 'number'
              ? `${Math.round(current.windDirectionDeg)}° ${windDir}`.trim()
              : '—',
          Icon: Compass,
        },
  ];

  return (
    <section
      aria-labelledby="weather-details-heading"
      className="rounded-2xl border border-[#E6EAF1] bg-white p-5 sm:p-6 dark:border-[#1F2B3E] dark:bg-[#111827]"
    >
      <h2
        id="weather-details-heading"
        className="text-sm font-semibold text-[#172033] dark:text-[#F1F5F9]"
      >
        Atmospheric details
      </h2>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
        {metrics.map(({ label, value, Icon }) => (
          <div
            key={label}
            className="border-t border-[#E6EAF1] pt-3 dark:border-[#1F2B3E]"
          >
            <dt className="flex items-center gap-1.5 text-xs text-[#697386] dark:text-[#94A3B8]">
              <Icon className="h-3.5 w-3.5 shrink-0 text-[#4778E8] dark:text-[#5C8DF6]" aria-hidden="true" />
              <span>{label}</span>
            </dt>
            <dd className="mt-1 text-base font-semibold text-[#172033] tabular-nums dark:text-[#F1F5F9]">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
