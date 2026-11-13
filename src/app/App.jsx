import { ConfirmDialog } from '../components/ConfirmDialog.jsx';
import { CurrentWeather } from '../components/CurrentWeather.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { ErrorState } from '../components/ErrorState.jsx';
import { FavouriteCities } from '../components/FavouriteCities.jsx';
import { Forecast } from '../components/Forecast.jsx';
import { Header } from '../components/Header.jsx';
import { LoadingState } from '../components/LoadingState.jsx';
import { OfflineBanner } from '../components/OfflineBanner.jsx';
import { ReminderSettings } from '../components/ReminderSettings.jsx';
import { WeatherDetails } from '../components/WeatherDetails.jsx';
import { useFavourites } from '../hooks/useFavourites.js';
import { useOnlineStatus } from '../hooks/useOnlineStatus.js';
import { useTemperatureUnit } from '../hooks/useTemperatureUnit.js';
import { useTheme } from '../hooks/useTheme.js';
import { useWeather } from '../hooks/useWeather.js';

export function App() {
  const { isOnline, reconnectedSinceOffline, acknowledgeReconnection } = useOnlineStatus();
  const { theme, toggleTheme } = useTheme();
  const { unit, selectUnit } = useTemperatureUnit();

  const {
    weather,
    selectedCity,
    isLoading,
    error,
    isShowingCachedData,
    previewMap,
    loadWeatherForCity,
    refreshWeather,
  } = useWeather({ isOnline });

  const {
    favourites,
    maxFavourites,
    storageWarning,
    feedback,
    pendingRemovalCity,
    isFavourite,
    addFavourite,
    requestRemoveFavourite,
    confirmRemoveFavourite,
    cancelRemoveFavourite,
    clearFeedback,
  } = useFavourites();

  const activeCity = weather?.city || selectedCity;
  const activeIsFavourite = isFavourite(activeCity);

  const handleToggleFavourite = () => {
    if (!activeCity) return;
    if (activeIsFavourite) {
      requestRemoveFavourite(activeCity);
    } else {
      addFavourite(activeCity);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F7FB] text-[#172033] transition-colors dark:bg-[#0B1120] dark:text-[#F1F5F9]">
      <Header
        isOnline={isOnline}
        onSelectCity={(city) => loadWeatherForCity(city)}
        unit={unit}
        onSelectUnit={selectUnit}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:py-8">
        <OfflineBanner
          isOnline={isOnline}
          isShowingCachedData={isShowingCachedData}
          reconnectedSinceOffline={reconnectedSinceOffline}
          lastUpdated={weather?.fetchedAt}
          cityName={weather?.city?.name}
          onRefresh={refreshWeather}
          onDismissReconnected={acknowledgeReconnection}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
          {/* Primary weather workspace */}
          <div className="min-w-0 space-y-5 lg:col-span-8">
            {isLoading && !weather ? (
              <LoadingState cityName={selectedCity?.name} />
            ) : !weather && !error ? (
              <EmptyState
                isOnline={isOnline}
                onSelectQuickCity={(city) => loadWeatherForCity(city)}
              />
            ) : (
              <>
                {error && (
                  <ErrorState
                    error={error}
                    isOnline={isOnline}
                    onRetry={refreshWeather}
                  />
                )}

                {weather && (
                  <div className={`space-y-5 transition-opacity ${isLoading ? 'opacity-65' : 'opacity-100'}`}>
                    <CurrentWeather
                      weather={weather}
                      unit={unit}
                      isFavourite={activeIsFavourite}
                      isRefreshing={isLoading}
                      isOnline={isOnline}
                      isShowingCachedData={isShowingCachedData}
                      onToggleFavourite={handleToggleFavourite}
                      onRefresh={refreshWeather}
                    />
                    <WeatherDetails weather={weather} />
                    <Forecast weather={weather} unit={unit} />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Secondary rail: Saved cities + Morning reminders */}
          <aside className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2 lg:col-span-4 lg:grid-cols-1">
            <FavouriteCities
              favourites={favourites}
              maxFavourites={maxFavourites}
              activeCity={activeCity}
              previewMap={previewMap}
              unit={unit}
              storageWarning={storageWarning}
              feedback={feedback}
              onSelectCity={(city) => loadWeatherForCity(city)}
              onRequestRemove={requestRemoveFavourite}
              onClearFeedback={clearFeedback}
            />

            <ReminderSettings weather={weather} unit={unit} />
          </aside>
        </div>
      </main>

      <footer className="border-t border-[#E6EAF1] bg-white/60 py-4 text-center text-xs text-[#697386] dark:border-[#1F2B3E] dark:bg-[#111827]/60 dark:text-[#94A3B8]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          WeatherBoard · Client-side PWA
        </div>
      </footer>

      <ConfirmDialog
        isOpen={Boolean(pendingRemovalCity)}
        title="Remove saved city?"
        message={
          pendingRemovalCity
            ? `Remove ${pendingRemovalCity.name}${
                pendingRemovalCity.country ? `, ${pendingRemovalCity.country}` : ''
              } from your saved favourites?`
            : ''
        }
        confirmLabel="Remove city"
        cancelLabel="Keep city"
        onConfirm={confirmRemoveFavourite}
        onCancel={cancelRemoveFavourite}
      />
    </div>
  );
}

export default App;
