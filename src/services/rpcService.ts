import { supabase } from '@/integrations/supabase/client';

// Centralized thin wrapper around Supabase RPC calls with logging & typed helpers.
// Each method returns { data, error } similar to Supabase but adds console debug tags.

export async function rpc<T = any>(fn: string, params?: Record<string, any>): Promise<{ data: T | null; error: any }> {
  try {
    const started = performance.now();
    // Cast due to generated types not enumerating custom RPCs yet
    const { data, error } = await (supabase as any).rpc(fn, params as any);
    const ms = +(performance.now() - started).toFixed(1);
    
    if (error) {
      console.warn('[rpc]', fn, 'error', { 
        params, 
        ms, 
        message: error.message,
        code: error.code,
        details: error.details 
      });
      return { data: null, error };
    }

    if (!data && fn !== 'ping') {
      console.warn('[rpc]', fn, 'warning: no data returned', { params, ms });
    } else {
      console.debug('[rpc]', fn, 'success', { 
        params, 
        ms, 
        dataReceived: !!data,
        dataType: data ? typeof data : 'null'
      });
    }
    
    return { data: data as T, error: null };
  } catch (e: any) {
    console.error('[rpc]', fn, 'exception', {
      name: e.name,
      message: e.message,
      stack: e.stack,
      params
    });
    return { data: null, error: e };
  }
}

export const rpcService = {
  ping: async () => {
    console.debug('[RPC] Attempting ping');
    return rpc<string>('ping');
  },
  
  validateAndRefreshSession: async (userId: string) => {
    console.debug('[RPC] Validating session for user:', userId);
    return rpc('validate_and_refresh_session', { p_user_id: userId });
  },
  
  getUserDashboard: async (userId: string) => {
    console.debug('[RPC] Fetching dashboard data for user:', userId);
    const start = performance.now();
    const result = await rpc<any>('get_user_dashboard', { p_user_id: userId });
    const duration = performance.now() - start;
    
    if (result.error) {
      console.error('[RPC] Dashboard fetch failed:', {
        userId,
        error: result.error,
        duration: `${duration.toFixed(2)}ms`
      });
    } else {
      console.debug('[RPC] Dashboard fetch completed:', {
        userId,
        hasData: !!result.data,
        dataFields: result.data ? Object.keys(result.data) : [],
        duration: `${duration.toFixed(2)}ms`
      });
    }
    
    return result;
  },
  
  getLessonWithProgress: async (userId: string, lessonId: string) => {
    console.debug('[RPC] Fetching lesson progress:', { userId, lessonId });
    return rpc('get_lesson_with_progress', { p_user_id: userId, p_lesson_id: lessonId });
  },
  
  batchUpdateLessonProgress: async (userId: string, lessonIds: string[], statuses: string[], percents: number[]) => {
    console.debug('[RPC] Batch updating lesson progress:', {
      userId,
      lessonCount: lessonIds.length,
      statuses: statuses.length,
      percents: percents.length
    });
    return rpc<number>('batch_update_lesson_progress', {
      p_user_id: userId,
      p_lesson_ids: lessonIds,
      p_statuses: statuses,
      p_percents: percents
    });
  },
  
  recordLearningActivity: async (userId: string, lessonId: string | null, activityType: string, meta: any = {}) => {
    console.debug('[RPC] Recording learning activity:', {
      userId,
      lessonId,
      activityType,
      hasMetadata: !!meta
    });
    return rpc('record_learning_activity', {
      p_user_id: userId,
      p_lesson_id: lessonId,
      p_activity_type: activityType,
      p_meta: meta
    });
  },
  
  trackAIUsage: async (userId: string, tokens: number) => {
    console.debug('[RPC] Tracking AI usage:', { userId, tokens });
    return rpc('track_ai_usage', {
      p_user_id: userId,
      p_tokens_used: tokens
    });
  },
  
  getCommunityFeed: async (userId: string, limit = 20, cursor?: string) => {
    console.debug('[RPC] Fetching community feed:', {
      userId,
      limit,
      hasCursor: !!cursor
    });
    return rpc('get_community_feed', {
      p_user_id: userId,
      p_limit: limit,
      p_cursor: cursor || null
    });
  }
};

export default rpcService;
