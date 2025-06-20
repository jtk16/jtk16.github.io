// Service Worker for Jack Kinney Portfolio
// Provides basic caching and offline functionality

const CACHE_NAME = 'jtk-portfolio-v1.2.1'; // <-- Updated version for quantum visualizer
const urlsToCache = [
  '/',
  '/index.html',
  '/projects.html',
  '/assets/css/style.css',
  '/assets/js/main.js',
  '/assets/images/profile.jpg',
  '/manifest.json',
  '/applets/index.html',
  '/applets/applet-registry.json',
  // Graph Laplacian Explorer
  '/applets/graph-laplacian/index.html',
  '/applets/graph-laplacian/graph-engine.js',
  '/applets/graph-laplacian/visualizer.js',
  '/applets/graph-laplacian/eigenvalue-controls.js',
  '/applets/graph-laplacian/style.css',
  // N-Dimensional Minesweeper
  '/applets/minesweeper-nd/index.html',
  '/applets/minesweeper-nd/nd-minesweeper.js',
  '/applets/minesweeper-nd/dimension-visualizer.js',
  '/applets/minesweeper-nd/style.css',
  // Quantum Algorithm Visualizer
  '/applets/quantum-visualizer/index.html',
  '/applets/quantum-visualizer/quantum-visualizer.js',
  '/applets/quantum-visualizer/style.css',
  // External dependencies
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('Service Worker: Install event');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Service Worker: Cache installation failed:', error);
      })
  );

  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activate event');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // Claim all clients immediately
  self.clients.claim();
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  // Only handle same-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    // For external resources (fonts, CDNs), try network first, fallback to cache
    if (event.request.url.includes('fonts.googleapis.com') ||
        event.request.url.includes('cdnjs.cloudflare.com') ||
        event.request.url.includes('cdn.jsdelivr.net')) {
      
      event.respondWith(
        fetch(event.request)
          .then((response) => {
            // Clone and cache successful responses
            if (response.ok) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }
            return response;
          })
          .catch(() => {
            // Fallback to cache if network fails
            return caches.match(event.request);
          })
      );
      return;
    }
    
    // For other external requests, just try network
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          console.log('Service Worker: Serving from cache:', event.request.url);
          return response;
        }

        // Fetch from network if not in cache
        return fetch(event.request)
          .then((response) => {
            // Don't cache if not a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response for caching
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch((error) => {
            console.error('Service Worker: Fetch failed:', error);

            // Return offline page for navigation requests if available
            if (event.request.destination === 'document') {
              return caches.match('/offline.html'); // You might want to create an offline.html page
            }
          });
      })
  );
});

// Handle background sync (if needed in the future)
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync event');

  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle background sync logic here
      console.log('Service Worker: Background sync completed')
    );
  }
});

// Handle push notifications (if needed in the future)
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push event received');

  const options = {
    body: event.data ? event.data.text() : 'New quantum algorithm available!',
    icon: './assets/images/icons/icon-192x192.png',
    badge: './assets/images/icons/icon-72x72.png',
    tag: 'portfolio-notification',
    renotify: true,
    requireInteraction: false,
    actions: [
      {
        action: 'view',
        title: 'View Portfolio',
        icon: './assets/images/icons/icon-72x72.png'
      },
      {
        action: 'quantum',
        title: 'Try Quantum Visualizer',
        icon: './assets/images/icons/icon-72x72.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Jack Kinney Portfolio', options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click event');

  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'quantum') {
    event.waitUntil(
      clients.openWindow('/applets/quantum-visualizer/index.html')
    );
  }
});

// Error handling
self.addEventListener('error', (event) => {
  console.error('Service Worker: Error occurred:', event.error);
});

// Unhandled promise rejection
self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker: Unhandled promise rejection:', event.reason);
});

// Message handling for cache updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

console.log('Service Worker: Script loaded successfully with quantum visualizer support');