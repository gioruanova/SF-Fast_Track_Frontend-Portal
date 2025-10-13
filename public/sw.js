const CACHE_NAME = 'fasttrack-pwa-v2';

// Recursos a cachear
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
    '/favicon.ico'
];

// Instalación: cacheamos los recursos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activación: limpiamos cachés antiguos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) return caches.delete(cacheName);
        })
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: usamos estrategia "network first, fallback a cache"
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // NO cachear peticiones a la API (deben incluir cookies)
  if (url.pathname.startsWith('/publicApi') || 
      url.pathname.startsWith('/customersApi') || 
      url.pathname.startsWith('/superApi') ||
      url.hostname !== self.location.hostname) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // Para otros recursos (estáticos), usar cache
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
  );
});
