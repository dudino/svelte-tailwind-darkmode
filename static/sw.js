// Affinity PWA Service Worker
const CACHE_NAME = 'affinity-v1';
const STATIC_CACHE = 'affinity-static-v1';
const DYNAMIC_CACHE = 'affinity-dynamic-v1';

// Files to cache immediately
const STATIC_FILES = [
	'/',
	'/masseuse',
	'/masseuse/dashboard',
	'/masseuse/schedule',
	'/masseuse/bookings',
	'/masseuse/analytics',
	'/masseuse/profile',
	'/client-portal',
	'/manifest.json',
	'/icon-192.png',
	'/icon-512.png'
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

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
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
