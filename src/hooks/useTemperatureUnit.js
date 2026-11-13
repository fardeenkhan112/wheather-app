import { useCallback, useState } from 'react';
import { isStorageAvailable } from '../utils/storage.js';

const UNIT_STORAGE_KEY = 'weatherboard_unit';

function getInitialUnit() {
  if (typeof window === 'undefined' || !isStorageAvailable()) return 'C';
  try {
    const saved = window.localStorage.getItem(UNIT_STORAGE_KEY);
    return saved === 'F' ? 'F' : 'C';
  } catch {
    return 'C';
  }
}

export function useTemperatureUnit() {
  const [unit, setUnit] = useState(getInitialUnit);

  const selectUnit = useCallback((nextUnit) => {
    const normalized = nextUnit === 'F' ? 'F' : 'C';
    setUnit(normalized);
    if (isStorageAvailable()) {
      try {
        window.localStorage.setItem(UNIT_STORAGE_KEY, normalized);
      } catch {
        // Ignore storage write failure
      }
    }
  }, []);

  return { unit, selectUnit };
}
