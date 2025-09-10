import React, { useState, useEffect } from 'react';
import { AlertCircle, Wifi, WifiOff, Clock, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useOffline } from '@/hooks/useOffline';
import { serviceWorkerUtils } from '@/utils/serviceWorkerUtils';

const SessionStatusIndicator = () => {
  const { user, session, loading } = useAuth();
  const { isOnline } = useOffline();
  const [sessionWarning, setSessionWarning] = useState<string | null>(null);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    const checkSessionStatus = () => {
      if (!user || !session) {
        setSessionWarning(null);
        setShowStatus(false);
        return;
      }

      const now = Math.floor(Date.now() / 1000);
      const expiresAt = session.expires_at;
      const timeUntilExpiry = expiresAt - now;

      if (timeUntilExpiry < 300) { // Less than 5 minutes
        setSessionWarning('Your session will expire soon. Please save your work.');
        setShowStatus(true);
      } else if (timeUntilExpiry < 600) { // Less than 10 minutes
        setSessionWarning('Your session is active.');
        setShowStatus(false);
      } else {
        setSessionWarning(null);
        setShowStatus(false);
      }
    };

    // Check immediately and then every minute
    checkSessionStatus();
    const interval = setInterval(checkSessionStatus, 60000);

    return () => clearInterval(interval);
  }, [user, session]);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleClearCache = () => {
    serviceWorkerUtils.clearAllCaches();
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <Alert className="w-80">
          <Clock className="h-4 w-4" />
          <AlertDescription>
            Loading...
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show offline status
  if (!isOnline) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <Alert variant="destructive" className="w-80">
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            You're offline. Some features may not work properly.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show session warning
  if (showStatus && sessionWarning) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <Alert variant="default" className="w-80">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{sessionWarning}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="ml-2"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Debugging info for stuck loading states (only in development)
  if (process.env.NODE_ENV === 'development') {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border text-xs">
          <div>Status: {isOnline ? 'Online' : 'Offline'}</div>
          <div>User: {user ? 'Authenticated' : 'Not authenticated'}</div>
          <div>SW: {serviceWorkerUtils.isAvailable() ? 'Active' : 'Inactive'}</div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearCache}
            className="mt-2 w-full text-xs"
          >
            Clear Cache & Reload
          </Button>
        </div>
      </div>
    );
  }

  return null;
};

export default SessionStatusIndicator;
