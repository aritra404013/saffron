const CACHE_NAME = 'foodify-cache-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/logo.png',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Only handle GET requests from our own origin (local assets)
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Bypass service worker caching for local development to prevent hot-reload and caching issues
  if (self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1') {
    return;
  }

  const url = new URL(event.request.url);

  // Skip service worker interception for development files, hot reloading, or API calls
  if (url.pathname.includes('/@vite') || url.pathname.includes('/node_modules') || url.pathname.startsWith('/api')) {
    return;
  }

  // Network-First strategy for navigate (HTML) requests
  const isHtml = event.request.mode === 'navigate' || 
                 url.pathname.endsWith('.html') || 
                 url.pathname === '/';

  if (isHtml) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
  } else {
    // Stale-While-Revalidate for other local static assets (JS, CSS, images)
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          const fetchPromise = fetch(event.request)
            .then(networkResponse => {
              if (networkResponse.status === 200) {
                const responseClone = networkResponse.clone();
                caches.open(CACHE_NAME).then(cache => {
                  cache.put(event.request, responseClone);
                });
              }
              return networkResponse;
            })
            .catch(() => {
              // Ignore network errors in background fetch
            });
          return cachedResponse || fetchPromise;
        })
    );
  }
});
