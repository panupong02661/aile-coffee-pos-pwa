
import { Device, DeviceInfo } from '@capacitor/device';
import { Network, NetworkStatus, ConnectionType } from '@capacitor/network';
import { Preferences } from '@capacitor/preferences';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useState, useEffect } from 'react';

export const useDevice = () => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    initializeDevice();
    setupListeners();
  }, []);

  const initializeDevice = async () => {
    try {
      const info = await Device.getInfo();
      setDeviceInfo(info);

      const status = await Network.getStatus();
      setNetworkStatus(status);

      // Setup status bar for mobile
      if (info.platform === 'ios' || info.platform === 'android') {
        await StatusBar.setStyle({ style: Style.Light });
        await StatusBar.setBackgroundColor({ color: '#8B4513' });
      }
    } catch (error) {
      console.error('Error initializing device:', error);
    }
  };

  const setupListeners = () => {
    // Network status listener
    Network.addListener('networkStatusChange', (status) => {
      setNetworkStatus(status);
    });

    // Keyboard listeners
    Keyboard.addListener('keyboardWillShow', () => {
      setKeyboardVisible(true);
    });

    Keyboard.addListener('keyboardWillHide', () => {
      setKeyboardVisible(false);
    });
  };

  const vibrate = async (style: ImpactStyle = ImpactStyle.Medium) => {
    try {
      await Haptics.impact({ style });
    } catch (error) {
      console.error('Haptics not available:', error);
    }
  };

  const setPreference = async (key: string, value: string) => {
    try {
      await Preferences.set({ key, value });
    } catch (error) {
      console.error('Error setting preference:', error);
    }
  };

  const getPreference = async (key: string) => {
    try {
      const { value } = await Preferences.get({ key });
      return value;
    } catch (error) {
      console.error('Error getting preference:', error);
      return null;
    }
  };

  const hideKeyboard = async () => {
    try {
      await Keyboard.hide();
    } catch (error) {
      console.error('Error hiding keyboard:', error);
    }
  };

  return {
    deviceInfo,
    networkStatus,
    keyboardVisible,
    vibrate,
    setPreference,
    getPreference,
    hideKeyboard,
    isOnline: networkStatus?.connected || false,
    connectionType: networkStatus?.connectionType || ConnectionType.Unknown,
    isMobile: deviceInfo?.platform === 'ios' || deviceInfo?.platform === 'android',
  };
};
