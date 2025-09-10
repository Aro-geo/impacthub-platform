import { supabase } from '@/integrations/supabase/client';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: any;
  points_reward: number;
  earned_at?: string;
}

export interface UserStreaks {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
  updated_at: string;
}

class AchievementsService {
  /**
   * Get user's earned achievements (calculated from user activity)
   */
  async getUserAchievements(userId: string): Promise<Achievement[]> {
    try {
      // Get user's activity data
      const [lessonStats, streaks, quizAttempts, communityPosts, aiInteractions] = await Promise.all([
        this.getLessonCompletionStats(userId),
        this.getUserStreaks(userId),
        this.getQuizStats(userId),
        this.getCommunityStats(userId),
        this.getAIStats(userId)
      ]);

      const achievements: Achievement[] = [];

      // Lesson completion achievements
      if (lessonStats.completed >= 1) {
        achievements.push({
          id: 'first_lesson',
          name: 'First Steps',
          description: 'Complete your first lesson',
          icon: '🎯',
          criteria: { lessons_completed: 1 },
          points_reward: 10,
          earned_at: lessonStats.firstCompleted || new Date().toISOString()
        });
      }

      if (lessonStats.completed >= 5) {
        achievements.push({
          id: 'getting_started',
          name: 'Getting Started',
          description: 'Complete 5 lessons',
          icon: '📚',
          criteria: { lessons_completed: 5 },
          points_reward: 50
        });
      }

      if (lessonStats.completed >= 10) {
        achievements.push({
          id: 'dedicated_learner',
          name: 'Dedicated Learner',
          description: 'Complete 10 lessons',
          icon: '🎓',
          criteria: { lessons_completed: 10 },
          points_reward: 100
        });
      }

      if (lessonStats.completed >= 25) {
        achievements.push({
          id: 'scholar',
          name: 'Scholar',
          description: 'Complete 25 lessons',
          icon: '📖',
          criteria: { lessons_completed: 25 },
          points_reward: 250
        });
      }

      // Streak achievements
      if (streaks && streaks.current_streak >= 3) {
        achievements.push({
          id: 'three_day_streak',
          name: 'On Fire!',
          description: 'Maintain a 3-day learning streak',
          icon: '🔥',
          criteria: { streak_days: 3 },
          points_reward: 30
        });
      }

      if (streaks && streaks.current_streak >= 7) {
        achievements.push({
          id: 'week_warrior',
          name: 'Week Warrior',
          description: 'Maintain a 7-day learning streak',
          icon: '⚡',
          criteria: { streak_days: 7 },
          points_reward: 70
        });
      }

      if (streaks && streaks.longest_streak >= 30) {
        achievements.push({
          id: 'monthly_master',
          name: 'Monthly Master',
          description: 'Maintain a 30-day learning streak',
          icon: '👑',
          criteria: { streak_days: 30 },
          points_reward: 300
        });
      }

      // Quiz achievements
      if (quizAttempts >= 5) {
        achievements.push({
          id: 'quiz_starter',
          name: 'Quiz Starter',
          description: 'Complete 5 quizzes',
          icon: '🧠',
          criteria: { quizzes_completed: 5 },
          points_reward: 50
        });
      }

      if (quizAttempts >= 20) {
        achievements.push({
          id: 'quiz_champion',
          name: 'Quiz Champion',
          description: 'Complete 20 quizzes',
          icon: '🏆',
          criteria: { quizzes_completed: 20 },
          points_reward: 200
        });
      }

      // Community achievements
      if (communityPosts >= 3) {
        achievements.push({
          id: 'community_helper',
          name: 'Community Helper',
          description: 'Make 3 community posts',
          icon: '👥',
          criteria: { community_posts: 3 },
          points_reward: 30
        });
      }

      // AI interaction achievements
      if (aiInteractions >= 5) {
        achievements.push({
          id: 'ai_explorer',
          name: 'AI Explorer',
          description: 'Use AI tools 5 times',
          icon: '🤖',
          criteria: { ai_interactions: 5 },
          points_reward: 50
        });
      }

      return achievements;
    } catch (error) {
      console.error('Error getting user achievements:', error);
      return [];
    }
  }

  /**
   * Get user's streak data from learning_streaks table
   */
  async getUserStreaks(userId: string): Promise<UserStreaks | null> {
    try {
      const { data, error } = await supabase
        .from('learning_streaks')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching user streaks:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserStreaks:', error);
      return null;
    }
  }

  /**
   * Update user streaks when lesson is completed
   */
  async updateUserStreaks(userId: string, lessonCompleted: boolean = false): Promise<void> {
    try {
      // The database trigger already handles streak updates in learning_streaks table
      // This is just a placeholder for any additional logic we might need
      console.log('Streaks updated via database trigger');
    } catch (error) {
      console.error('Error updating user streaks:', error);
    }
  }

  /**
   * Check and award achievements (simplified version using calculated achievements)
   */
  async checkAndAwardAchievements(userId: string): Promise<void> {
    try {
      // This method now just triggers recalculation of achievements
      // Since we're calculating them dynamically, no database updates needed
      console.log('Achievements checked and calculated dynamically');
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  }

  // Helper methods to get user stats

  private async getLessonCompletionStats(userId: string): Promise<{ completed: number; firstCompleted?: string }> {
    try {
      const { data } = await supabase
        .from('lesson_progress')
        .select('completed_at')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('completed_at', { ascending: true });

      return {
        completed: data?.length || 0,
        firstCompleted: data?.[0]?.completed_at
      };
    } catch (error) {
      console.error('Error getting lesson completion stats:', error);
      return { completed: 0 };
    }
  }

  private async getQuizStats(userId: string): Promise<number> {
    try {
      const { count } = await supabase
        .from('lesson_quiz_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      return count || 0;
    } catch (error) {
      console.error('Error getting quiz stats:', error);
      return 0;
    }
  }

  private async getCommunityStats(userId: string): Promise<number> {
    try {
      const { count } = await supabase
        .from('community_posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      return count || 0;
    } catch (error) {
      console.error('Error getting community stats:', error);
      return 0;
    }
  }

  private async getAIStats(userId: string): Promise<number> {
    try {
      const { count } = await supabase
        .from('ai_interactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'completed');

      return count || 0;
    } catch (error) {
      console.error('Error getting AI stats:', error);
      return 0;
    }
  }
}

export const achievementsService = new AchievementsService();
