// service-worker.js
const CACHE_NAME = 'pribori-react-cache-v1'; // Updated cache name

// List of URLs to cache.
// Ensure these paths are correct relative to where service-worker.js is served from (usually the root).
const urlsToCache = [
  './', // Cache the root (often index.html)
  './index.html', // Explicitly cache index.html
  './manifest.json',
  // Add paths to your icons from the manifest
  './img/icon-72x72.png',
  './img/icon-128x128.png',
  './img/icon-144x144.png',
  './img/icon-192x192.png',
  './img/icon-384x384.png',
  './img/icon-512x512.png',
  './img/favicon-32x32.png', // If you have these
  './img/favicon-16x16.png',
  // Add CDN URLs if you want to cache them (can be tricky with opaque responses)
  // For example, Tailwind, React, ReactDOM, Babel, FontAwesome
  // Note: Caching external resources from CDNs requires careful handling of updates and opaque responses.
  // It might be simpler to rely on browser caching for these and ensure your app handles offline for core functionality.
  // 'https://cdn.tailwindcss.com', // Example, might not work as expected due to opaque response
  // 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  // The CSV file - if it's static and you want it cached for initial import on first offline launch
  './Прилади - Аркуш1.csv'
];

// Install Service Worker
self.addEventListener('install', event => {
  console.log(`Service Worker (${CACHE_NAME}): Installing...`);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log(`Service Worker (${CACHE_NAME}): Caching app shell`);
        return cache.addAll(urlsToCache.map(url => new Request(url, { cache: 'reload' }))) // Force reload from network for caching
          .catch(error => {
            console.error(`Service Worker (${CACHE_NAME}): Failed to cache some URLs during install:`, error);
            // Log which URLs failed
            urlsToCache.forEach(url => {
                cache.match(url).then(response => {
                    if (!response) console.error(`Failed to cache: ${url}`);
                });
            });
          });
      })
      .then(() => {
        console.log(`Service Worker (${CACHE_NAME}): All specified files attempted to cache.`);
        return self.skipWaiting(); // Activate new SW immediately
      })
      .catch(error => {
         console.error(`Service Worker (${CACHE_NAME}): Failed to cache files during install:`, error);
      })
  );
});

// Activate Service Worker
self.addEventListener('activate', event => {
  console.log(`Service Worker (${CACHE_NAME}): Activating...`);
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) { // Delete old caches
            console.log(`Service Worker (${CACHE_NAME}): Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log(`Service Worker (${CACHE_NAME}): Activated and old caches cleaned.`);
      return self.clients.claim(); // Take control of open pages
    })
  );
});

// Fetch event - Cache falling back to network strategy
self.addEventListener('fetch', event => {
  // We only want to cache GET requests.
  if (event.request.method !== 'GET') {
    return;
  }

  // For navigation requests, try network first, then cache (Network-first for HTML)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // If network fetch is successful, cache it (if it's a good response)
          if (response && response.status === 200 && response.type === 'basic') {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // If network fails, try to serve from cache
          return caches.match(event.request);
        })
    );
    return;
  }

  // For other requests (assets, etc.), use Cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // console.log(`SW (${CACHE_NAME}): Serving from cache: ${event.request.url}`);
          return cachedResponse;
        }

        // console.log(`SW (${CACHE_NAME}): Fetching from network: ${event.request.url}`);
        return fetch(event.request).then(
          networkResponse => {
            // Check if we received a valid response
            if (networkResponse && networkResponse.status === 200 /* && networkResponse.type === 'basic' - this might block CDN resources */) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  // console.log(`SW (${CACHE_NAME}): Caching new resource: ${event.request.url}`);
                  cache.put(event.request, responseToCache);
                });
            }
            return networkResponse;
          }
        ).catch(error => {
            console.warn(`SW (${CACHE_NAME}): Fetch failed for ${event.request.url}. Maybe offline?`, error);
            // Optionally, return a fallback page/image if appropriate
            // For example, if (event.request.destination === 'image') return caches.match('/offline-image.png');
            throw error;
        });
      })
  );
});
