import type { Session } from '@supabase/supabase-js';

export const serviceWorkerUtils = {
  notifyAuthStateChanged: (isAuthenticated: boolean, session: Session | null) => {
    try {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'AUTH_STATE_CHANGED',
          authenticated: isAuthenticated,
          userId: session?.user?.id || null,
          expiresAt: session?.expires_at || null
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
        // Soft session sync: trigger session fetch without full reload
        import('@/integrations/supabase/client').then(({ supabase }) => {
          supabase.auth.getSession();
        }).catch(() => {/* ignore */});
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