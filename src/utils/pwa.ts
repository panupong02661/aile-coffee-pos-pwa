
// PWA Installation and Service Worker Registration
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
};

// PWA Install Prompt
let deferredPrompt: any;

export const handlePWAInstallPrompt = () => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallButton();
  });
};

const showInstallButton = () => {
  const installButton = document.getElementById('pwa-install-button');
  if (installButton) {
    installButton.style.display = 'block';
    installButton.addEventListener('click', installPWA);
  }
};

const installPWA = async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    console.log('User choice:', choiceResult);
    deferredPrompt = null;
    
    const installButton = document.getElementById('pwa-install-button');
    if (installButton) {
      installButton.style.display = 'none';
    }
  }
};

// Offline Detection
export const handleOfflineStatus = () => {
  window.addEventListener('online', () => {
    console.log('Back online');
    document.body.classList.remove('offline');
    // Sync offline data
    syncOfflineData();
  });

  window.addEventListener('offline', () => {
    console.log('Gone offline');
    document.body.classList.add('offline');
  });
};

const syncOfflineData = async () => {
  // Implementation for syncing offline data
  console.log('Syncing offline data...');
};

// Push Notifications
export const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};

export const showNotification = (title: string, options?: NotificationOptions) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, options);
  }
};
