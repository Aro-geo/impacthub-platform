import { useEffect, useState, useCallback } from 'react';
import { rpcService } from '@/services/rpcService';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardData {
  progress?: any;
  streak?: any;
  completedLessons?: number;
  todayAI?: any;
  recentActivity?: any[];
  impactPoints?: number;
}

export function useConnectionHealth(intervalMs = 15000) {
  const [healthy, setHealthy] = useState<boolean | null>(null);
  const [lastChecked, setLastChecked] = useState<number | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { user } = useAuth();

  const check = useCallback(async () => {
    try {
      const { data, error } = await rpcService.ping();
      const ok = !!data && !error;
      setHealthy(ok);
      setLastChecked(Date.now());
      if (ok) {
        setRetryCount(0); // Reset retry count on successful connection
        if (user) {
          await rpcService.validateAndRefreshSession(user.id);
        }
      } else {
        // Implement exponential backoff for retries
        const backoffDelay = Math.min(1000 * Math.pow(2, retryCount), 30000);
        setRetryCount(prev => prev + 1);
        setTimeout(check, backoffDelay);
      }
    } catch (error) {
      console.error('Connection health check failed:', error);
      setHealthy(false);
      // Implement same backoff for errors
      const backoffDelay = Math.min(1000 * Math.pow(2, retryCount), 30000);
      setRetryCount(prev => prev + 1);
      setTimeout(check, backoffDelay);
    }
  }, [user]);

  useEffect(() => {
    check();
    const id = setInterval(check, intervalMs);
    return () => clearInterval(id);
  }, [check, intervalMs]);

  return { healthy, lastChecked, recheck: check };
}

export function useDashboardData(enabled = true) {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    if (!user || !enabled) {
      console.debug('[Dashboard] Skipping fetch:', { user: !!user, enabled });
      return;
    }
    
    setLoading(true);
    setError(null);
    console.debug('[Dashboard] Fetching data for user:', user.id);
    
    const { data: dash, error } = await rpcService.getUserDashboard(user.id);
    
    if (error) {
      console.error('[Dashboard] Error loading dashboard:', {
        error,
        userId: user.id
      });
      setError(error.message || 'Failed to load dashboard');
    } else {
      console.debug('[Dashboard] Data received:', {
        hasData: !!dash,
        fields: dash ? Object.keys(dash) : [],
        timestamp: new Date().toISOString()
      });
      setData(dash);
      setLastFetched(Date.now());
    }
    setLoading(false);
  }, [user, enabled]);

  useEffect(() => { 
    fetchData();
    
    // Refresh data every 5 minutes
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData, lastFetched };
}

export function useCommunityFeed(options: { limit?: number; enabled?: boolean } = {}) {
  const { limit = 20, enabled = true } = options;
  const { user } = useAuth();
  const [feed, setFeed] = useState<any[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const load = useCallback(async (reset = false) => {
    if (!user || !enabled) return;
    setLoading(true);
    setError(null);
    const { data, error } = await rpcService.getCommunityFeed(user.id, limit, reset ? undefined : cursor || undefined);
    if (error) setError(error.message || 'Failed to load feed');
    else if (data) {
      const rows = data as any[];
      if (reset) setFeed(rows);
      else setFeed(prev => [...prev, ...rows]);
      if (rows.length < limit) setHasMore(false);
      if (rows.length > 0) setCursor(rows[rows.length - 1].created_at);
    }
    setLoading(false);
  }, [user, enabled, limit, cursor]);

  useEffect(() => { load(true); }, [load]);

  return { feed, loading, error, loadMore: () => load(false), refresh: () => { setCursor(null); setHasMore(true); load(true); }, hasMore };
}

export function useRecordActivity() {
  const { user } = useAuth();
  return useCallback(async (lessonId: string | null, type: string, meta?: any) => {
    if (!user) return null;
    const { data } = await rpcService.recordLearningActivity(user.id, lessonId, type, meta || {});
    return data;
  }, [user]);
}

export function useTrackAIUsage() {
  const { user } = useAuth();
  return useCallback(async (tokens: number) => {
    if (!user) return null;
    const { data } = await rpcService.trackAIUsage(user.id, tokens);
    return data;
  }, [user]);
}

export function useBatchLessonProgress() {
  const { user } = useAuth();
  return useCallback(async (updates: { lessonId: string; status: string; percent: number }[]) => {
    if (!user || updates.length === 0) return 0;
    const lessonIds = updates.map(u => u.lessonId);
    const statuses = updates.map(u => u.status);
    const percents = updates.map(u => u.percent);
    const { data } = await rpcService.batchUpdateLessonProgress(user.id, lessonIds, statuses, percents);
    return data || 0;
  }, [user]);
}
