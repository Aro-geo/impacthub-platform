import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { lessonProgressService } from '@/services/lessonProgressService';
import { toast } from '@/hooks/use-toast';

// Debug utility that can be used anywhere in the app to diagnose lesson progress issues
export const useLessonUnlockStatus = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [unlockedStatus, setUnlockedStatus] = useState({
    allLessonsUnlocked: false,
    completedCount: 0,
    totalLessons: 0
  });

  const checkLessonUnlockStatus = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get all user's lesson progress
      const userProgress = await lessonProgressService.getUserProgress(user.id);
      
      // Filter for completed lessons
      const completed = userProgress.filter(p => p.status === 'completed');
      setCompletedLessons(completed.map(p => p.lesson_id));
      
      // Get total lessons count
      const { count } = await supabase
        .from('simple_lessons')
        .select('id', { count: 'exact', head: true });
      
      // Update unlock status
      setUnlockedStatus({
        allLessonsUnlocked: completed.length > 0,
        completedCount: completed.length,
        totalLessons: count || 0
      });
    } catch (error) {
      console.error('Error checking lesson unlock status:', error);
      toast({
        title: 'Error checking lesson status',
        description: 'Could not verify lesson unlock status.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      checkLessonUnlockStatus();
    }
  }, [user, checkLessonUnlockStatus]);

  const refreshStatus = useCallback(async () => {
    await checkLessonUnlockStatus();
  }, [checkLessonUnlockStatus]);

  return {
    loading,
    completedLessons,
    unlockedStatus,
    refreshStatus
  };
};

// Debug function to log lesson lock/unlock status
export const logLessonUnlockStatus = async (userId: string) => {
  try {
    // Get user progress
    const userProgress = await lessonProgressService.getUserProgress(userId);
    
    // Get completed lessons
    const completedLessons = userProgress.filter(p => p.status === 'completed');
    
    // Get all lessons
    const { data: allLessons } = await supabase
      .from('simple_lessons')
      .select('id, title, order_index')
      .order('order_index');
    
    console.log('===== LESSON UNLOCK STATUS =====');
    console.log(`User has ${completedLessons.length} completed lessons out of ${allLessons?.length || 0} total`);
    console.log(`Unlock status: ${completedLessons.length > 0 ? 'ALL LESSONS UNLOCKED' : 'FIRST LESSON ONLY UNLOCKED'}`);
    
    if (completedLessons.length > 0) {
      console.log('Completed lessons:');
      for (const lesson of completedLessons) {
        const lessonDetails = allLessons?.find(l => l.id === lesson.lesson_id);
        console.log(`- ${lessonDetails?.title || lesson.lesson_id} (completed at ${new Date(lesson.completed_at || '').toLocaleString()})`);
      }
    }
    
    console.log('===== END STATUS =====');
    
    return {
      allLessonsUnlocked: completedLessons.length > 0,
      completedCount: completedLessons.length,
      totalLessons: allLessons?.length || 0,
      completedLessons: completedLessons
    };
  } catch (error) {
    console.error('Error logging lesson unlock status:', error);
    return null;
  }
};
