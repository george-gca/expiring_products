/**
 * Service Worker for Expiring Products PWA
 * Provides offline functionality and asset caching
 */

const CACHE_NAME = "expiring-products-v2";
const CACHE_STATIC_NAME = `${CACHE_NAME}-static`;
const CACHE_DYNAMIC_NAME = `${CACHE_NAME}-dynamic`;

// Static assets to cache immediately
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/en-us/index.html",
  "/assets/js/backup-and-restore-data.mjs",
  "/assets/img/favicon.png",
  "/assets/img/favicon_colored.png",
  "/assets/css/main.css",
];

// Maximum number of dynamic cache entries
const MAX_DYNAMIC_CACHE_SIZE = 50;

/**
 * Clean old cache entries to prevent storage bloat
 * @param {string} cacheName - Name of cache to clean
 * @param {number} maxSize - Maximum number of entries to keep
 */
async function cleanCache(cacheName, maxSize) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();

    if (keys.length > maxSize) {
      const keysToDelete = keys.slice(0, keys.length - maxSize);
      await Promise.all(keysToDelete.map((key) => cache.delete(key)));
    }
  } catch (error) {
    console.error(`Error cleaning cache ${cacheName}:`, error);
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_STATIC_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        return self.skipWaiting(); // Activate immediately
      })
      .catch((error) => {
        console.error("Service worker install failed:", error);
      })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter(
              (cacheName) =>
                cacheName !== CACHE_STATIC_NAME &&
                cacheName !== CACHE_DYNAMIC_NAME
            )
            .map((cacheName) => caches.delete(cacheName))
        );
      }),
      // Take control immediately
      self.clients.claim(),
    ]).catch((error) => {
      console.error("Service worker activation failed:", error);
    })
  );
});

self.addEventListener("fetch", (event) => {
  // Skip non-GET requests and Chrome extension requests
  if (
    event.request.method !== "GET" ||
    event.request.url.startsWith("chrome-extension://")
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response; // Return cached version
      }

      // For network requests, try to fetch and cache dynamic content
      return fetch(event.request)
        .then((fetchResponse) => {
          // Only cache successful responses
          if (
            !fetchResponse ||
            fetchResponse.status !== 200 ||
            fetchResponse.type !== "basic"
          ) {
            return fetchResponse;
          }

          // Clone the response as it can only be consumed once
          const responseToCache = fetchResponse.clone();

          caches
            .open(CACHE_DYNAMIC_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
              // Clean cache periodically
              cleanCache(CACHE_DYNAMIC_NAME, MAX_DYNAMIC_CACHE_SIZE);
            })
            .catch((error) => {
              console.error("Error caching dynamic content:", error);
            });

          return fetchResponse;
        })
        .catch((error) => {
          console.error("Fetch failed for:", event.request.url, error);
          // Could return a fallback page here for navigation requests
          throw error;
        });
    })
  );
});
