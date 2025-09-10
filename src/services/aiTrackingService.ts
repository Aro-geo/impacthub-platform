import { supabase } from '@/integrations/supabase/client';
import { queryCache } from '@/utils/dbOptimization';

export type AIInteractionType = 
  | 'learning_path_generation'
  | 'quiz_creation'
  | 'homework_help'
  | 'ai_tutor'
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
  | 'sentiment_analysis'
  | 'complex_problem_solving'
  | 'critical_thinking'
  | 'mathematical_reasoning'
  | 'scientific_analysis'
  | 'logical_deduction';

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
  // Batch processing queue for interaction storage
  private interactionQueue: {
    userId: string;
    interactionType: AIInteractionType;
    outputData: any;
    processingTimeMs?: number;
    tokensUsed?: number;
    inputData?: any;
    timestamp: number;
  }[] = [];
  
  // Flag to track if queue processing is scheduled
  private isProcessingQueue = false;
  
  // Process validation cache to avoid repeated checks
  private validatedUserIds = new Set<string>();
  private invalidUserIds = new Set<string>();
  
  // Query cache to prevent duplicate requests
  private statsCache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 30000; // 30 seconds cache

  // Start tracking an AI interaction - only when processing begins
  async startInteraction(userId: string, type: AIInteractionType, inputData?: any): Promise<string> {
    // Don't create database record yet, just return a temporary ID
    // We'll only create the record when there's actual output
    return `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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

  // Complete an AI interaction with success - only record if there's output
  async completeInteraction(
    interactionId: string, 
    outputData?: any, 
    processingTimeMs?: number, 
    tokensUsed?: number,
    userId?: string,
    interactionType?: AIInteractionType,
    inputData?: any
  ): Promise<void> {
    if (interactionId === 'tracking-failed') return;

    // Only record interaction if there's actual output generated
    if (!outputData || (typeof outputData === 'string' && outputData.trim().length === 0)) {
      console.log('No output generated, skipping interaction recording');
      return;
    }

    // If this is a temporary ID and we have userId and interactionType, add to batch queue
    if (interactionId.startsWith('temp-') && userId && interactionType) {
      // Add to queue instead of immediate database write
      this.interactionQueue.push({
        userId,
        interactionType,
        outputData,
        processingTimeMs,
        tokensUsed,
        inputData,
        timestamp: Date.now()
      });
      
      // Process queue in background if not already scheduled
      if (!this.isProcessingQueue) {
        this.scheduleQueueProcessing();
      }
      return;
    }

    // For existing interactions that need immediate update (less common case)
    try {
      if (!interactionId.startsWith('temp-')) {
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
      }
      
      // Clear cache for this user when new interaction is completed
      if (userId) {
        this.clearUserStatsCache(userId);
      }
    } catch (error) {
      console.error('Failed to complete AI interaction tracking:', error);
    }
  }
  
  // Clear stats cache for a specific user
  private clearUserStatsCache(userId: string): void {
    const cacheKey = `stats_${userId}`;
    this.statsCache.delete(cacheKey);
  }
  
  // Schedule background processing of the interaction queue
  private scheduleQueueProcessing(): void {
    this.isProcessingQueue = true;
    
    // Use setTimeout to process in the background
    setTimeout(() => this.processInteractionQueue(), 2000);
  }
  
  // Process the queued interactions in batch
  private async processInteractionQueue(): Promise<void> {
    if (this.interactionQueue.length === 0) {
      this.isProcessingQueue = false;
      return;
    }
    
    // Take a batch of items to process (up to 10)
    const batchSize = Math.min(10, this.interactionQueue.length);
    const batch = this.interactionQueue.splice(0, batchSize);
    
    try {
      // Filter out interactions with invalid users to avoid DB errors
      const validInteractions = await this.filterValidInteractions(batch);
      
      if (validInteractions.length > 0) {
        // Insert all valid interactions in one batch operation
        await supabase
          .from('ai_interactions')
          .insert(validInteractions.map(item => ({
            user_id: item.userId,
            interaction_type: item.interactionType,
            status: 'completed',
            input_data: item.inputData,
            output_data: item.outputData,
            processing_time_ms: item.processingTimeMs,
            tokens_used: item.tokensUsed,
            completed_at: new Date().toISOString(),
          })));
        
        // Clear cache for users whose interactions were processed
        const processedUserIds = new Set(validInteractions.map(item => item.userId));
        processedUserIds.forEach(userId => this.clearUserStatsCache(userId));
      }
    } catch (error) {
      console.error('Failed to process AI interaction batch:', error);
    }
    
    // If there are more items in the queue, continue processing
    if (this.interactionQueue.length > 0) {
      setTimeout(() => this.processInteractionQueue(), 2000);
    } else {
      this.isProcessingQueue = false;
    }
  }
  
  // Filter interactions to only include those with valid users
  private async filterValidInteractions(
    interactions: {
      userId: string;
      interactionType: AIInteractionType;
      outputData: any;
      processingTimeMs?: number;
      tokensUsed?: number;
      inputData?: any;
      timestamp: number;
    }[]
  ) {
    // First filter based on cache
    const needsValidation = interactions.filter(item => 
      !this.validatedUserIds.has(item.userId) && 
      !this.invalidUserIds.has(item.userId)
    );
    
    // Get unique user IDs to validate
    const uniqueUserIds = [...new Set(needsValidation.map(item => item.userId))];
    
    if (uniqueUserIds.length > 0) {
      try {
        // Validate all unique user IDs in a single query
        const { data: validUsers, error } = await supabase
          .from('users')
          .select('id')
          .in('id', uniqueUserIds);
          
        if (!error && validUsers) {
          // Update our caches
          const validUserIdSet = new Set(validUsers.map(u => u.id));
          
          validUsers.forEach(user => this.validatedUserIds.add(user.id));
          
          uniqueUserIds
            .filter(id => !validUserIdSet.has(id))
            .forEach(id => this.invalidUserIds.add(id));
        }
      } catch (error) {
        console.error('Error validating users:', error);
      }
    }
    
    // Return only interactions with validated user IDs
    return interactions.filter(item => 
      this.validatedUserIds.has(item.userId) || 
      !this.invalidUserIds.has(item.userId)
    );
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
    // Check cache first
    const cacheKey = `stats_${userId}`;
    const cached = this.statsCache.get(cacheKey);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      // Combine queries to reduce database load
      const [
        totalInteractionsResult,
        successfulInteractionsResult,
        recentStatsResult,
        interactionTypesResult
      ] = await Promise.all([
        supabase
          .from('ai_interactions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId),
        supabase
          .from('ai_interactions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('status', 'completed'),
        supabase
          .from('ai_usage_stats')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false })
          .limit(30),
        supabase
          .from('ai_interactions')
          .select('interaction_type')
          .eq('user_id', userId)
          .eq('status', 'completed')
      ]);

      const typeCount = interactionTypesResult.data?.reduce((acc, item) => {
        acc[item.interaction_type] = (acc[item.interaction_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const result = {
        totalInteractions: totalInteractionsResult.count || 0,
        successfulInteractions: successfulInteractionsResult.count || 0,
        failedInteractions: (totalInteractionsResult.count || 0) - (successfulInteractionsResult.count || 0),
        recentStats: recentStatsResult.data || [],
        mostUsedTypes: Object.entries(typeCount)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([type, count]) => ({ type, count })),
      };

      // Cache the result
      this.statsCache.set(cacheKey, { data: result, timestamp: now });
      return result;
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