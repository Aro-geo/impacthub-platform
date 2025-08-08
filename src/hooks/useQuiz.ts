import { useState } from 'react';
import { learningService, type Quiz, type QuizAttempt } from '@/services/learningService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const useQuiz = () => {
  const [loading, setLoading] = useState(false);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const { user } = useAuth();

  // Load quizzes for a module
  const loadModuleQuizzes = async (moduleId: string) => {
    setLoading(true);
    try {
      const data = await learningService.getModuleQuizzes(moduleId);
      setQuizzes(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load quizzes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Submit quiz attempt
  const submitQuizAttempt = async (quizId: string, selectedAnswer: string, isCorrect: boolean) => {
    if (!user) return;

    try {
      const attempt = await learningService.submitQuizAttempt({
        quiz_id: quizId,
        user_id: user.id,
        selected_answer: selectedAnswer,
        is_correct: isCorrect,
        attempted_at: new Date().toISOString()
      });

      toast({
        title: isCorrect ? "Correct!" : "Incorrect",
        description: isCorrect ? "Great job!" : "Keep trying!",
        variant: isCorrect ? "default" : "destructive",
      });

      return attempt;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit answer",
        variant: "destructive",
      });
    }
  };

  // Load user quiz attempts
  const loadUserAttempts = async (quizId?: string) => {
    if (!user) return;

    setLoading(true);
    try {
      const data = await learningService.getUserQuizAttempts(user.id, quizId);
      setAttempts(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load quiz attempts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create a new quiz
  const createQuiz = async (moduleId: string, question: string, options: string[], correctAnswer: string) => {
    try {
      const quiz = await learningService.createQuiz({
        module_id: moduleId,
        question,
        options,
        correct_answer: correctAnswer
      });

      toast({
        title: "Success",
        description: "Quiz created successfully",
      });

      return quiz;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create quiz",
        variant: "destructive",
      });
    }
  };

  // Calculate quiz statistics
  const getQuizStats = (quizId: string) => {
    const quizAttempts = attempts.filter(a => a.quiz_id === quizId);
    const correctAttempts = quizAttempts.filter(a => a.is_correct);
    
    return {
      totalAttempts: quizAttempts.length,
      correctAttempts: correctAttempts.length,
      accuracy: quizAttempts.length > 0 ? Math.round((correctAttempts.length / quizAttempts.length) * 100) : 0,
      lastAttempt: quizAttempts.sort((a, b) => 
        new Date(b.attempted_at || '').getTime() - new Date(a.attempted_at || '').getTime()
      )[0]
    };
  };

  return {
    loading,
    quizzes,
    attempts,
    loadModuleQuizzes,
    submitQuizAttempt,
    loadUserAttempts,
    createQuiz,
    getQuizStats,
  };
};