// public/sw.js
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests. Let POST/PUT/DELETE requests bypass the service worker.
  // This prevents login (POST requests) and API mutations from freezing.
  if (event.request.method !== 'GET') {
    return;
  }
  event.respondWith(fetch(event.request));
});
