const CACHE_NAME = 'kas-santri-v1';

// Get base path from current location (handles subdirectory repos)
const basePath = location.pathname.substring(0, location.pathname.lastIndexOf('/') + 1);

const STATIC_ASSETS = [
  basePath,
  basePath + 'index.html',
  basePath + 'login.html',
  basePath + 'admin.html',
  basePath + 'css/style.css',
  basePath + 'js/app.js',
  basePath + 'js/admin.js',
  basePath + 'js/pwa.js',
  basePath + 'manifest.json',
];

// Install event - cache static assets only
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Some assets may fail, proceed anyway
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Never cache Supabase or Telegram API calls
  if (event.request.url.includes('supabase.co') ||
      event.request.url.includes('telegram.org')) {
    return;
  }

  // For HTML pages: network-first, fallback to cache
  if (event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // For static assets (CSS, JS, images): cache-first
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200) return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, clone);
        });
        return response;
      }).catch(() => {
        return;
      });
    })
  );
});

// Message event
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
