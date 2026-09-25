const CACHE_NAME = 'aile-coffee-v3.1-offline';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting()) // Force activation of new SW
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control immediately
  );
});

// Fetch event - Network first strategy for better data freshness
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // For API requests, always go to network first
  if (event.request.url.includes('/api/') || event.request.url.includes('supabase.co')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // If network fails, try cache
        return caches.match(event.request).then((cached) => cached || new Response(
          JSON.stringify({ message: 'offline' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        ));
      })
    );
    return;
  }

  // For static assets, use network first with cache fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // If network fails, try cache
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          if (event.request.mode === 'navigate') return caches.match('/');
          return new Response('Offline', { status: 503 });
        });
      })
  );
});

// Enhanced iOS Background Notification Support
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PLAY_IOS_NOTIFICATION') {
    console.log('🔔 Service Worker: iOS background notification triggered');
    
    // Trigger iOS-specific background notification
    handleIOSBackgroundNotification(event.data.payload);
  }
});

// iOS Background Notification Handler
async function handleIOSBackgroundNotification(payload) {
  try {
    console.log('🔔 SW: Handling iOS background notification:', payload);
    
    // Method 1: Show system notification if permission granted
    if ('Notification' in self && Notification.permission === 'granted') {
      const notification = new Notification('🔔 ออเดอร์ใหม่!', {
        body: `ออเดอร์ #${payload.orderNumber} - ฿${payload.totalAmount}`,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'new-order',
        requireInteraction: true,
        silent: false,
        vibrate: [200, 100, 200, 100, 200],
        data: payload
      });
      
      notification.onclick = () => {
        // Focus window and navigate to orders page
        clients.openWindow('/online-orders');
        notification.close();
      };
      
      // Auto-close after 10 seconds
      setTimeout(() => {
        notification.close();
      }, 10000);
    }
    
    // Method 2: Message all open clients for iOS sound
    const clientsList = await clients.matchAll();
    clientsList.forEach(client => {
      client.postMessage({
        type: 'IOS_BACKGROUND_NOTIFICATION',
        payload: payload
      });
    });
    
    // Method 3: iOS-specific background tasks
    if ('serviceWorker' in navigator && 'backgroundSync' in window) {
      // Register background sync for iOS
      await self.registration.sync.register('ios-notification-' + Date.now());
    }
    
  } catch (error) {
    console.error('SW: iOS background notification error:', error);
  }
}

// Enhanced background sync for iOS notifications
self.addEventListener('sync', (event) => {
  if (event.tag.startsWith('ios-notification-')) {
    console.log('🔔 SW: iOS notification sync triggered');
    event.waitUntil(triggerIOSNotificationSync());
  }
  
});

async function triggerIOSNotificationSync() {
  try {
    // Try to wake up any sleeping clients
    const clientsList = await clients.matchAll({ includeUncontrolled: true });
    
    for (const client of clientsList) {
      if (client.visibilityState === 'hidden' || client.visibilityState === 'visible') {
        client.postMessage({
          type: 'WAKE_UP_IOS_NOTIFICATION',
          timestamp: Date.now()
        });
      }
    }
    
    console.log('🔔 SW: iOS notification sync completed for', clientsList.length, 'clients');
  } catch (error) {
    console.error('SW: iOS notification sync error:', error);
  }
}

// iOS-specific notification permission handler
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 SW: Notification clicked');
  
  event.notification.close();
  
  // Focus or open the app
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('/online-orders') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/online-orders');
      }
    })
  );
});
