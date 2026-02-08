import { useState, useEffect, useCallback } from 'react';

interface POSSettings {
  animationsEnabled: boolean;
  darkModeEnabled: boolean;
}

const STORAGE_KEY = 'pos-ui-settings';

const defaultSettings: POSSettings = {
  animationsEnabled: true,
  darkModeEnabled: false,
};

export function usePOSSettings() {
  const [settings, setSettings] = useState<POSSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const setAnimationsEnabled = useCallback((enabled: boolean) => {
    setSettings(prev => ({ ...prev, animationsEnabled: enabled }));
  }, []);

  const setDarkModeEnabled = useCallback((enabled: boolean) => {
    setSettings(prev => ({ ...prev, darkModeEnabled: enabled }));
  }, []);

  return {
    animationsEnabled: settings.animationsEnabled,
    darkModeEnabled: settings.darkModeEnabled,
    setAnimationsEnabled,
    setDarkModeEnabled,
  };
}
