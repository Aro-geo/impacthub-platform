import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { serviceWorkerUtils } from '@/utils/serviceWorkerUtils';

export const useSessionPersistence = () => {
  // Removed visibility listener responsibility (handled centrally elsewhere)
  const handleVisibilityChange = useCallback(() => {}, []);

  // Handle storage events for cross-tab session sync
  const handleStorageChange = useCallback(async (event: StorageEvent) => {
    if (event.key === 'impacthub-auth' && event.newValue !== event.oldValue) {
      // Session changed in another tab. Instead of a full reload (which was causing UI flicker
      // and perceived "disappearance" after idle), we just fetch the latest session so that
      // Supabase's auth state change listener in AuthContext will reconcile state.
      try {
        console.log('[SessionPersistence] Detected cross-tab auth change, synchronizing session');
        await supabase.auth.getSession();
      } catch (e) {
        console.warn('[SessionPersistence] Failed to sync session after storage change', e);
      }
    }
  }, []);

  useEffect(() => {
    // Set up cross-tab session sync
    const channel = serviceWorkerUtils.syncSessionAcrossTabs();
    
  // (visibility logic removed to prevent duplication)

    // Listen for storage changes (cross-tab sync)
    window.addEventListener('storage', handleStorageChange);

    // Cleanup
    return () => {
      channel.close();
  // (no visibility listener to remove)
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [handleVisibilityChange, handleStorageChange]);

  return {
    refreshSession: () => supabase.auth.refreshSession(),
    getSession: () => supabase.auth.getSession()
  };
};