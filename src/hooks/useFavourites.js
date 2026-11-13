import { useCallback, useState } from 'react';
import {
  addFavouriteCity,
  isSameCity,
  loadFavourites,
  MAX_FAVOURITES,
  removeFavouriteCity,
} from '../features/favourites/favouritesStorage.js';

export function useFavourites() {
  const [initialState] = useState(() => loadFavourites());
  const [favourites, setFavourites] = useState(initialState.items);
  const [storageWarning, setStorageWarning] = useState(initialState.storageWarning);
  const [feedback, setFeedback] = useState(null);
  const [pendingRemovalCity, setPendingRemovalCity] = useState(null);

  const isFavourite = useCallback(
    (city) => {
      if (!city) return false;
      return favourites.some((item) => isSameCity(item, city));
    },
    [favourites]
  );

  const addFavourite = useCallback(
    (city) => {
      const result = addFavouriteCity(favourites, city);
      if (!result.ok) {
        setFeedback({
          type: 'warning',
          message: result.message,
        });
        return false;
      }

      setFavourites(result.items);
      if (result.storageWarning) {
        setStorageWarning(result.storageWarning);
      }
      setFeedback({
        type: 'success',
        message: `${city.name} added to saved favourites (${result.items.length}/${MAX_FAVOURITES}).`,
      });
      return true;
    },
    [favourites]
  );

  const requestRemoveFavourite = useCallback((city) => {
    setPendingRemovalCity(city);
  }, []);

  const confirmRemoveFavourite = useCallback(() => {
    if (!pendingRemovalCity) return;
    const removedName = pendingRemovalCity.name;
    const result = removeFavouriteCity(favourites, pendingRemovalCity);
    setFavourites(result.items);
    if (result.storageWarning) {
      setStorageWarning(result.storageWarning);
    }
    setPendingRemovalCity(null);
    setFeedback({
      type: 'info',
      message: `${removedName} removed from favourites.`,
    });
  }, [favourites, pendingRemovalCity]);

  const cancelRemoveFavourite = useCallback(() => {
    setPendingRemovalCity(null);
  }, []);

  const clearFeedback = useCallback(() => {
    setFeedback(null);
  }, []);

  return {
    favourites,
    maxFavourites: MAX_FAVOURITES,
    storageWarning,
    feedback,
    pendingRemovalCity,
    isFavourite,
    addFavourite,
    requestRemoveFavourite,
    confirmRemoveFavourite,
    cancelRemoveFavourite,
    clearFeedback,
  };
}
