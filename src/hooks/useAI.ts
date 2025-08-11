import { useState } from 'react';
import { aiService } from '@/services/aiService';
import { aiRecommendationService } from '@/services/aiRecommendationService';
import { aiTrackingService, type AIInteractionType } from '@/services/aiTrackingService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const useAI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const executeAITask = async <T>(
    task: () => Promise<T>,
    interactionType: AIInteractionType,
    inputData?: any,
    successMessage?: string
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);
    
    let interactionId: string | null = null;
    const startTime = Date.now();
    
    try {
      // Start tracking the interaction
      if (user) {
        interactionId = await aiTrackingService.startInteraction(user.id, interactionType, inputData);
        await aiTrackingService.markProcessing(interactionId);
      }
      
      const result = await task();
      const processingTime = Date.now() - startTime;
      
      // Complete the interaction tracking
      if (user && interactionId) {
        await aiTrackingService.completeInteraction(interactionId, result, processingTime);
      }
      
      if (successMessage) {
        toast({
          title: "Success",
          description: successMessage,
        });
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      
      // Mark interaction as failed
      if (user && interactionId) {
        await aiTrackingService.failInteraction(interactionId, errorMessage);
      }
      
      setError(errorMessage);
      toast({
        title: "AI Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    executeAITask,
    
    // Education hooks
    generateLearningPath: async (skills: string[], interests: string[], level: string) => {
      const inputData = { skills, interests, level };
      const result = await executeAITask(
        () => aiService.generateLearningPath(skills, interests, level),
        'learning_path_generation',
        inputData
      );
      
      // Save learning path and recommendation to database
      if (result && user) {
        try {
          // Get the interaction ID from the most recent interaction
          const stats = await aiTrackingService.getUserStats(user.id);
          const recentInteraction = stats.recentStats?.[0];
          
          if (recentInteraction) {
            await aiTrackingService.saveLearningPath(user.id, recentInteraction.id, skills, interests, level, result);
          }
          
          await aiRecommendationService.generateLearningPathRecommendations(user.id, skills, interests, level);
        } catch (dbError) {
          console.warn('Failed to save learning path to database:', dbError);
        }
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
  };
};