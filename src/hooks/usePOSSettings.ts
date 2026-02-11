import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';

export interface POSSettings {
  animationsEnabled: boolean;
  darkModeEnabled: boolean;
  fontSize: 'small' | 'medium' | 'large';
  fontWeight: 'light' | 'normal' | 'bold';
  primaryColor: string; // HSL hue value
}

const STORAGE_KEY = 'pos-ui-settings';
const CHANGE_EVENT = 'pos-settings-change';

const defaultSettings: POSSettings = {
  animationsEnabled: true,
  darkModeEnabled: false,
  fontSize: 'medium',
  fontWeight: 'normal',
  primaryColor: '25', // default coffee hue
};

// Shared mutable snapshot so every hook instance reads the same object
let currentSettings: POSSettings = (() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
})();

// Listeners for useSyncExternalStore
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot() {
  return currentSettings;
}

function updateSettings(partial: Partial<POSSettings>) {
  currentSettings = { ...currentSettings, ...partial };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(currentSettings));
  // Notify all subscribers in this tab
  listeners.forEach((cb) => cb());
  // Notify other tabs
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function usePOSSettings() {
  const settings = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  // Listen for changes from other tabs or same-tab custom event
  useEffect(() => {
    const reload = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          currentSettings = { ...defaultSettings, ...JSON.parse(saved) };
          listeners.forEach((cb) => cb());
        }
      } catch { /* ignore */ }
    };
    window.addEventListener('storage', reload);
    window.addEventListener(CHANGE_EVENT, reload);
    return () => {
      window.removeEventListener('storage', reload);
      window.removeEventListener(CHANGE_EVENT, reload);
    };
  }, []);

  const setAnimationsEnabled = useCallback((enabled: boolean) => {
    updateSettings({ animationsEnabled: enabled });
  }, []);

  const setDarkModeEnabled = useCallback((enabled: boolean) => {
    updateSettings({ darkModeEnabled: enabled });
  }, []);

  const setFontSize = useCallback((size: 'small' | 'medium' | 'large') => {
    updateSettings({ fontSize: size });
  }, []);

  const setFontWeight = useCallback((weight: 'light' | 'normal' | 'bold') => {
    updateSettings({ fontWeight: weight });
  }, []);

  const setPrimaryColor = useCallback((color: string) => {
    updateSettings({ primaryColor: color });
  }, []);

  return {
    ...settings,
    setAnimationsEnabled,
    setDarkModeEnabled,
    setFontSize,
    setFontWeight,
    setPrimaryColor,
  };
}
