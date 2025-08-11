import { supabase } from '@/integrations/supabase/client';

export type AIInteractionType = 
  | 'learning_path_generation'
  | 'quiz_creation'
  | 'homework_help'
  | 'alt_text_generation'
  | 'text_translation'
  | 'eco_advice'
  | 'sustainability_impact'
  | 'waste_classification'
  | 'mentorship_matching'
  | 'opportunity_recommendation'
  | 'idea_evaluation'
  | 'content_summarization'
  | 'grant_proposal_assistance'
  | 'sentiment_analysis';

export type AIInteractionStatus = 'initiated' | 'processing' | 'completed' | 'failed';

interface AIInteractionData {
  user_id: string;
  interaction_type: AIInteractionType;
  input_data?: any;
  output_data?: any;
  processing_time_ms?: number;
  tokens_used?: number;
  error_message?: string;
}

class AITrackingService {
  // Start tracking an AI interaction
  async startInteraction(userId: string, type: AIInteractionType, inputData?: any): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('ai_interactions')
        .insert({
          user_id: userId,
          interaction_type: type,
          status: 'initiated',
          input_data: inputData,
        })
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Failed to start AI interaction tracking:', error);
      // Return a dummy ID so the app doesn't break
      return 'tracking-failed';
    }
  }

  // Update interaction status to processing
  async markProcessing(interactionId: string): Promise<void> {
    if (interactionId === 'tracking-failed') return;

    try {
      await supabase
        .from('ai_interactions')
        .update({
          status: 'processing',
        })
        .eq('id', interactionId);
    } catch (error) {
      console.error('Failed to mark interaction as processing:', error);
    }
  }

  // Complete an AI interaction with success
  async completeInteraction(
    interactionId: string, 
    outputData?: any, 
    processingTimeMs?: number, 
    tokensUsed?: number
  ): Promise<void> {
    if (interactionId === 'tracking-failed') return;

    try {
      await supabase
        .from('ai_interactions')
        .update({
          status: 'completed',
          output_data: outputData,
          processing_time_ms: processingTimeMs,
          tokens_used: tokensUsed,
          completed_at: new Date().toISOString(),
        })
        .eq('id', interactionId);
    } catch (error) {
      console.error('Failed to complete AI interaction tracking:', error);
    }
  }

  // Mark an AI interaction as failed
  async failInteraction(interactionId: string, errorMessage: string): Promise<void> {
    if (interactionId === 'tracking-failed') return;

    try {
      await supabase
        .from('ai_interactions')
        .update({
          status: 'failed',
          error_message: errorMessage,
          completed_at: new Date().toISOString(),
        })
        .eq('id', interactionId);
    } catch (error) {
      console.error('Failed to mark AI interaction as failed:', error);
    }
  }

  // Save a learning path
  async saveLearningPath(
    userId: string, 
    interactionId: string, 
    skills: string[], 
    interests: string[], 
    level: string, 
    generatedPath: string
  ): Promise<void> {
    try {
      await supabase
        .from('ai_learning_paths')
        .insert({
          user_id: userId,
          interaction_id: interactionId,
          skills,
          interests,
          level,
          generated_path: generatedPath,
        });
    } catch (error) {
      console.error('Failed to save learning path:', error);
    }
  }

  // Save a quiz
  async saveQuiz(
    userId: string, 
    interactionId: string, 
    sourceContent: string, 
    difficulty: string, 
    questions: any
  ): Promise<void> {
    try {
      await supabase
        .from('ai_quizzes')
        .insert({
          user_id: userId,
          interaction_id: interactionId,
          source_content: sourceContent,
          difficulty,
          questions,
        });
    } catch (error) {
      console.error('Failed to save quiz:', error);
    }
  }

  // Save a homework session
  async saveHomeworkSession(
    userId: string, 
    interactionId: string, 
    subject: string, 
    question: string, 
    explanation: string
  ): Promise<void> {
    try {
      await supabase
        .from('ai_homework_sessions')
        .insert({
          user_id: userId,
          interaction_id: interactionId,
          subject,
          question,
          explanation,
        });
    } catch (error) {
      console.error('Failed to save homework session:', error);
    }
  }

  // Get user's AI usage statistics
  async getUserStats(userId: string): Promise<any> {
    try {
      // Get total interactions
      const { count: totalInteractions } = await supabase
        .from('ai_interactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Get successful interactions
      const { count: successfulInteractions } = await supabase
        .from('ai_interactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'completed');

      // Get recent usage stats
      const { data: recentStats } = await supabase
        .from('ai_usage_stats')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(30);

      // Get most used interaction types
      const { data: interactionTypes } = await supabase
        .from('ai_interactions')
        .select('interaction_type')
        .eq('user_id', userId)
        .eq('status', 'completed');

      const typeCount = interactionTypes?.reduce((acc, item) => {
        acc[item.interaction_type] = (acc[item.interaction_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      return {
        totalInteractions: totalInteractions || 0,
        successfulInteractions: successfulInteractions || 0,
        failedInteractions: (totalInteractions || 0) - (successfulInteractions || 0),
        recentStats: recentStats || [],
        mostUsedTypes: Object.entries(typeCount)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([type, count]) => ({ type, count })),
      };
    } catch (error) {
      console.error('Failed to get user AI stats:', error);
      return {
        totalInteractions: 0,
        successfulInteractions: 0,
        failedInteractions: 0,
        recentStats: [],
        mostUsedTypes: [],
      };
    }
  }

  // Get user's learning paths
  async getUserLearningPaths(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('ai_learning_paths')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get user learning paths:', error);
      return [];
    }
  }

  // Get user's quizzes
  async getUserQuizzes(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('ai_quizzes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get user quizzes:', error);
      return [];
    }
  }

  // Get user's homework sessions
  async getUserHomeworkSessions(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('ai_homework_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get user homework sessions:', error);
      return [];
    }
  }

  // Rate a homework session
  async rateHomeworkSession(sessionId: string, rating: number): Promise<void> {
    try {
      await supabase
        .from('ai_homework_sessions')
        .update({ rating })
        .eq('id', sessionId);
    } catch (error) {
      console.error('Failed to rate homework session:', error);
    }
  }
}

export const aiTrackingService = new AITrackingService();