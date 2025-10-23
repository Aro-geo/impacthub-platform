import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useConnectionRecovery = () => {
  const { session, refreshProfile } = useAuth();

  const handleVisibilityChange = useCallback(async () => {
    if (document.visibilityState === 'visible' && session) {
      try {
        // Test connection with a simple query
        const { error } = await supabase.from('profiles').select('id').limit(1);
        
        if (error) {
          console.log('Connection lost, attempting recovery...');
          // Force session refresh
          await supabase.auth.refreshSession();
          await refreshProfile();
        }
      } catch (error) {
        console.error('Connection recovery failed:', error);
      }
    }
  }, [session, refreshProfile]);

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [handleVisibilityChange]);
};