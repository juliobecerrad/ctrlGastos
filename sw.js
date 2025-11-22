const CACHE_NAME = 'control-gastos-cache-v1'; // ¡VERSIÓN ACTUALIZADA!
// Lista de archivos base para que la app funcione offline.
const urlsToCache = [
  './',
  'controlgastos.html', 
  'manifest.json',      
  'icon-192.png',       
  'icon-512.png',       
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/chart.js@3.7.0/dist/chart.min.js',
  'https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.0.0'
];

// 1. Evento de Instalación
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache abierto: ' + CACHE_NAME);
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. Evento de Fetch: Estrategia "Cache First"
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Si la respuesta está en el caché, la devuelve
        if (response) {
          return response;
        }

        // Si no, la busca en la red (Cache, then Network)
        return fetch(event.request).then(
          (response) => {
            if (!response || response.status !== 200 || (response.type !== 'basic' && response.type !== 'cors')) {
              return response;
            }

            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// 3. Evento de Activación: Limpia cachés antiguos
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Elimina cachés que no están en la lista blanca (los antiguos)
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});