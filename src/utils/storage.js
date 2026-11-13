/**
 * Safe localStorage wrapper with graceful degradation when browser storage
 * is blocked (e.g., private browsing or strict privacy settings) or corrupted.
 */

export function isStorageAvailable() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    const probeKey = '__weatherboard_storage_probe__';
    window.localStorage.setItem(probeKey, '1');
    window.localStorage.removeItem(probeKey);
    return true;
  } catch {
    return false;
  }
}

export function readJson(key, fallbackValue) {
  if (!isStorageAvailable()) {
    return {
      ok: false,
      data: fallbackValue,
      storageUnavailable: true,
      corrupted: false,
    };
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) {
      return {
        ok: true,
        data: fallbackValue,
        storageUnavailable: false,
        corrupted: false,
      };
    }
    const parsed = JSON.parse(raw);
    return {
      ok: true,
      data: parsed,
      storageUnavailable: false,
      corrupted: false,
    };
  } catch {
    return {
      ok: false,
      data: fallbackValue,
      storageUnavailable: false,
      corrupted: true,
    };
  }
}

export function writeJson(key, value) {
  if (!isStorageAvailable()) {
    return {
      ok: false,
      storageUnavailable: true,
      error: 'Browser storage is blocked or unavailable.',
    };
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return {
      ok: true,
      storageUnavailable: false,
    };
  } catch (err) {
    return {
      ok: false,
      storageUnavailable: false,
      error: err instanceof Error ? err.message : 'Unable to save to browser storage.',
    };
  }
}

export function removeStorageKey(key) {
  if (!isStorageAvailable()) {
    return false;
  }
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}
