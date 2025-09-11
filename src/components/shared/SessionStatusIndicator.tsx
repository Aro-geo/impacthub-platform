import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

const SessionStatusIndicator: React.FC = () => {
  const { user, session } = useAuth();
  const [sessionStatus, setSessionStatus] = useState<'active' | 'refreshing' | 'expired' | 'offline'>('active');
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<number | null>(null);

  useEffect(() => {
    if (!session) {
      setSessionStatus('offline');
      return;
    }

    const checkSessionStatus = () => {
      const expiresAt = session.expires_at;
      const now = Math.floor(Date.now() / 1000);
      const timeLeft = expiresAt - now;

      setTimeUntilExpiry(timeLeft);

      if (timeLeft <= 0) {
        setSessionStatus('expired');
      } else if (timeLeft < 300) { // Less than 5 minutes
        setSessionStatus('refreshing');
      } else {
        setSessionStatus('active');
      }
    };

    // Check immediately
    checkSessionStatus();

    // Check every 30 seconds
    const interval = setInterval(checkSessionStatus, 30000);

    return () => clearInterval(interval);
  }, [session]);

  // Auto-refresh session when it's about to expire
  useEffect(() => {
    if (sessionStatus === 'refreshing' && session) {
      const refreshSession = async () => {
        try {
          await supabase.auth.refreshSession();
        } catch (error) {
          console.error('Failed to refresh session:', error);
          setSessionStatus('expired');
        }
      };

      refreshSession();
    }
  }, [sessionStatus, session]);

  if (!user) return null;

  const getStatusIcon = () => {
    switch (sessionStatus) {
      case 'refreshing':
        return <RefreshCw className="h-3 w-3 animate-spin" />;
      case 'expired':
      case 'offline':
        return <WifiOff className="h-3 w-3" />;
      default:
        return <Wifi className="h-3 w-3" />;
    }
  };

  const getStatusColor = () => {
    switch (sessionStatus) {
      case 'refreshing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'expired':
      case 'offline':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
    }
  };

  const getStatusText = () => {
    switch (sessionStatus) {
      case 'refreshing':
        return 'Refreshing...';
      case 'expired':
        return 'Session Expired';
      case 'offline':
        return 'Offline';
      default:
        return 'Connected';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 md:hidden">
      <Badge className={`${getStatusColor()} flex items-center space-x-1`}>
        {getStatusIcon()}
        <span className="text-xs">{getStatusText()}</span>
      </Badge>
    </div>
  );
};

export default SessionStatusIndicator;