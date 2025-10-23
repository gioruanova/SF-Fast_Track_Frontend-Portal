// Registramos el service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        if (registration.active) {
          if (registration.active.state === 'activated') {
            if (navigator.serviceWorker.controller) {
              navigator.serviceWorker.controller.postMessage({
                type: 'CLIENT_PING',
                timestamp: Date.now()
              });
            }
          } else {
            registration.active.addEventListener('statechange', () => {
              if (registration.active?.state === 'activated') {
              }
            });
          }
        }

        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data.type === 'NAVIGATE_TO') {
            window.location.href = event.data.url;
          }
        });

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('Nueva versión del SW disponible, actualizando...');
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
              }
            });
          }
        });

        setInterval(() => {
          registration.update();
        }, 5 * 60 * 1000);
      })
      .catch((error) => {
        console.error('Error al registrar Service Worker:', error);
      });
  });

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('Service Worker actualizado, recargando...');
    window.location.reload();
  });
}

