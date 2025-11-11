import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useConnectionRecovery = () => {
  const { session, refreshProfile } = useAuth();

  const handleVisibilityChange = useCallback(async () => {
    if ((document.visibilityState === 'visible' || !document.hidden) && session) {
      try {
        // First, check the connection state
        const { error: pingError } = await supabase.rpc('ping');
        
        if (pingError) {
          console.log('Connection lost, initiating recovery sequence...');
          
          // Attempt to refresh the session first
          try {
            await supabase.auth.refreshSession();
          } catch (refreshError) {
            console.warn('Session refresh failed:', refreshError);
          }
          
          // Then try to reconnect to the database
          try {
            await supabase.auth.getSession();
            const { error: testError } = await supabase.from('profiles').select('id').limit(1);
            
            if (!testError) {
              console.log('Connection recovered successfully');
              await refreshProfile();
            } else {
              console.error('Database connection test failed:', testError);
              // Trigger a full reconnection
              window.dispatchEvent(new CustomEvent('supabase:reconnect-required'));
            }
          } catch (reconnectError) {
            console.error('Full reconnection failed:', reconnectError);
          }
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