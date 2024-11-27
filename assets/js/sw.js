const cacheName = "expiring-products-v1";

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(cacheName).then(function (cache) {
      return cache.addAll([
        "/",
        "/index.html",
        "/en-us/index.html",
        "/assets/js/idb-backup-and-restore.mjs",
        "/assets/img/favicon.png",
        "/assets/img/favicon_colored.png",
        // '/style.css'
      ]);
    }),
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key === cacheName) {
            return;
          }
          return caches.delete(key);
        }),
      );
    }),
  );
});

self.addEventListener("fetch", (e) => {
  console.log(e.request.url);
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request)),
  );
});
