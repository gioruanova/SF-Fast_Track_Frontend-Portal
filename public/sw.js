const CACHE_NAME = 'fasttrack-pwa-v3';

// Recursos a cachear
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
    '/favicon.ico'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data && event.data.type === 'CLIENT_PING') {
    event.ports[0]?.postMessage({
      type: 'PONG',
      timestamp: Date.now()
    });
  }
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) return caches.delete(cacheName);
        })
      )
    ).then(() => {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  if (url.pathname.includes('Api') || 
      url.hostname !== self.location.hostname) {
    return; // NO interceptar
  }
  
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
  );
});

// PUSH NOTIFICATIONS
self.addEventListener('push', (event) => {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'PUSH_RECEIVED',
        data: event.data ? event.data.text() : null
      });
    });
  });
  
  let notificationData = {
    title: 'Nueva notificación',
    body: 'Tienes una nueva notificación',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: 'fasttrack-notification', // Tag fijo 
    requireInteraction: true,
    silent: false,
    vibrate: [200, 100, 200],
    actions: [
      {
        action: 'open',
        title: 'Abrir',
        icon: '/icons/icon-192.png'
      },
      {
        action: 'close',
        title: 'Cerrar'
      }
    ]
  };

  if (event.data) {
    try {
      const data = event.data.json();
      
      if (data.title) {
        notificationData.title = data.title;
      }
      
      if (data.body) notificationData.body = data.body;
      if (data.icon) {
        notificationData.icon = data.icon;
      }
      
      if (data.path) {
        notificationData.data = { ...notificationData.data, path: data.path };
      }
      
      if (data.data && typeof data.data === 'object') {
        notificationData.data = { ...notificationData.data, ...data.data };
      }
      
    } catch (e) {
      try {
        const textData = event.data.text();
        notificationData.body = textData;
      } catch (textError) {
      }
    }
  }

  const showNotification = async () => {
    try {
      await self.registration.showNotification(notificationData.title, notificationData);
      
      const clients = await self.clients.matchAll({ includeUncontrolled: true });
      
      clients.forEach(client => {
        const message = {
          type: 'NOTIFICATION_SHOWN',
          data: {
            title: notificationData.title,
            body: notificationData.body,
            path: notificationData.data?.path, // path para redirigr
            icon: notificationData.icon // icono app
          }
        };
        client.postMessage(message);
      });
    } catch (error) {
      console.error('Error showing notification:', error);
      
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'NOTIFICATION_ERROR',
          error: error.message
        });
      });
    }
  };

  event.waitUntil(showNotification());
});

// NOTIFICATION CLICK
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const getTargetUrl = async () => {
    const notificationPath = event.notification.data?.path;
    
    if (notificationPath) {
      if (notificationPath.startsWith('/dashboard/')) {
        return notificationPath;
      }
      
      try {
        const clientList = await clients.matchAll({ type: 'window', includeUncontrolled: true });
        
        for (const client of clientList) {
          if (client.url.includes(self.location.origin)) {
            const urlMatch = client.url.match(/\/dashboard\/([^\/]+)/);
            if (urlMatch) {
              const userRole = urlMatch[1];
              return `/dashboard/${userRole}${notificationPath.startsWith('/') ? notificationPath : '/' + notificationPath}`;
            }
          }
        }
        
        return notificationPath.startsWith('/') ? notificationPath : '/' + notificationPath;
      } catch (error) {
        return notificationPath.startsWith('/') ? notificationPath : '/' + notificationPath;
      }
    }
    
    return '/dashboard';
  };

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async (clientList) => {
      const targetUrl = await getTargetUrl();
      
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.postMessage({
            type: 'NAVIGATE_TO',
            url: targetUrl
          });
          
          return client.focus();
        }
      }
      
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

