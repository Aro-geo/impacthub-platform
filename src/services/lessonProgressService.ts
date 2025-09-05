import { supabase } from '@/integrations/supabase/client';
import { incidentAnalysisService } from './incidentAnalysisService';
import { queryCache } from '@/utils/dbOptimization';

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress_percentage: number;
  started_at?: string;
  completed_at?: string;
  last_accessed: string;
}

// Create a cache for lesson progress data
const PROGRESS_CACHE_TTL = 120; // 2 minutes cache for progress
const USER_PROGRESS_SUMMARY_TTL = 300; // 5 minutes cache for summary stats

class LessonProgressService {

  /**
   * Start a lesson - handles the unique constraint properly
   */
  async startLesson(userId: string, lessonId: string): Promise<LessonProgress | null> {
    const startTime = performance.now();

    try {
      // First, try to get existing progress
      const { data: existing } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .maybeSingle();

      let result: LessonProgress;

      if (existing) {
        // Update existing record
        const { data, error } = await supabase
          .from('lesson_progress')
          .update({
            status: 'in_progress',
            last_accessed: new Date().toISOString(),
            started_at: existing.started_at || new Date().toISOString()
          })
          .eq('user_id', userId)
          .eq('lesson_id', lessonId)
          .select()
          .single();

        if (error) throw error;
        result = data as LessonProgress;
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from('lesson_progress')
          .insert({
            user_id: userId,
            lesson_id: lessonId,
            status: 'in_progress',
            progress_percentage: 0,
            started_at: new Date().toISOString(),
            last_accessed: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        result = data as LessonProgress;
      }

      const responseTime = performance.now() - startTime;

      // Log performance metric
      incidentAnalysisService.logPerformance({
        metric: 'api_response',
        value: responseTime,
        component: 'lessonProgressService',
        metadata: {
          operation: 'startLesson',
          userId,
          lessonId,
          hadExisting: !!existing
        }
      });

      return result;
    } catch (error) {
      const responseTime = performance.now() - startTime;

      await incidentAnalysisService.logApiError('startLesson', error, responseTime);
      console.error('Error starting lesson:', error);
      return null;
    }
  }

  /**
   * Update lesson progress
   */
  async updateProgress(userId: string, lessonId: string, progressPercentage: number): Promise<LessonProgress | null> {
    const startTime = performance.now();
    const cacheKey = `lesson_progress:${userId}:${lessonId}`;

    try {
      const status = progressPercentage >= 100 ? 'completed' : 'in_progress';
      const updateData: any = {
        progress_percentage: progressPercentage,
        status,
        last_accessed: new Date().toISOString()
      };

      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('lesson_progress')
        .upsert({
          user_id: userId,
          lesson_id: lessonId,
          ...updateData,
          started_at: new Date().toISOString() // Will be ignored if record exists
        }, {
          onConflict: 'user_id,lesson_id',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) throw error;

      const responseTime = performance.now() - startTime;

      // Log performance metric
      incidentAnalysisService.logPerformance({
        metric: 'api_response',
        value: responseTime,
        component: 'lessonProgressService',
        metadata: {
          operation: 'updateProgress',
          userId,
          lessonId,
          progressPercentage,
          status
        }
      });
      
      // Update the cache with the new data
      if (data) {
        queryCache.set(cacheKey, data as LessonProgress, PROGRESS_CACHE_TTL);
        
        // Also invalidate any bulk queries that might include this lesson
        queryCache.clearByPrefix(`lesson_progress:${userId}:bulk:`);
      }

      return data as LessonProgress;
    } catch (error) {
      const responseTime = performance.now() - startTime;

      await incidentAnalysisService.logApiError('updateProgress', error, responseTime);
      console.error('Error updating lesson progress:', error);
      return null;
    }
  }

  /**
   * Complete a lesson
   */
  async completeLesson(userId: string, lessonId: string): Promise<LessonProgress | null> {
    return this.updateProgress(userId, lessonId, 100);
  }

  /**
   * Get user's progress for multiple lessons
   */
  async getUserProgress(userId: string, lessonIds?: string[]): Promise<LessonProgress[]> {
    const startTime = performance.now();

    try {
      let query = supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', userId);

      if (lessonIds && lessonIds.length > 0) {
        query = query.in('lesson_id', lessonIds);
      }

      const { data, error } = await query;

      if (error) throw error;

      const responseTime = performance.now() - startTime;

      // Log performance metric
      incidentAnalysisService.logPerformance({
        metric: 'api_response',
        value: responseTime,
        component: 'lessonProgressService',
        metadata: {
          operation: 'getUserProgress',
          userId,
          lessonCount: lessonIds?.length || 'all',
          resultCount: data?.length || 0
        }
      });

      return (data || []) as LessonProgress[];
    } catch (error) {
      const responseTime = performance.now() - startTime;

      await incidentAnalysisService.logApiError('getUserProgress', error, responseTime);
      console.error('Error getting user progress:', error);
      return [];
    }
  }

  /**
   * Get progress for a specific lesson
   */
  async getLessonProgress(userId: string, lessonId: string): Promise<LessonProgress | null> {
    try {
      const { data, error } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .maybeSingle();

      if (error) throw error;
      return data as LessonProgress | null;
    } catch (error) {
      console.error('Error getting lesson progress:', error);
      return null;
    }
  }

  /**
   * Reset lesson progress (for retaking lessons)
   */
  async resetLesson(userId: string, lessonId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('lesson_progress')
        .update({
          status: 'not_started',
          progress_percentage: 0,
          completed_at: null,
          last_accessed: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('lesson_id', lessonId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error resetting lesson:', error);
      return false;
    }
  }

  /**
   * Get user's overall progress statistics
   */
  async getUserStats(userId: string): Promise<{
    totalLessons: number;
    completedLessons: number;
    inProgressLessons: number;
    completionPercentage: number;
  }> {
    try {
      const [progressResult, totalResult] = await Promise.all([
        supabase
          .from('lesson_progress')
          .select('status')
          .eq('user_id', userId),
        supabase
          .from('simple_lessons')
          .select('id', { count: 'exact', head: true })
          .eq('is_published', true)
      ]);

      const progress = progressResult.data || [];
      const totalLessons = totalResult.count || 0;

      const completedLessons = progress.filter(p => p.status === 'completed').length;
      const inProgressLessons = progress.filter(p => p.status === 'in_progress').length;
      const completionPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      return {
        totalLessons,
        completedLessons,
        inProgressLessons,
        completionPercentage
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        totalLessons: 0,
        completedLessons: 0,
        inProgressLessons: 0,
        completionPercentage: 0
      };
    }
  }
}

export const lessonProgressService = new LessonProgressService();