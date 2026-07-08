const CACHE_NAME = 'recipes-pwa-v2';
const DYNAMIC_CACHE = 'recipes-dynamic-v2';

// App shell and static assets
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.webmanifest',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle HTTP/HTTPS requests
  if (!event.request.url.startsWith('http')) return;

  const url = new URL(event.request.url);

  // Default Network-First for HTML/pages, falling back to offline.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(event.request, { ignoreSearch: true }).then((response) => {
            return response || caches.match('/offline.html');
          });
        })
    );
    return;
  }

  // Stale-While-Revalidate for images and categories
  if (
    url.pathname.match(/\.(png|jpg|jpeg|svg|gif)$/) ||
    url.pathname.includes('/api/categories')
  ) {
    event.respondWith(
      caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            const clone = networkResponse.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return networkResponse;
        }).catch((e) => {
          console.log("Network fetch failed for image/category", e);
        });
        
        return cachedResponse || fetchPromise.then(res => res || new Response('', { status: 503 }));
      })
    );
    return;
  }

  // Network-First with cache fallback for everything else (APIs, JS, CSS, etc.)
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.ok && event.request.method === 'GET') {
          const clone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request, { ignoreSearch: true }).then(cachedResponse => {
          return cachedResponse || new Response('', { status: 503, statusText: 'Offline' });
        });
      })
  );
});
