import { useCallback, useEffect, useState } from 'react';
import { isStorageAvailable } from '../utils/storage.js';

const THEME_STORAGE_KEY = 'weatherboard_theme';

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light';

  if (isStorageAvailable()) {
    try {
      const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
    } catch {
      // Ignore storage read failure
    }
  }

  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      if (isStorageAvailable()) {
        try {
          window.localStorage.setItem(THEME_STORAGE_KEY, next);
        } catch {
          // Ignore storage write failure
        }
      }
      return next;
    });
  }, []);

  return { theme, toggleTheme };
}
