// Affinity PWA Service Worker
const CACHE_NAME = 'affinity-v1';
const STATIC_CACHE = 'affinity-static-v1';
const DYNAMIC_CACHE = 'affinity-dynamic-v1';

// Files to cache immediately (excluding dynamic HTML pages)
const STATIC_FILES = [
	'/manifest.json',
	'/icon-192.png',
	'/icon-512.png'
	// Removed HTML pages that contain dynamic i18n content
];

// Install event - cache static files
self.addEventListener('install', event => {
	console.log('Service Worker installing...');
	event.waitUntil(
		caches.open(STATIC_CACHE)
			.then(cache => {
				console.log('Caching static files');
				return cache.addAll(STATIC_FILES);
			})
			.then(() => {
				console.log('Service Worker installed');
				return self.skipWaiting();
			})
			.catch(error => {
				console.error('Installation failed:', error);
			})
	);
});

// Fetch event - serve from cache when offline, but not for HTML pages with i18n
self.addEventListener('fetch', (event) => {
	const url = new URL(event.request.url);
	
	// Don't cache HTML pages that contain dynamic i18n content
	if (event.request.destination === 'document' || 
		event.request.headers.get('accept')?.includes('text/html')) {
		// Always fetch fresh for HTML pages
		event.respondWith(fetch(event.request));
		return;
	}
	
	// Cache other resources (CSS, JS, images, etc.)
	event.respondWith(
		caches.match(event.request)
			.then((response) => {
				// Return cached version or fetch from network
				return response || fetch(event.request);
			})
	);
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Push notification handling
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/favicon-32x32.png',
    badge: '/favicon-32x32.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: data.primaryKey || '1'
    },
    actions: [
      {
        action: 'view',
        title: 'View Details',
        icon: '/favicon-32x32.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/favicon-32x32.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    // Open the app to a specific page based on the notification
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
