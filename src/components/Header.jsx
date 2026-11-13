import { useState } from 'react';
import { CloudSun, Download, Moon, Sun, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall.js';
import { CitySearch } from './CitySearch.jsx';

export function Header({
  isOnline,
  onSelectCity,
  unit,
  onSelectUnit,
  theme,
  onToggleTheme,
}) {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  return (
    <header className="border-b border-[#E6EAF1] bg-white dark:border-[#1F2B3E] dark:bg-[#111827]">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3.5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        {/* Top row on mobile: Brand + Utility Controls */}
        <div className="flex items-center justify-between gap-2">
          <a
            href="/"
            className="flex min-w-0 shrink-0 items-center gap-2 text-[#172033] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4778E8] dark:text-[#F1F5F9]"
          >
            <span className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-[#4778E8] text-white dark:bg-[#5C8DF6]">
              <CloudSun className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
            </span>
            <span className="text-base font-bold tracking-tight whitespace-nowrap sm:text-lg">
              WeatherBoard
            </span>
          </a>

          {/* Mobile-only compact controls */}
          <div className="flex shrink-0 items-center gap-1.5 lg:hidden">
            <UnitToggle unit={unit} onSelectUnit={onSelectUnit} />
            <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
            {!isInstalled && (isInstallable || isIOS) && (
              <InstallControl
                isInstallable={isInstallable}
                isIOS={isIOS}
                onInstall={install}
                onOpenIOS={() => setShowIOSGuide(true)}
              />
            )}
          </div>
        </div>

        {/* Search Combobox */}
        <div className="w-full min-w-0 lg:max-w-md lg:flex-1">
          <CitySearch isOnline={isOnline} onSelectCity={onSelectCity} />
        </div>

        {/* Desktop controls */}
        <div className="hidden shrink-0 items-center gap-2.5 lg:flex">
          <UnitToggle unit={unit} onSelectUnit={onSelectUnit} />
          <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
          {!isInstalled && (isInstallable || isIOS) && (
            <InstallControl
              isInstallable={isInstallable}
              isIOS={isIOS}
              onInstall={install}
              onOpenIOS={() => setShowIOSGuide(true)}
            />
          )}
        </div>
      </div>

      {showIOSGuide && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="ios-install-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
        >
          <div className="w-full max-w-sm rounded-2xl border border-[#E6EAF1] bg-white p-6 shadow-xl dark:border-[#1F2B3E] dark:bg-[#111827]">
            <div className="flex items-start justify-between gap-3">
              <h2 id="ios-install-title" className="text-base font-semibold text-[#172033] dark:text-[#F1F5F9]">
                Install WeatherBoard on iOS
              </h2>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                aria-label="Close installation instructions"
                className="flex min-h-[44px] min-w-[44px] -mr-2 -mt-2 items-center justify-center rounded-lg text-[#697386] hover:bg-[#F5F7FB] hover:text-[#172033] dark:text-[#94A3B8] dark:hover:bg-[#1F2B3E] dark:hover:text-[#F1F5F9]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[#697386] dark:text-[#94A3B8]">
              1. Tap the <strong>Share</strong> icon in Safari&rsquo;s toolbar.
              <br />
              2. Scroll down and select <strong>Add to Home Screen</strong>.
            </p>
            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 min-h-[44px] w-full rounded-xl bg-[#4778E8] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#3866D1] dark:bg-[#5C8DF6] dark:hover:bg-[#4778E8]"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

function UnitToggle({ unit, onSelectUnit }) {
  return (
    <div
      role="group"
      aria-label="Temperature unit"
      className="inline-flex min-h-[44px] items-center rounded-xl border border-[#E6EAF1] bg-[#F5F7FB] p-1 dark:border-[#1F2B3E] dark:bg-[#0B1120]"
    >
      <button
        type="button"
        onClick={() => onSelectUnit('C')}
        aria-pressed={unit === 'C'}
        className={`min-h-[36px] min-w-[38px] rounded-lg px-2.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4778E8] whitespace-nowrap ${
          unit === 'C'
            ? 'bg-white text-[#172033] shadow-xs dark:bg-[#1F2B3E] dark:text-[#F1F5F9]'
            : 'text-[#697386] hover:text-[#172033] dark:text-[#94A3B8] dark:hover:text-[#F1F5F9]'
        }`}
      >
        °C
      </button>
      <button
        type="button"
        onClick={() => onSelectUnit('F')}
        aria-pressed={unit === 'F'}
        className={`min-h-[36px] min-w-[38px] rounded-lg px-2.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4778E8] whitespace-nowrap ${
          unit === 'F'
            ? 'bg-white text-[#172033] shadow-xs dark:bg-[#1F2B3E] dark:text-[#F1F5F9]'
            : 'text-[#697386] hover:text-[#172033] dark:text-[#94A3B8] dark:hover:text-[#F1F5F9]'
        }`}
      >
        °F
      </button>
    </div>
  );
}

function ThemeToggle({ theme, onToggleTheme }) {
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={onToggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-[#E6EAF1] bg-white text-[#172033] transition-colors hover:bg-[#F5F7FB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4778E8] dark:border-[#1F2B3E] dark:bg-[#0B1120] dark:text-[#F1F5F9] dark:hover:bg-[#1F2B3E]"
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-amber-400" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4 text-[#697386]" aria-hidden="true" />
      )}
    </button>
  );
}

function InstallControl({ isInstallable, isIOS, onInstall, onOpenIOS }) {
  const handleClick = () => {
    if (isInstallable) {
      onInstall();
    } else if (isIOS) {
      onOpenIOS();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Install WeatherBoard"
      title="Install WeatherBoard"
      className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-xl bg-[#4778E8] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#3866D1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4778E8] focus-visible:ring-offset-2 whitespace-nowrap shrink-0 sm:px-3.5 dark:bg-[#5C8DF6] dark:hover:bg-[#4778E8]"
    >
      <Download className="h-4 w-4 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
      <span className="hidden sm:inline">Install</span>
    </button>
  );
}
