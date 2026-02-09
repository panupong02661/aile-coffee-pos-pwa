import { useState, useEffect, useCallback } from 'react';

export interface POSSettings {
  animationsEnabled: boolean;
  darkModeEnabled: boolean;
  fontSize: 'small' | 'medium' | 'large';
  fontWeight: 'light' | 'normal' | 'bold';
  primaryColor: string; // HSL hue value
}

const STORAGE_KEY = 'pos-ui-settings';

const defaultSettings: POSSettings = {
  animationsEnabled: true,
  darkModeEnabled: false,
  fontSize: 'medium',
  fontWeight: 'normal',
  primaryColor: '25', // default coffee hue
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

  const setFontSize = useCallback((size: 'small' | 'medium' | 'large') => {
    setSettings(prev => ({ ...prev, fontSize: size }));
  }, []);

  const setFontWeight = useCallback((weight: 'light' | 'normal' | 'bold') => {
    setSettings(prev => ({ ...prev, fontWeight: weight }));
  }, []);

  const setPrimaryColor = useCallback((color: string) => {
    setSettings(prev => ({ ...prev, primaryColor: color }));
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
