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

  // Initialize AI learning observer when hook is first used (with singleton protection)
  useEffect(() => {
    // Only initialize if not already done to prevent multiple connections
    const initializeOnce = async () => {
      try {
        await aiLearningObserver.initializeAutoConnection();
      } catch (error) {
        console.warn('AI Learning Observer already initialized');
      }
    };
    initializeOnce();
  }, []);

  // Create a ref to track if the component is still mounted
  const isMountedRef = useRef(true);
  
  // Throttling for getUserStats to prevent excessive calls
  const lastGetStatsCall = useRef<number>(0);
  const STATS_THROTTLE_MS = 1000; // 1 second throttle
  
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
    
    getAITutorResponse: async (
      userQuestion: string,
      lessonTitle: string,
      lessonContent: string,
      subject: string,
      difficultyLevel: string,
      conversationHistory: string
    ) => {
      const inputData = { 
        userQuestion, 
        lessonTitle, 
        lessonContent: lessonContent.substring(0, 500), 
        subject, 
        difficultyLevel,
        conversationHistory: conversationHistory.substring(0, 1000)
      };
      
      return await executeAITask(
        () => aiService.provideAITutorResponse(
          userQuestion,
          lessonTitle,
          lessonContent,
          subject,
          difficultyLevel,
          conversationHistory
        ),
        'ai_tutor',
        inputData
      );
    },
    
    // Advanced Reasoning with DeepSeek Reasoner Model
    solveComplexProblem: async (
      problemDescription: string,
      domain: string = 'general',
      context?: string
    ) => {
      const inputData = { problemDescription, domain, context };
      return await executeAITask(
        () => aiService.solveComplexProblem(problemDescription, domain, context),
        'complex_problem_solving',
        inputData
      );
    },

    // Mathematical Reasoning with DeepSeek Reasoner  
    provideMathematicalReasoning: async (
      problem: string,
      level: 'elementary' | 'middle' | 'high' | 'college' = 'middle'
    ) => {
      const inputData = { problem, level };
      return await executeAITask(
        () => aiService.provideMathematicalReasoning(problem, level),
        'mathematical_reasoning',
        inputData
      );
    },

    // Conversational Learning with DeepSeek Chat Model
    engageInConversationalLearning: async (
      topic: string,
      userMessage: string,
      learningLevel: string = 'intermediate',
      conversationHistory?: string
    ) => {
      const inputData = { topic, userMessage, learningLevel, conversationHistory };
      return await executeAITask(
        () => aiService.engageInConversationalLearning(topic, userMessage, learningLevel, conversationHistory),
        'ai_tutor',
        inputData
      );
    },

    // Creative Content Generation with DeepSeek Chat Model
    generateCreativeContent: async (
      contentType: string,
      topic: string,
      audience: string,
      requirements?: string
    ) => {
      const inputData = { contentType, topic, audience, requirements };
      return await executeAITask(
        () => aiService.generateCreativeContent(contentType, topic, audience, requirements),
        'content_summarization',
        inputData
      );
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
    
    // STREAMING METHODS - Enable real-time token-by-token output
    
    /**
     * Stream a general AI response with real-time token output
     */
    streamResponse: async (
      prompt: string,
      options: AIRequestOptions & { 
        onToken?: (token: string) => void;
        onComplete?: (response: string) => void;
        onError?: (error: Error) => void;
      } = {},
      taskType: string = 'general'
    ) => {
      setLoading(true);
      setError(null);
      
      try {
        await aiService.streamResponse(prompt, options, taskType);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to stream response';
        setError(errorMessage);
        console.error('Stream response error:', error);
      } finally {
        setLoading(false);
      }
    },

    /**
     * Stream a reasoned response using DeepSeek Reasoner model with real-time output
     */
    streamReasonedResponse: async (
      prompt: string,
      options: AIRequestOptions & {
        onToken?: (token: string) => void;
        onComplete?: (response: string) => void;
        onError?: (error: Error) => void;
      } = {}
    ) => {
      setLoading(true);
      setError(null);
      
      try {
        await aiService.streamReasonedResponse(prompt, options);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to stream reasoned response';
        setError(errorMessage);
        console.error('Stream reasoned response error:', error);
      } finally {
        setLoading(false);
      }
    },

    /**
     * Stream conversational learning with real-time output
     */
    streamConversationalLearning: async (
      topic: string,
      userMessage: string,
      learningLevel: string = 'intermediate',
      options: AIRequestOptions & {
        onToken?: (token: string) => void;
        onComplete?: (response: string) => void;
        onError?: (error: Error) => void;
      } = {}
    ) => {
      setLoading(true);
      setError(null);
      
      try {
        await aiService.streamConversationalLearning(topic, userMessage, learningLevel, options);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to stream conversational learning';
        setError(errorMessage);
        console.error('Stream conversational learning error:', error);
      } finally {
        setLoading(false);
      }
    },

    /**
     * Stream homework help with real-time output
     */
    streamHomeworkHelp: async (
      question: string,
      subject: string,
      options: AIRequestOptions & {
        onToken?: (token: string) => void;
        onComplete?: (response: string) => void;
        onError?: (error: Error) => void;
      } = {}
    ) => {
      setLoading(true);
      setError(null);
      
      try {
        await aiService.streamHomeworkHelp(question, subject, options);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to stream homework help';
        setError(errorMessage);
        console.error('Stream homework help error:', error);
      } finally {
        setLoading(false);
      }
    },

    /**
     * Stream AI Tutor response with real-time output
     */
    streamAITutorResponse: async (
      userQuestion: string,
      lessonTitle: string,
      lessonContent: string,
      subject: string,
      difficultyLevel: string,
      conversationHistory: string,
      options: AIRequestOptions & {
        onToken?: (token: string) => void;
        onComplete?: (response: string) => void;
        onError?: (error: Error) => void;
      } = {}
    ) => {
      setLoading(true);
      setError(null);
      
      try {
        await aiService.streamAITutorResponse(
          userQuestion,
          lessonTitle,
          lessonContent,
          subject,
          difficultyLevel,
          conversationHistory,
          options
        );
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to stream AI tutor response';
        setError(errorMessage);
        console.error('Stream AI tutor response error:', error);
      } finally {
        setLoading(false);
      }
    },

    /**
     * Stream quiz creation with real-time output
     */
    streamQuizFromContent: async (
      content: string,
      difficulty: string = 'easy',
      options: AIRequestOptions & {
        onToken?: (token: string) => void;
        onComplete?: (response: string) => void;
        onError?: (error: Error) => void;
      } = {}
    ) => {
      setLoading(true);
      setError(null);
      
      try {
        await aiService.streamQuizFromContent(content, difficulty, options);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to stream quiz creation';
        setError(errorMessage);
        console.error('Stream quiz creation error:', error);
      } finally {
        setLoading(false);
      }
    },

    /**
     * Stream learning path generation with real-time output
     */
    streamLearningPath: async (
      userSkills: string[],
      interests: string[],
      currentLevel: string,
      options: AIRequestOptions & {
        onToken?: (token: string) => void;
        onComplete?: (response: string) => void;
        onError?: (error: Error) => void;
      } = {}
    ) => {
      setLoading(true);
      setError(null);
      
      try {
        await aiService.streamLearningPath(userSkills, interests, currentLevel, options);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to stream learning path generation';
        setError(errorMessage);
        console.error('Stream learning path error:', error);
      } finally {
        setLoading(false);
      }
    },

    // Get user AI statistics (with throttling)
    getUserStats: async () => {
      if (!user) return null;
      
      // Throttle to prevent excessive calls
      const now = Date.now();
      if (now - lastGetStatsCall.current < STATS_THROTTLE_MS) {
        console.log('getUserStats throttled, skipping call');
        return null;
      }
      lastGetStatsCall.current = now;
      
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