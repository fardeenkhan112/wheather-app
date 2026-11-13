import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  Moon,
  Sun,
} from 'lucide-react';

const ICON_CONFIG = {
  clear: {
    day: { Icon: Sun, colorClass: 'text-amber-500 dark:text-amber-400' },
    night: { Icon: Moon, colorClass: 'text-indigo-400 dark:text-indigo-300' },
  },
  'partly-cloudy': {
    day: { Icon: CloudSun, colorClass: 'text-amber-500 dark:text-amber-400' },
    night: { Icon: CloudMoon, colorClass: 'text-slate-500 dark:text-slate-300' },
  },
  cloudy: {
    day: { Icon: Cloud, colorClass: 'text-slate-500 dark:text-slate-300' },
    night: { Icon: Cloud, colorClass: 'text-slate-500 dark:text-slate-300' },
  },
  fog: {
    day: { Icon: CloudFog, colorClass: 'text-slate-500 dark:text-slate-400' },
    night: { Icon: CloudFog, colorClass: 'text-slate-500 dark:text-slate-400' },
  },
  drizzle: {
    day: { Icon: CloudDrizzle, colorClass: 'text-sky-500 dark:text-sky-400' },
    night: { Icon: CloudDrizzle, colorClass: 'text-sky-500 dark:text-sky-400' },
  },
  rain: {
    day: { Icon: CloudRain, colorClass: 'text-[#4778E8] dark:text-[#5C8DF6]' },
    night: { Icon: CloudRain, colorClass: 'text-[#4778E8] dark:text-[#5C8DF6]' },
  },
  'freezing-rain': {
    day: { Icon: CloudRain, colorClass: 'text-cyan-600 dark:text-cyan-400' },
    night: { Icon: CloudRain, colorClass: 'text-cyan-600 dark:text-cyan-400' },
  },
  snow: {
    day: { Icon: CloudSnow, colorClass: 'text-sky-400 dark:text-sky-300' },
    night: { Icon: CloudSnow, colorClass: 'text-sky-400 dark:text-sky-300' },
  },
  thunderstorm: {
    day: { Icon: CloudLightning, colorClass: 'text-indigo-600 dark:text-indigo-400' },
    night: { Icon: CloudLightning, colorClass: 'text-indigo-600 dark:text-indigo-400' },
  },
};

export function WeatherIcon({ conditionCode = 'partly-cloudy', isDay = true, className = 'w-6 h-6' }) {
  const entry = ICON_CONFIG[conditionCode] || ICON_CONFIG['partly-cloudy'];
  const variant = isDay ? entry.day : entry.night;
  const Icon = variant.Icon;

  return <Icon className={`${variant.colorClass} ${className}`} aria-hidden="true" strokeWidth={1.75} />;
}
