const CACHE_NAME = "mypuzzles-v3";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./favicon.ico",
  "./manifest.webmanifest",

  "./puzzle1/index.html",
  "./puzzle1/script.js",
  "./puzzle1/style.css",

  "./puzzle2/index.html",
  "./puzzle2/script.js",
  "./puzzle2/style.css",

  "./puzzle3/index.html",
  "./puzzle3/script.js",
  "./puzzle3/style.css",

  "./puzzle4/index.html",
  "./puzzle4/script.js",
  "./puzzle4/style.css",

  "./puzzle5/index.html",
  "./puzzle5/script.js",
  "./puzzle5/style.css",

  "./puzzle6/index.html",
  "./puzzle6/script.js",
  "./puzzle6/style.css"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request);
    })
  );
});
