import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { lessonProgressService } from '@/services/lessonProgressService';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Clock,
  CheckCircle,
  Play,
  RotateCcw
} from 'lucide-react';

interface LessonContent {
  id: string;
  title: string;
  description: string;
  content: string;
  duration_minutes?: number;
  difficulty_level: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress_percentage: number;
  started_at?: string;
  completed_at?: string;
  last_accessed: string;
}

interface LessonViewerProps {
  lessonId: string;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onLessonComplete?: () => void;
}

const LessonViewer: React.FC<LessonViewerProps> = ({
  lessonId,
  onClose,
  onNext,
  onPrevious,
  onLessonComplete
}) => {
  const { user } = useAuth();
  const [lesson, setLesson] = useState<LessonContent | null>(null);
  const [progress, setProgress] = useState<LessonProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [readingTime, setReadingTime] = useState(0);

  useEffect(() => {
    loadLesson();
  }, [lessonId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStarted && progress?.status === 'in_progress') {
      interval = setInterval(() => {
        setReadingTime(prev => prev + 1);
        updateProgress();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStarted, progress?.status]);

  const loadLesson = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load lesson content
      const { data: lessonData, error: lessonError } = await supabase
        .from('simple_lessons')
        .select('*')
        .eq('id', lessonId)
        .eq('is_published', true)
        .single();

      if (lessonError) throw lessonError;
      setLesson(lessonData);

      // Load user progress if authenticated
      if (user) {
        const progressData = await lessonProgressService.getLessonProgress(user.id, lessonId);
        setProgress(progressData);
        setIsStarted(progressData?.status !== 'not_started');
      }
    } catch (err) {
      console.error('Error loading lesson:', err);
      setError('Failed to load lesson. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startLesson = async () => {
    if (!user || !lesson) return;

    try {
      const progressData = await lessonProgressService.startLesson(user.id, lesson.id);
      if (progressData) {
        setProgress(progressData);
        setIsStarted(true);
        setReadingTime(0);
      }
    } catch (err) {
      console.error('Error starting lesson:', err);
    }
  };

  const updateProgress = async () => {
    if (!user || !lesson || !isStarted) return;

    // Calculate progress based on reading time and estimated duration
    const estimatedDuration = lesson.duration_minutes ? lesson.duration_minutes * 60 : 300; // Default 5 minutes
    const progressPercentage = Math.min(Math.round((readingTime / estimatedDuration) * 100), 95);

    try {
      const progressData = await lessonProgressService.updateProgress(
        user.id,
        lesson.id,
        progressPercentage
      );
      if (progressData) {
        setProgress(progressData);
      }
    } catch (err) {
      console.error('Error updating progress:', err);
    }
  };

  const completeLesson = async () => {
    if (!user || !lesson) return;

    try {
      const progressData = await lessonProgressService.completeLesson(user.id, lesson.id);
      if (progressData) {
        setProgress(progressData);
        setIsStarted(false);

        // Notify parent component that lesson is completed to refresh lessons list
        if (onLessonComplete) {
          onLessonComplete();
        }
      }
    } catch (err) {
      console.error('Error completing lesson:', err);
    }
  };

  const resetLesson = async () => {
    if (!user || !lesson) return;

    try {
      const success = await lessonProgressService.resetLesson(user.id, lesson.id);
      if (success) {
        setProgress(null);
        setIsStarted(false);
        setReadingTime(0);
        // Reload progress
        loadLesson();
      }
    } catch (err) {
      console.error('Error resetting lesson:', err);
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center p-8">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span>Loading lesson...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !lesson) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="text-red-600 mb-4">
            {error || 'Lesson not found'}
          </div>
          <Button onClick={onClose} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Lessons
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button onClick={onClose} variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Lessons
            </Button>
            <div className="flex items-center space-x-2">
              {onPrevious && (
                <Button onClick={onPrevious} variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              {onNext && (
                <Button onClick={onNext} variant="outline" size="sm">
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">{lesson.title}</CardTitle>
              <Badge className={getDifficultyColor(lesson.difficulty_level)}>
                {lesson.difficulty_level}
              </Badge>
            </div>

            <p className="text-muted-foreground">{lesson.description}</p>

            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{lesson.duration_minutes || 5} min read</span>
              </div>
              <div className="flex items-center space-x-1">
                <BookOpen className="w-4 h-4" />
                <span>Lesson</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Completion Celebration */}
      {progress?.status === 'completed' && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6 text-center">
            <div className="space-y-4">
              <div className="text-4xl">🎉</div>
              <div>
                <h3 className="text-xl font-bold text-green-800 mb-2">Lesson Completed!</h3>
                <p className="text-green-700">
                  Congratulations! You've successfully completed this lesson.
                  All lessons are now unlocked for you to explore freely!
                </p>
              </div>
              <Button
                onClick={onClose}
                className="bg-green-600 hover:bg-green-700"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Explore More Lessons
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Card */}
      {user && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Your Progress</h3>
              <div className="flex items-center space-x-2">
                {progress?.status === 'completed' && (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Completed
                  </Badge>
                )}
                {isStarted && progress?.status === 'in_progress' && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Reading: {formatTime(readingTime)}</span>
                  </div>
                )}
              </div>
            </div>

            {progress && (
              <div className="space-y-2">
                <Progress value={progress.progress_percentage} className="w-full" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{progress.progress_percentage}% complete</span>
                  {progress.started_at && (
                    <span>Started {new Date(progress.started_at).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2 mt-4">
              {!isStarted && progress?.status !== 'completed' && (
                <Button onClick={startLesson}>
                  <Play className="w-4 h-4 mr-2" />
                  Start Lesson
                </Button>
              )}

              {isStarted && progress?.status === 'in_progress' && (
                <Button onClick={completeLesson}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark Complete
                </Button>
              )}

              {progress?.status === 'completed' && (
                <Button onClick={resetLesson} variant="outline">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retake Lesson
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lesson Content */}
      <Card>
        <CardContent className="p-8">
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: lesson.content }}
          />
        </CardContent>
      </Card>

      {/* Navigation Footer */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              {onPrevious && (
                <Button onClick={onPrevious} variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous Lesson
                </Button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {user && progress?.status !== 'completed' && isStarted && (
                <Button onClick={completeLesson}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete Lesson
                </Button>
              )}

              {onNext && (
                <Button onClick={onNext}>
                  Next Lesson
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LessonViewer;