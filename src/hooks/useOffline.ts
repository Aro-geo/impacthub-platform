import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

interface OfflineAction {
  id: string;
  type: 'progress_update' | 'quiz_attempt' | 'comment' | 'like' | 'post';
  data: any;
  timestamp: number;
  retryCount: number;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
}

interface NetworkInfo {
  isOnline: boolean;
  effectiveType: '2g' | '3g' | '4g' | 'slow-2g' | undefined;
  downlink: number;
  rtt: number;
}

export const useOffline = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');
  const [offlineActions, setOfflineActions] = useState<OfflineAction[]>([]);
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({
    isOnline: navigator.onLine,
    effectiveType: undefined,
    downlink: 0,
    rtt: 0
  });

  // Update online status
  const updateOnlineStatus = useCallback(() => {
    const online = navigator.onLine;
    setIsOnline(online);
    
    // Update network info if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      setNetworkInfo({
        isOnline: online,
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt
      });
    }

    if (online && syncStatus === 'offline') {
      setSyncStatus('syncing');
      syncOfflineActions();
      toast({
        title: "Back Online",
        description: "Syncing your offline changes...",
      });
    } else if (!online) {
      setSyncStatus('offline');
      toast({
        title: "You're Offline",
        description: "Don't worry, you can continue learning with cached content.",
        variant: "destructive",
      });
    }
  }, [syncStatus]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => updateOnlineStatus();
    const handleOffline = () => updateOnlineStatus();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for connection changes
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connection.addEventListener('change', updateOnlineStatus);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        connection.removeEventListener('change', updateOnlineStatus);
      }
    };
  }, [updateOnlineStatus]);

  // Load offline actions from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('impacthub-offline-actions');
    if (stored) {
      try {
        setOfflineActions(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse offline actions:', error);
      }
    }
  }, []);

  // Save offline actions to localStorage
  const saveOfflineActions = useCallback((actions: OfflineAction[]) => {
    localStorage.setItem('impacthub-offline-actions', JSON.stringify(actions));
    setOfflineActions(actions);
  }, []);

  // Add offline action
  const addOfflineAction = useCallback((
    type: OfflineAction['type'], 
    data: any
  ) => {
    const action: OfflineAction = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending'
    };

    const newActions = [...offlineActions, action];
    saveOfflineActions(newActions);

    // Try to sync immediately if online
    if (isOnline) {
      syncOfflineActions();
    }

    return action.id;
  }, [offlineActions, isOnline, saveOfflineActions]);

  // Sync offline actions
  const syncOfflineActions = useCallback(async () => {
    if (!isOnline || offlineActions.length === 0) {
      setSyncStatus('synced');
      return;
    }

    setSyncStatus('syncing');
    const pendingActions = offlineActions.filter(action => 
      action.status === 'pending' || action.status === 'failed'
    );

    let syncedCount = 0;
    const updatedActions = [...offlineActions];

    for (const action of pendingActions) {
      try {
        await syncAction(action);
        
        // Mark as synced
        const index = updatedActions.findIndex(a => a.id === action.id);
        if (index !== -1) {
          updatedActions[index].status = 'synced';
          syncedCount++;
        }
      } catch (error) {
        console.error('Failed to sync action:', action, error);
        
        // Increment retry count
        const index = updatedActions.findIndex(a => a.id === action.id);
        if (index !== -1) {
          updatedActions[index].retryCount++;
          updatedActions[index].status = updatedActions[index].retryCount >= 3 ? 'failed' : 'pending';
        }
      }
    }

    // Remove synced actions
    const remainingActions = updatedActions.filter(action => action.status !== 'synced');
    saveOfflineActions(remainingActions);

    setSyncStatus(remainingActions.length > 0 ? 'offline' : 'synced');

    if (syncedCount > 0) {
      toast({
        title: "Sync Complete",
        description: `${syncedCount} offline action${syncedCount > 1 ? 's' : ''} synced successfully.`,
      });
    }
  }, [isOnline, offlineActions, saveOfflineActions]);

  // Sync individual action (placeholder - implement based on action type)
  const syncAction = async (action: OfflineAction) => {
    // This would implement the actual sync logic based on action type
    console.log('Syncing action:', action);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Throw error for testing retry logic
    if (Math.random() < 0.1) {
      throw new Error('Sync failed');
    }
  };

  // Cache learning content for offline access
  const cacheLearningContent = useCallback(async (content: any[]) => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CACHE_LEARNING_CONTENT',
        content
      });
    }
  }, []);

  // Get storage usage
  const getStorageUsage = useCallback(async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        return {
          used: estimate.usage || 0,
          available: estimate.quota || 0,
          percentage: estimate.quota ? Math.round((estimate.usage || 0) / estimate.quota * 100) : 0
        };
      } catch (error) {
        console.error('Failed to get storage estimate:', error);
      }
    }
    return null;
  }, []);

  // Clear cache
  const clearCache = useCallback(async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      
      toast({
        title: "Cache Cleared",
        description: "All cached content has been removed.",
      });
    }
  }, []);

  // Get connection quality
  const getConnectionQuality = useCallback(() => {
    if (!isOnline) return 'offline';
    
    const { effectiveType, downlink, rtt } = networkInfo;
    
    if (effectiveType === 'slow-2g' || effectiveType === '2g') return 'poor';
    if (effectiveType === '3g' || (downlink && downlink < 1.5)) return 'fair';
    if (effectiveType === '4g' || (downlink && downlink >= 1.5)) return 'good';
    
    return 'unknown';
  }, [isOnline, networkInfo]);

  return {
    isOnline,
    syncStatus,
    offlineActions,
    networkInfo,
    addOfflineAction,
    syncOfflineActions,
    cacheLearningContent,
    getStorageUsage,
    clearCache,
    getConnectionQuality,
    pendingActionsCount: offlineActions.filter(a => a.status === 'pending').length,
    failedActionsCount: offlineActions.filter(a => a.status === 'failed').length
  };
};