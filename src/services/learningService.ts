import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type LearningModule = Tables<'learning_modules'>;
export type UserProgress = Tables<'user_progress'>;
export type Quiz = Tables<'lesson_quizzes'>;
export type QuizAttempt = Tables<'lesson_quiz_attempts'>;

// Learning Modules
export const learningService = {
  // Get all learning modules
  async getLearningModules(language = 'en') {
    const { data, error } = await supabase
      .from('learning_modules')
      .select('*')
      .eq('language', language)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Get learning module by ID
  async getLearningModule(id: string) {
    const { data, error } = await supabase
      .from('learning_modules')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create new learning module
  async createLearningModule(module: TablesInsert<'learning_modules'>) {
    const { data, error } = await supabase
      .from('learning_modules')
      .insert(module)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update learning module
  async updateLearningModule(id: string, updates: TablesUpdate<'learning_modules'>) {
    const { data, error } = await supabase
      .from('learning_modules')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get user progress for all modules
  async getUserProgress(userId: string) {
    const { data, error } = await supabase
      .from('user_progress')
      .select(`
        *,
        learning_modules (
          id,
          title,
          description,
          category,
          level
        )
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  },

  // Update user progress
  async updateUserProgress(userId: string, moduleId: string, progress: number, isCompleted = false) {
    const { data, error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        module_id: moduleId,
        progress,
        is_completed: isCompleted,
        last_accessed: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get quizzes for a lesson
  async getLessonQuizzes(lessonId: string) {
    const { data, error } = await supabase
      .from('lesson_quizzes')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('order_index');

    if (error) throw error;
    return data;
  },

  // Create lesson quiz
  async createLessonQuiz(quiz: TablesInsert<'lesson_quizzes'>) {
    const { data, error } = await supabase
      .from('lesson_quizzes')
      .insert(quiz)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Submit quiz attempt
  async submitQuizAttempt(attempt: TablesInsert<'lesson_quiz_attempts'>) {
    const { data, error } = await supabase
      .from('lesson_quiz_attempts')
      .insert(attempt)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get user quiz attempts
  async getUserQuizAttempts(userId: string, quizId?: string) {
    let query = supabase
      .from('lesson_quiz_attempts')
      .select(`
        *,
        quiz:lesson_quizzes (
          id,
          question,
          correct_answer,
          lesson_id
        )
      `)
      .eq('user_id', userId);

    if (quizId) {
      query = query.eq('quiz_id', quizId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
};