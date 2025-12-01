const CACHE_NAME = 'control-gastos-v2-offline'; // Cambié el nombre para forzar actualización

// Lista de archivos requeridos
const urlsToCache = [
  './',
  'controlgastos.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/chart.js@3.7.0/dist/chart.min.js',
  'https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.0.0',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js'
];

// 1. INSTALACIÓN
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache abierto y archivos guardados');
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. FETCH (INTERCEPTAR PETICIONES)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // A) Si está en caché, lo devuelve (Velocidad extrema)
        if (response) {
          return response;
        }

        // B) Si no, intenta buscarlo en internet
        return fetch(event.request)
          .then((networkResponse) => {
            // Si la respuesta es válida, la guardamos en caché para la próxima
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
            return networkResponse;
          })
          .catch(() => {
            // C) RED DE SEGURIDAD (Aquí arreglamos el problema del refresh)
            // Si no hay internet y falló todo lo anterior...
            
            // Si lo que pide es una página web (navegación), devolvemos la app
            if (event.request.mode === 'navigate') {
              return caches.match('./controlgastos.html');
            }
            
            // Aquí podrías devolver una imagen placeholder si fallara una imagen, etc.
          });
      })
  );
});

// 3. ACTIVACIÓN (LIMPIEZA DE CACHÉS VIEJOS)
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
