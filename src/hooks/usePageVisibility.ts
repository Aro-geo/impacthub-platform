import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { safeRefreshSession } from '@/integrations/supabase/client';

export const usePageVisibility = () => {
  const { user, session } = useAuth();
  const lastVisibleTime = useRef(Date.now());
  const lastConnectionCheck = useRef(Date.now());
  const connectionCheckCount = useRef(0);
  const visibilityCheckTimeout = useRef<number | null>(null);
  const lastFocusRefresh = useRef(0);
  const MAX_RETRY_INTERVAL = 5 * 60 * 1000; // 5 minutes
  const MIN_CHECK_INTERVAL = 30 * 1000; // 30 seconds

  // Helper: whether enough time has passed to check connection
  const canCheckConnection = () => {
    const now = Date.now();
    const timeSinceLastCheck = now - lastConnectionCheck.current;

    const backoffDelay = Math.min(
      MIN_CHECK_INTERVAL * Math.pow(2, connectionCheckCount.current),
      MAX_RETRY_INTERVAL
    );

    return timeSinceLastCheck >= backoffDelay;
  };

  // Helper: validate the session and refresh if needed
  const validateAndRefreshSession = async () => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();

      if (error || !currentSession) {
        console.warn('Session validation failed, attempting recovery:', error);
        await safeRefreshSession(2);
        await supabase.from('profiles').select('id').limit(1);
      } else {
        const now = Math.floor(Date.now() / 1000);
        const timeUntilExpiry = currentSession.expires_at - now;
        if (timeUntilExpiry < 300) {
          await safeRefreshSession();
        }
      }
    } catch (err) {
      console.error('Session refresh failed:', err);
      toast({
        title: 'Connection Issues',
        description: 'Trying to restore connection...',
        variant: 'warning'
      });
    }
  };

  // Proactively ensure token freshness on focus (looser threshold than background check)
  const refreshOnFocus = async () => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: { session: currentSession } } = await supabase.auth.getSession();

      // If session missing, try to recover quickly
      if (!currentSession) {
        await safeRefreshSession(2);
        return;
      }

      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = (currentSession.expires_at || 0) - now;

      // If token expires within 15 minutes, refresh proactively on focus
      if (timeUntilExpiry < 900) {
        await safeRefreshSession();
      }
    } catch (err) {
      // Fall back to the normal validate+refresh path if needed
      try { await validateAndRefreshSession(); } catch { /* ignore */ }
    }
  };

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.hidden) {
        lastVisibleTime.current = Date.now();
        console.log('Page hidden at:', new Date(lastVisibleTime.current));
      } else {
        const hiddenDuration = Date.now() - lastVisibleTime.current;
        console.log('Page visible after', hiddenDuration / 1000, 'seconds');

        if (user && session) {
          // Check connection after idle or if enough time has passed since last check
          if ((hiddenDuration > 2 * 60 * 1000 || canCheckConnection()) && connectionCheckCount.current < 5) {
            console.log('Checking connection...');
            lastConnectionCheck.current = Date.now();
            
            try {
              await validateAndRefreshSession();
              // Reset counter on successful connection
              connectionCheckCount.current = 0;
            } catch (err) {
              // Increment counter on failure
              connectionCheckCount.current++;
              console.error('Connection check failed:', err);
            }
          } else if (connectionCheckCount.current >= 5) {
            // After 5 retries, show a more permanent error message
            toast({
              title: 'Connection Lost',
              description: 'Please check your internet connection and refresh the page.',
              variant: 'destructive',
              duration: 10000
            });
          }
        }
      }
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    const handleFocus = () => {
      if (!document.hidden) {
        const now = Date.now();
        // Avoid spamming refresh on rapid focus events
        if (now - lastFocusRefresh.current > 15000) {
          lastFocusRefresh.current = now;
          if (user && session) {
            refreshOnFocus().catch(() => {});
          }
        }
        handleVisibilityChange();
      }
    };
    
    const handleBlur = () => {
      lastVisibleTime.current = Date.now();
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    // Initial connection check on mount
    if (user && session) {
      validateAndRefreshSession().catch(console.error);
    }

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      if (visibilityCheckTimeout.current) {
        clearTimeout(visibilityCheckTimeout.current);
      }
    };
  }, [user, session]);

  return {
    isPageVisible: !document.hidden,
    lastVisibleTime: lastVisibleTime.current,
    checkConnection: async () => {
      if (canCheckConnection()) {
        lastConnectionCheck.current = Date.now();
        await validateAndRefreshSession();
      }
    }
  };
};
