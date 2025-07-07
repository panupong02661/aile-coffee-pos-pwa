
const CACHE_NAME = 'aile-coffee-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

// Background sync for offline orders
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncOfflineData());
  }
});

async function syncOfflineData() {
  try {
    // Get offline data from IndexedDB
    const offlineData = await getOfflineData();
    
    // Sync with server
    for (const item of offlineData) {
      await syncItemToServer(item);
    }
    
    // Clear synced data
    await clearSyncedData();
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

async function getOfflineData() {
  // Implementation to get data from IndexedDB
  return [];
}

async function syncItemToServer(item) {
  // Implementation to sync individual item
}

async function clearSyncedData() {
  // Implementation to clear synced data
}
