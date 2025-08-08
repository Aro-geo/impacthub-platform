import { useState, useEffect } from 'react';
import { learningService, type LearningModule, type UserProgress } from '@/services/learningService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const useLearning = () => {
  const [loading, setLoading] = useState(false);
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const { user } = useAuth();

  // Load learning modules
  const loadModules = async (language = 'en') => {
    setLoading(true);
    try {
      const data = await learningService.getLearningModules(language);
      setModules(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load learning modules",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load user progress
  const loadUserProgress = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await learningService.getUserProgress(user.id);
      setUserProgress(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load progress",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Update progress for a module
  const updateProgress = async (moduleId: string, progress: number, isCompleted = false) => {
    if (!user) return;

    try {
      await learningService.updateUserProgress(user.id, moduleId, progress, isCompleted);
      await loadUserProgress(); // Refresh progress
      
      toast({
        title: "Progress Updated",
        description: isCompleted ? "Module completed!" : `Progress: ${progress}%`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive",
      });
    }
  };

  // Get progress for a specific module
  const getModuleProgress = (moduleId: string) => {
    return userProgress.find(p => p.module_id === moduleId);
  };

  // Calculate overall progress statistics
  const getProgressStats = () => {
    const totalModules = modules.length;
    const completedModules = userProgress.filter(p => p.is_completed).length;
    const totalProgress = userProgress.reduce((sum, p) => sum + (p.progress || 0), 0);
    const averageProgress = totalModules > 0 ? totalProgress / totalModules : 0;

    return {
      totalModules,
      completedModules,
      averageProgress: Math.round(averageProgress),
      completionRate: totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0
    };
  };

  // Load data on mount
  useEffect(() => {
    loadModules();
  }, []);

  useEffect(() => {
    if (user) {
      loadUserProgress();
    }
  }, [user]);

  return {
    loading,
    modules,
    userProgress,
    loadModules,
    loadUserProgress,
    updateProgress,
    getModuleProgress,
    getProgressStats,
  };
};