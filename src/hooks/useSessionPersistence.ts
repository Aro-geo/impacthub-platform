import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { serviceWorkerUtils } from '@/utils/serviceWorkerUtils';

export const useSessionPersistence = () => {
  // Handle visibility change to refresh session when tab becomes active
  const handleVisibilityChange = useCallback(async () => {
    if (document.visibilityState === 'visible') {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session check on visibility change failed:', error);
          return;
        }

        // If session exists but is close to expiry, refresh it
        if (session) {
          const expiresAt = session.expires_at;
          const now = Math.floor(Date.now() / 1000);
          const timeUntilExpiry = expiresAt - now;

          if (timeUntilExpiry < 300) { // Less than 5 minutes
            console.log('Refreshing session on tab focus...');
            await supabase.auth.refreshSession();
          }
        }
      } catch (error) {
        console.error('Error checking session on visibility change:', error);
      }
    }
  }, []);

  // Handle storage events for cross-tab session sync
  const handleStorageChange = useCallback((event: StorageEvent) => {
    if (event.key === 'impacthub-auth' && event.newValue !== event.oldValue) {
      // Session changed in another tab, reload to sync
      window.location.reload();
    }
  }, []);

  useEffect(() => {
    // Set up cross-tab session sync
    const channel = serviceWorkerUtils.syncSessionAcrossTabs();
    
    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Listen for storage changes (cross-tab sync)
    window.addEventListener('storage', handleStorageChange);

    // Cleanup
    return () => {
      channel.close();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [handleVisibilityChange, handleStorageChange]);

  return {
    refreshSession: () => supabase.auth.refreshSession(),
    getSession: () => supabase.auth.getSession()
  };
};