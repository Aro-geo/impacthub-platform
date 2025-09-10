import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

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

        // If page was hidden for more than 5 minutes, validate session
        if (hiddenDuration > 5 * 60 * 1000 && user && session) {
          console.log('Page was idle for over 5 minutes, validating session...');
          
          try {
            // Import dynamically to avoid circular dependencies
            const { supabase } = await import('@/integrations/supabase/client');
            const { data: { session: currentSession }, error } = await supabase.auth.getSession();
            
            if (error || !currentSession) {
              console.log('Session expired during idle time');
              toast({
                title: "Session Expired",
                description: "Please sign in again to continue.",
                variant: "destructive",
              });
              
              // Force reload to redirect to auth
              setTimeout(() => {
                window.location.href = '/auth';
              }, 2000);
            } else {
              // Check if session is about to expire
              const expiresAt = currentSession.expires_at;
              const now = Math.floor(Date.now() / 1000);
              const timeUntilExpiry = expiresAt - now;

              if (timeUntilExpiry < 300) { // Less than 5 minutes
                console.log('Session expiring soon, attempting refresh...');
                const { error: refreshError } = await supabase.auth.refreshSession();
                
                if (refreshError) {
                  console.error('Failed to refresh session:', refreshError);
                  toast({
                    title: "Session Refresh Failed",
                    description: "Please sign in again to continue.",
                    variant: "destructive",
                  });
                } else {
                  toast({
                    title: "Session Refreshed",
                    description: "Your session has been automatically renewed.",
                  });
                }
              }
            }
          } catch (error) {
            console.error('Error validating session after idle time:', error);
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
