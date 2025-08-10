import { useState } from 'react';
import { aiService } from '@/services/aiService';
import { aiRecommendationService } from '@/services/aiRecommendationService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const useAI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const executeAITask = async <T>(
    task: () => Promise<T>,
    successMessage?: string
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await task();
      if (successMessage) {
        toast({
          title: "Success",
          description: successMessage,
        });
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
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
      const result = await executeAITask(() => aiService.generateLearningPath(skills, interests, level));
      
      // Try to save recommendation to database if user is logged in, but don't fail if it doesn't work
      if (result && user) {
        try {
          await aiRecommendationService.generateLearningPathRecommendations(user.id, skills, interests, level);
        } catch (dbError) {
          console.warn('Failed to save recommendation to database:', dbError);
          // Don't throw error - the AI result is still valid
        }
      }
      
      return result;
    },
    
    createQuiz: async (content: string, difficulty?: string) => {
      const result = await executeAITask(() => aiService.createQuizFromContent(content, difficulty));
      
      // TODO: Save quiz to database if needed
      // This would require parsing the AI response and creating quiz entries
      
      return result;
    },
    
    getHomeworkHelp: (question: string, subject: string) =>
      executeAITask(() => aiService.provideHomeworkHelp(question, subject)),
    
    // Accessibility hooks
    generateAltText: (description: string) =>
      executeAITask(() => aiService.generateAltText(description)),
    
    translateText: (text: string, language: string) =>
      executeAITask(() => aiService.translateText(text, language)),
    
    // Sustainability hooks
    getEcoAdvice: (location: string, lifestyle: string) =>
      executeAITask(() => aiService.getEcoActionAdvice(location, lifestyle)),
    
    calculateImpact: (activities: string[]) =>
      executeAITask(() => aiService.calculateSustainabilityImpact(activities)),
    
    classifyWaste: (description: string) =>
      executeAITask(() => aiService.classifyWaste(description)),
    
    // Community hooks
    matchMentorship: (mentor: any, mentee: any) =>
      executeAITask(() => aiService.matchMentorship(mentor, mentee)),
    
    recommendOpportunities: (profile: any, opportunities: any[]) =>
      executeAITask(() => aiService.recommendOpportunities(profile, opportunities)),
    
    evaluateIdea: (idea: string, category: string) =>
      executeAITask(() => aiService.evaluateIdea(idea, category)),
    
    // Content hooks
    summarizeContent: (content: string, maxLength?: number) =>
      executeAITask(() => aiService.summarizeContent(content, maxLength)),
    
    assistGrantProposal: (description: string, amount: string, category: string) =>
      executeAITask(() => aiService.assistGrantProposal(description, amount, category)),
    
    analyzeSentiment: (text: string) =>
      executeAITask(() => aiService.analyzeSentiment(text)),
    
    // Test API connection
    testConnection: () =>
      executeAITask(() => aiService.testConnection(), 'API connection tested successfully!'),
  };
};