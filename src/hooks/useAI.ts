import { useState, useEffect, useRef } from 'react';
import { aiService, type AIRequestOptions } from '@/services/aiService';
import { aiRecommendationService } from '@/services/aiRecommendationService';
import { aiTrackingService, type AIInteractionType } from '@/services/aiTrackingService';
import { aiLearningObserver } from '@/services/aiLearningObserver';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const useAI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Initialize AI learning observer when hook is first used
  useEffect(() => {
    aiLearningObserver.initializeAutoConnection();
  }, []);

  // Create a ref to track if the component is still mounted
  const isMountedRef = useRef(true);
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const executeAITask = async <T>(
    task: () => Promise<T>,
    interactionType: AIInteractionType,
    inputData?: any,
    successMessage?: string
  ): Promise<T | null> => {
    // Set loading state immediately
    setLoading(true);
    setError(null);
    
    const startTime = Date.now();
    
    try {
      // Execute the AI task first - this is where the AI generates content
      const result = await task();
      const processingTime = Date.now() - startTime;
      
      // Handle case where component is unmounted during the AI task
      if (!isMountedRef.current) {
        console.log('Component unmounted during AI task, aborting state updates');
        return result;
      }

      // Start a separate background task for recording the interaction
      // This allows the UI to update immediately with the result while tracking happens in the background
      if (user?.id && interactionType && result && (typeof result !== 'string' || result.trim().length > 0)) {
        // Use Promise.resolve().then to make this non-blocking
        Promise.resolve().then(async () => {
          try {
            await aiTrackingService.completeInteraction(
              `temp-${Date.now()}`, 
              result, 
              processingTime, 
              0, // tokens - would need to be calculated by AI service
              user.id,
              interactionType,
              inputData
            );
          } catch (trackingError) {
            console.warn('Failed to track AI interaction:', trackingError);
          }
        });
      } else if (!user?.id) {
        console.info('User not authenticated, skipping interaction tracking');
      }
      
      if (successMessage && result) {
        // Use requestAnimationFrame for better UI responsiveness
        window.requestAnimationFrame(() => {
          if (isMountedRef.current) {
            toast({
              title: "Success",
              description: successMessage,
            });
          }
        });
      }
      
      // Update loading state
      if (isMountedRef.current) {
        setLoading(false);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setError(errorMessage);
        toast({
          title: "AI Error",
          description: errorMessage,
          variant: "destructive",
        });
        setLoading(false);
      }
      
      return null;
    }
  };

  return {
    loading,
    error,
    executeAITask,
    
    // Education hooks
    generateLearningPath: async (skills: string[], interests: string[], level: string) => {
      const inputData = { skills, interests, level };
      
      // Start the AI request immediately
      const resultPromise = aiService.generateLearningPath(skills, interests, level);
      
      // Execute the task with the promise
      const result = await executeAITask(
        async () => await resultPromise,
        'learning_path_generation',
        inputData
      );
      
      // Save learning path and recommendation to database in the background
      if (result && user) {
        // Use a background promise to avoid blocking UI
        Promise.resolve().then(async () => {
          try {
            // Get the interaction ID from the most recent interaction
            const stats = await aiTrackingService.getUserStats(user.id);
            const recentInteraction = stats.recentStats?.[0];
            
            if (recentInteraction) {
              await aiTrackingService.saveLearningPath(user.id, recentInteraction.id, skills, interests, level, result);
            }
            
            // Run recommendation generation in the background
            await aiRecommendationService.generateLearningPathRecommendations(user.id, skills, interests, level);
          } catch (dbError) {
            console.warn('Failed to save learning path to database:', dbError);
          }
        });
      }
      
      return result;
    },
    
    createQuiz: async (content: string, difficulty?: string) => {
      const inputData = { content, difficulty };
      const result = await executeAITask(
        () => aiService.createQuizFromContent(content, difficulty || 'easy'),
        'quiz_creation',
        inputData
      );
      
      // Save quiz to database
      if (result && user) {
        try {
          const stats = await aiTrackingService.getUserStats(user.id);
          const recentInteraction = stats.recentStats?.[0];
          
          if (recentInteraction) {
            // Try to parse the quiz JSON
            let parsedQuiz;
            try {
              parsedQuiz = JSON.parse(result);
            } catch {
              parsedQuiz = { raw_response: result };
            }
            
            await aiTrackingService.saveQuiz(user.id, recentInteraction.id, content, difficulty || 'easy', parsedQuiz);
          }
        } catch (dbError) {
          console.warn('Failed to save quiz to database:', dbError);
        }
      }
      
      return result;
    },
    
    getHomeworkHelp: async (question: string, subject: string) => {
      const inputData = { question, subject };
      const result = await executeAITask(
        () => aiService.provideHomeworkHelp(question, subject),
        'homework_help',
        inputData
      );
      
      // Save homework session to database
      if (result && user) {
        try {
          const stats = await aiTrackingService.getUserStats(user.id);
          const recentInteraction = stats.recentStats?.[0];
          
          if (recentInteraction) {
            await aiTrackingService.saveHomeworkSession(user.id, recentInteraction.id, subject, question, result);
          }
        } catch (dbError) {
          console.warn('Failed to save homework session to database:', dbError);
        }
      }
      
      return result;
    },
    
    // Accessibility hooks
    generateAltText: (description: string) =>
      executeAITask(() => aiService.generateAltText(description), 'alt_text_generation', { description }),
    
    translateText: (text: string, language: string) =>
      executeAITask(() => aiService.translateText(text, language), 'text_translation', { text, language }),
    
    // Sustainability hooks
    getEcoAdvice: (location: string, lifestyle: string) =>
      executeAITask(() => aiService.getEcoActionAdvice(location, lifestyle), 'eco_advice', { location, lifestyle }),
    
    calculateImpact: (activities: string[]) =>
      executeAITask(() => aiService.calculateSustainabilityImpact(activities), 'sustainability_impact', { activities }),
    
    classifyWaste: (description: string) =>
      executeAITask(() => aiService.classifyWaste(description), 'waste_classification', { description }),
    
    // Community hooks
    matchMentorship: (mentor: any, mentee: any) =>
      executeAITask(() => aiService.matchMentorship(mentor, mentee), 'mentorship_matching', { mentor, mentee }),
    
    recommendOpportunities: (profile: any, opportunities: any[]) =>
      executeAITask(() => aiService.recommendOpportunities(profile, opportunities), 'opportunity_recommendation', { profile, opportunities }),
    
    evaluateIdea: (idea: string, category: string) =>
      executeAITask(() => aiService.evaluateIdea(idea, category), 'idea_evaluation', { idea, category }),
    
    // Content hooks
    summarizeContent: (content: string, maxLength?: number) =>
      executeAITask(() => aiService.summarizeContent(content, maxLength), 'content_summarization', { content, maxLength }),
    
    assistGrantProposal: (description: string, amount: string, category: string) =>
      executeAITask(() => aiService.assistGrantProposal(description, amount, category), 'grant_proposal_assistance', { description, amount, category }),
    
    analyzeSentiment: (text: string) =>
      executeAITask(() => aiService.analyzeSentiment(text), 'sentiment_analysis', { text }),
    
    // Test API connection
    testConnection: () =>
      executeAITask(() => aiService.testConnection(), 'sentiment_analysis', {}, 'API connection tested successfully!'),
    
    // Use DeepSeek Reasoner model for tasks requiring advanced reasoning
    useReasoningModel: (prompt: string, options: any = {}) =>
      executeAITask(() => aiService.getReasonedResponse(prompt, options), 'complex_problem_solving', options, 'Reasoning completed'),
    
    // Get user AI statistics
    getUserStats: async () => {
      if (!user) return null;
      return await aiTrackingService.getUserStats(user.id);
    },
    
    // Get user's learning paths
    getUserLearningPaths: async () => {
      if (!user) return [];
      return await aiTrackingService.getUserLearningPaths(user.id);
    },
    
    // Get user's quizzes
    getUserQuizzes: async () => {
      if (!user) return [];
      return await aiTrackingService.getUserQuizzes(user.id);
    },
    
    // Get user's homework sessions
    getUserHomeworkSessions: async () => {
      if (!user) return [];
      return await aiTrackingService.getUserHomeworkSessions(user.id);
    },

    // Track learning activities for AI observer
    trackQuizAttempt: async (subject: string, topic: string, score: number, difficulty: 'easy' | 'medium' | 'hard', timeSpent: number) => {
      if (!user) return;
      await aiLearningObserver.trackActivity({
        userId: user.id,
        activityType: 'quiz_attempt',
        subject,
        topic,
        score,
        timeSpent,
        difficulty
      });
    },

    trackLessonComplete: async (subject: string, topic: string, timeSpent: number, difficulty: 'easy' | 'medium' | 'hard') => {
      if (!user) return;
      await aiLearningObserver.trackActivity({
        userId: user.id,
        activityType: 'lesson_complete',
        subject,
        topic,
        timeSpent,
        difficulty
      });
    },

    trackLessonView: async (subject: string, topic: string, timeSpent: number) => {
      if (!user) return;
      await aiLearningObserver.trackActivity({
        userId: user.id,
        activityType: 'lesson_view',
        subject,
        topic,
        timeSpent
      });
    },

    // Get AI learning recommendations
    getLearningRecommendations: async () => {
      if (!user) return [];
      return await aiLearningObserver.generateRecommendations(user.id);
    },

    // Get learner profile
    getLearnerProfile: async () => {
      if (!user) return null;
      return await aiLearningObserver.getLearnerProfile(user.id);
    },
  };
};