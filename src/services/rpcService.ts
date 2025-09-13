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
      console.warn('[rpc]', fn, 'error', { params, ms, message: error.message });
      return { data: null, error };
    }
    console.debug('[rpc]', fn, 'success', { params, ms });
    return { data: data as T, error: null };
  } catch (e: any) {
    console.error('[rpc]', fn, 'exception', e);
    return { data: null, error: e };
  }
}

export const rpcService = {
  ping: () => rpc<string>('ping'),
  validateAndRefreshSession: (userId: string) => rpc('validate_and_refresh_session', { p_user_id: userId }),
  getUserDashboard: (userId: string) => rpc<any>('get_user_dashboard', { p_user_id: userId }),
  getLessonWithProgress: (userId: string, lessonId: string) => rpc('get_lesson_with_progress', { p_user_id: userId, p_lesson_id: lessonId }),
  batchUpdateLessonProgress: (userId: string, lessonIds: string[], statuses: string[], percents: number[]) =>
    rpc<number>('batch_update_lesson_progress', { p_user_id: userId, p_lesson_ids: lessonIds, p_statuses: statuses, p_percents: percents }),
  recordLearningActivity: (userId: string, lessonId: string | null, activityType: string, meta: any = {}) =>
    rpc('record_learning_activity', { p_user_id: userId, p_lesson_id: lessonId, p_activity_type: activityType, p_meta: meta }),
  trackAIUsage: (userId: string, tokens: number) => rpc('track_ai_usage', { p_user_id: userId, p_tokens_used: tokens }),
  getCommunityFeed: (userId: string, limit = 20, cursor?: string) =>
    rpc('get_community_feed', { p_user_id: userId, p_limit: limit, p_cursor: cursor || null })
};

export default rpcService;
