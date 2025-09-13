// Service Worker for ImpactHub PWA
const CACHE_NAME = 'impacthub-v2'; // Increment version to force cache update
const STATIC_CACHE = 'static-v2';
const DYNAMIC_CACHE = 'dynamic-v2';
const LEARNING_CACHE = 'learning-v2';

// Session state tracking
let authStateExpiry = null;

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/logo.png',
  '/offline.html'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static assets', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== LEARNING_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests (e.g., Supabase REST/realtime, CDNs)
  if (url.origin !== self.location.origin) {
    return;
  }

  // Handle different types of requests
  if (url.pathname.startsWith('/api/')) {
    // API requests - network first with cache fallback
    event.respondWith(networkFirstStrategy(request));
  } else if (url.pathname.includes('/learning/') || url.pathname.includes('/modules/')) {
    // Learning content - cache first with network fallback
    event.respondWith(cacheFirstStrategy(request, LEARNING_CACHE));
  } else if (isStaticAsset(url.pathname)) {
    // Static assets - cache first
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
  } else {
    // Other requests - stale while revalidate
    event.respondWith(staleWhileRevalidateStrategy(request));
  }
});

// Network first strategy (for API calls) with timeout
async function networkFirstStrategy(request) {
  try {
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const networkResponse = await fetch(request, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      // Check if cached response is for authenticated content and session might be expired
      if (request.url.includes('/api/') && authStateExpiry && Date.now() > authStateExpiry) {
        console.log('Cached response may be stale due to session expiry');
        // Return cache but also attempt background refresh
        refreshInBackground(request);
      }
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    // For non-navigation requests with no cache, return an error response instead of throwing
    return new Response('', { status: 504, statusText: 'Gateway Timeout' });
  }
}

// Background refresh for stale content
async function refreshInBackground(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
  } catch (error) {
    console.log('Background refresh failed:', error);
  }
}

// Cache first strategy (for static assets and learning content)
async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Failed to fetch from network:', error);
    
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    // For non-navigation requests with no cache, return an error response instead of throwing
    const fallbackStatus = request.destination === 'script' || request.destination === 'style' || request.destination === 'image' ? 504 : 408;
    return new Response('', { status: fallbackStatus, statusText: 'Offline or Network Error' });
  }
}

// Stale while revalidate strategy - Fixed clone issue
async function staleWhileRevalidateStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  const networkResponsePromise = fetch(request)
    .then(async (networkResponse) => {
      if (networkResponse.ok && networkResponse.body) {
        try {
          const cache = await caches.open(DYNAMIC_CACHE);
          // Clone before using to prevent "body already used" error
          await cache.put(request, networkResponse.clone());
        } catch (error) {
          console.warn('Failed to cache response:', error);
        }
      }
      return networkResponse;
    })
    .catch(() => null);
  
  return cachedResponse || networkResponsePromise || caches.match('/offline.html');
}

// Check if URL is a static asset
function isStaticAsset(pathname) {
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.svg', '.woff', '.woff2'];
  return staticExtensions.some(ext => pathname.endsWith(ext));
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(syncOfflineActions());
  }
});

// Sync offline actions when connection is restored
async function syncOfflineActions() {
  try {
    // Get offline actions from IndexedDB
    const offlineActions = await getOfflineActions();
    
    for (const action of offlineActions) {
      try {
        await syncAction(action);
        await removeOfflineAction(action.id);
      } catch (error) {
        console.error('Failed to sync action:', action, error);
        // Increment retry count
        await updateActionRetryCount(action.id);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Placeholder functions for IndexedDB operations
async function getOfflineActions() {
  // Implementation would use IndexedDB to get stored offline actions
  return [];
}

async function syncAction(action) {
  // Implementation would sync the action with the server
  console.log('Syncing action:', action);
}

async function removeOfflineAction(actionId) {
  // Implementation would remove the action from IndexedDB
  console.log('Removing synced action:', actionId);
}

async function updateActionRetryCount(actionId) {
  // Implementation would update retry count in IndexedDB
  console.log('Updating retry count for action:', actionId);
}

// Handle auth state messages
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'AUTH_STATE_CHANGED') {
    authStateExpiry = event.data.expiresAt;
    console.log('Service Worker: Auth state updated', { expiresAt: authStateExpiry });
  }
});

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New content available!',
    icon: '/logo.png',
    badge: '/logo.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open App',
        icon: '/logo.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/logo.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('ImpactHub', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_LEARNING_CONTENT') {
    event.waitUntil(cacheLearningContent(event.data.content));
  }
  
  if (event.data && event.data.type === 'AUTH_STATE_CHANGED') {
    // Support both new shape (top-level) and legacy payload shape
    const authenticated = typeof event.data.authenticated === 'boolean'
      ? event.data.authenticated
      : event.data.payload?.isAuthenticated;
    const expiresAt = event.data.expiresAt || event.data.payload?.expiresAt || null;

    if (authenticated && expiresAt) {
      authStateExpiry = expiresAt * 1000; // Convert to ms
      console.log('Service Worker: Auth state updated, expires at', new Date(authStateExpiry));
    } else {
      authStateExpiry = null;
      console.log('Service Worker: User logged out, clearing auth state');
      clearAuthenticatedCache();
    }
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(clearAllCaches());
  }
});

// Clear authenticated content from cache
async function clearAuthenticatedCache() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const requests = await cache.keys();
    
    for (const request of requests) {
      if (request.url.includes('/api/') || request.url.includes('/dashboard')) {
        await cache.delete(request);
      }
    }
    
    console.log('Service Worker: Cleared authenticated cache');
  } catch (error) {
    console.error('Service Worker: Failed to clear authenticated cache', error);
  }
}

// Clear all caches
async function clearAllCaches() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    console.log('Service Worker: All caches cleared');
  } catch (error) {
    console.error('Service Worker: Failed to clear caches', error);
  }
}

// Cache learning content for offline access
async function cacheLearningContent(content) {
  try {
    const cache = await caches.open(LEARNING_CACHE);
    
    for (const item of content) {
      if (item.url) {
        await cache.add(item.url);
      }
    }
    
    console.log('Learning content cached successfully');
  } catch (error) {
    console.error('Failed to cache learning content:', error);
  }
}