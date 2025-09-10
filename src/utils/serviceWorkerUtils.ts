// Service Worker communication utilities
export const serviceWorkerUtils = {
  // Notify service worker about authentication state changes
  notifyAuthStateChanged: (authenticated: boolean, session?: any) => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const message = {
        type: 'AUTH_STATE_CHANGED',
        authenticated,
        expiresAt: session?.expires_at || null,
        userId: session?.user?.id || null
      };
      
      navigator.serviceWorker.controller.postMessage(message);
      console.log('Notified service worker of auth state change:', message);
    }
  },

  // Clear all caches (useful for troubleshooting)
  clearAllCaches: () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CLEAR_CACHE'
      });
      console.log('Requested service worker to clear all caches');
    }
  },

  // Force service worker update
  forceUpdate: () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          registration.update();
        });
      });
    }
  },

  // Check if service worker is available and active
  isAvailable: () => {
    return 'serviceWorker' in navigator && navigator.serviceWorker.controller;
  }
};

// Auto-register service worker if available
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully:', registration);
      
      // Listen for updates
      registration.addEventListener('updatefound', () => {
        console.log('Service Worker update found');
        const newWorker = registration.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('New service worker available, consider refreshing');
              // Optionally notify user about update
            }
          });
        }
      });
      
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }
  
  return null;
};
