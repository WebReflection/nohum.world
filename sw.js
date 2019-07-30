const version = 1;
const db = caches.open('nohum.world.' + version);

addEventListener('install', event => {
  event.waitUntil(
    db.then(
      cache => cache.addAll([
        '/',
        '/android-chrome-192x192.png',
        '/android-chrome-256x256.png',
        '/android-chrome-512x512.png',
        '/favicon.ico',
        '/index.html',
        '/manifest.json',
        '/js/index.js',
        '/js/leaflet.js',
        '/css/bulma.css',
        '/css/leaflet.css'
      ])
    )
  );
});

addEventListener('fetch', event => {
  const {request} = event;
  event.respondWith(
    db.then(cache => cache.match(request).then(
      response => response || fetch(request).then(
        response => {
          cache.put(request, response.clone());
          return response;
        }
      )
    ))
  );
});
