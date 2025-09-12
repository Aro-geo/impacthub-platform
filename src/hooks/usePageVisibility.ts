import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { safeRefreshSession } from '@/integrations/supabase/client';

// Hook to handle page visibility and session validation
export const usePageVisibility = () => {
  const { user, session } = useAuth();
  const lastVisibleTime = useRef(Date.now());
  const visibilityCheckTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.hidden) {
        // Page is now hidden - store the time
        lastVisibleTime.current = Date.now();
        console.log('Page hidden at:', new Date(lastVisibleTime.current));
      } else {
        // Page is now visible - check how long it was hidden
        const hiddenDuration = Date.now() - lastVisibleTime.current;
        console.log('Page visible after', hiddenDuration / 1000, 'seconds');

        // If page was hidden for more than 5 minutes, validate session (softly, no redirect)
        if (hiddenDuration > 5 * 60 * 1000 && user && session) {
          console.log('Page idle >5m, validating session silently');
          try {
            const { supabase } = await import('@/integrations/supabase/client');
            const { data: { session: currentSession }, error } = await supabase.auth.getSession();
            if (error) {
              console.warn('Idle session check error (will retry later):', error);
            } else if (!currentSession) {
              // Try one silent refresh before notifying user
              try {
                await safeRefreshSession(2);
                toast({ title: 'Session Restored', description: 'Your session was restored after idle.' });
              } catch {
                toast({ title: 'Session Needs Re-login', description: 'Please re-authenticate soon.', variant: 'destructive' });
              }
            } else {
              const now = Math.floor(Date.now() / 1000);
              const timeUntilExpiry = currentSession.expires_at - now;
              if (timeUntilExpiry < 300) {
                try {
                  await safeRefreshSession();
                  console.log('Session refreshed after idle');
                } catch (err) {
                  console.warn('Post-idle refresh failed (will rely on auth listener):', err);
                }
              }
            }
          } catch (err) {
            console.error('Idle validation unexpected error:', err);
          }
        }

        // Clear any pending timeout checks
        if (visibilityCheckTimeout.current) {
          clearTimeout(visibilityCheckTimeout.current);
          visibilityCheckTimeout.current = null;
        }
      }
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also handle window focus/blur as fallback
    const handleFocus = () => {
      if (document.hidden === false) {
        handleVisibilityChange();
      }
    };
    
    const handleBlur = () => {
      lastVisibleTime.current = Date.now();
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

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
    lastVisibleTime: lastVisibleTime.current
  };
};
