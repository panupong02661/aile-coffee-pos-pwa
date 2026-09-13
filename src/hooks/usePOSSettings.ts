import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';

export type ThemePreset = 'default' | 'neon-dark' | 'cyber' | 'glass';
export type SidebarStyle =
  | 'classic'
  | 'rail'
  | 'two-pane'
  | 'search'
  | 'cards'
  | 'icon-tabs'
  | 'flat';

/** 0 = แบบเดิม, 1-10 = รูปแบบใหม่ */
export type CategoryBarStyle = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export const SIDEBAR_WIDTHS: Record<SidebarStyle, number> = {
  classic: 56,
  rail: 64,
  'two-pane': 284,
  search: 256,
  cards: 272,
  'icon-tabs': 296,
  flat: 240,
};

export interface POSSettings {
  animationsEnabled: boolean;
  darkModeEnabled: boolean;
  fontSize: 'small' | 'medium' | 'large';
  fontWeight: 'light' | 'normal' | 'bold';
  primaryColor: string; // HSL hue value
  textColor: string; // full HSL value e.g. '220 15% 93%' or 'default'
  themePreset: ThemePreset;
  glassOpacity: number; // 0.1 – 0.9
  sidebarStyle: SidebarStyle;
  categoryBarStyle: CategoryBarStyle;
}

const STORAGE_KEY = 'pos-ui-settings';
const CHANGE_EVENT = 'pos-settings-change';

const defaultSettings: POSSettings = {
  animationsEnabled: true,
  darkModeEnabled: false,
  fontSize: 'medium',
  fontWeight: 'normal',
  primaryColor: '25', // default coffee hue
  textColor: 'default',
  themePreset: 'default',
  glassOpacity: 0.7,
  sidebarStyle: 'classic',
  categoryBarStyle: 0,
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
  listeners.forEach((cb) => cb());
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function usePOSSettings() {
  const settings = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

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

  const setTextColor = useCallback((color: string) => {
    updateSettings({ textColor: color });
  }, []);

  const setThemePreset = useCallback((preset: ThemePreset) => {
    // When selecting a theme preset, auto-apply related settings
    const presetConfig: Record<ThemePreset, Partial<POSSettings>> = {
      'default': { darkModeEnabled: false, primaryColor: '25' },
      'neon-dark': { darkModeEnabled: true, primaryColor: '150', textColor: 'bright' },
      'cyber': { darkModeEnabled: true, primaryColor: '210', textColor: 'cool' },
      'glass': { darkModeEnabled: true, primaryColor: '210' },
    };
    updateSettings({ themePreset: preset, ...presetConfig[preset] });
  }, []);

  const setSidebarStyle = useCallback((style: SidebarStyle) => {
    updateSettings({ sidebarStyle: style });
  }, []);

  const setCategoryBarStyle = useCallback((style: CategoryBarStyle) => {
    updateSettings({ categoryBarStyle: style });
  }, []);

  const setGlassOpacity = useCallback((opacity: number) => {
    updateSettings({ glassOpacity: Math.max(0.1, Math.min(0.9, opacity)) });
  }, []);

  return {
    ...settings,
    setAnimationsEnabled,
    setDarkModeEnabled,
    setFontSize,
    setFontWeight,
    setPrimaryColor,
    setTextColor,
    setThemePreset,
    setGlassOpacity,
    setSidebarStyle,
    setCategoryBarStyle,
  };
}
