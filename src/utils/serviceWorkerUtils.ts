import type { Session } from '@supabase/supabase-js';

export const serviceWorkerUtils = {
  notifyAuthStateChanged: (isAuthenticated: boolean, session: Session | null) => {
    try {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'AUTH_STATE_CHANGED',
          payload: {
            isAuthenticated,
            userId: session?.user?.id || null,
            expiresAt: session?.expires_at || null
          }
        });
      }
    } catch (error) {
      console.warn('Failed to notify service worker:', error);
    }
  },

  // Sync session across tabs
  syncSessionAcrossTabs: () => {
    const channel = new BroadcastChannel('impacthub-auth');
    
    channel.addEventListener('message', (event) => {
      if (event.data.type === 'SESSION_UPDATED') {
        // Force a session check when another tab updates the session
        window.location.reload();
      }
    });

    return channel;
  },

  broadcastSessionUpdate: () => {
    try {
      const channel = new BroadcastChannel('impacthub-auth');
      channel.postMessage({ type: 'SESSION_UPDATED' });
      channel.close();
    } catch (error) {
      console.warn('Failed to broadcast session update:', error);
    }
  }
};