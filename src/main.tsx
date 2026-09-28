
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { clearNativeWebCache, registerServiceWorker } from './utils/pwa.ts';

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}

const startApp = async () => {
  try {
    await clearNativeWebCache();
  } catch (error) {
    console.warn('Unable to clear native web cache:', error);
  }

  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  // Browser/PWA only. Capacitor ships the current bundle inside the APK.
  registerServiceWorker();
};

void startApp();
