import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useAI } from '@/hooks/useAI';
import { supabase } from '@/integrations/supabase/client';
import { lessonProgressService } from '@/services/lessonProgressService';
import MarkdownRenderer from '@/components/ui/markdown-renderer';
import AITutor from './AITutor';
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
  const { trackLessonComplete, trackLessonView } = useAI();
  const [lesson, setLesson] = useState<LessonContent | null>(null);
  const [progress, setProgress] = useState<LessonProgress | null>(null);
  const [subject, setSubject] = useState<string>('General');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [readingTime, setReadingTime] = useState(0);
  const [lessonQuizzes, setLessonQuizzes] = useState<any[]>([]);
  const [showQuizzes, setShowQuizzes] = useState(false);

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

      // Load lesson content with subject information
      const { data: lessonData, error: lessonError } = await supabase
        .from('simple_lessons')
        .select(`
          *,
          subjects (name)
        `)
        .eq('id', lessonId)
        .eq('is_published', true)
        .single();

      if (lessonError) throw lessonError;
      setLesson(lessonData);
      
      // Set subject from relation or default
      const subjectName = lessonData?.subjects?.name || 'General';
      setSubject(subjectName);

      // Load user progress if authenticated
      if (user) {
        const progressData = await lessonProgressService.getLessonProgress(user.id, lessonId);
        setProgress(progressData);
        setIsStarted(progressData?.status !== 'not_started');
      }

      // Load lesson-specific quizzes
      const { data: quizData, error: quizError } = await supabase
        .from('lesson_quizzes')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('order_index');

      if (!quizError && quizData) {
        setLessonQuizzes(quizData);
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

        // Track lesson view with AI learning observer
        try {
          const { data: lessonWithSubject } = await supabase
            .from('simple_lessons')
            .select(`
              subjects (name)
            `)
            .eq('id', lesson.id)
            .single();

          const subject = lessonWithSubject?.subjects?.name || 'Unknown';
          const topic = lesson.title;
          
          // Track the lesson view (will be updated with actual time when lesson is completed)
          await trackLessonView(subject, topic, 0);
        } catch (aiError) {
          console.error('Error tracking lesson view with AI:', aiError);
        }
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

        // Track lesson completion with AI learning observer
        try {
          // Get subject information from lesson
          const { data: lessonWithSubject } = await supabase
            .from('simple_lessons')
            .select(`
              subjects (name)
            `)
            .eq('id', lesson.id)
            .single();

          const subject = lessonWithSubject?.subjects?.name || 'Unknown';
          const topic = lesson.title;
          const timeSpent = Math.max(readingTime / 60, 1); // Convert to minutes, minimum 1 minute
          
          // Determine difficulty based on lesson difficulty level
          let difficulty: 'easy' | 'medium' | 'hard' = 'medium';
          if (lesson.difficulty_level === 'beginner') difficulty = 'easy';
          else if (lesson.difficulty_level === 'advanced') difficulty = 'hard';

          await trackLessonComplete(subject, topic, timeSpent, difficulty);
          
          // Show success toast notification
          // We can't import toast directly as it would create a circular dependency
          try {
            window.dispatchEvent(new CustomEvent('lessonCompleted', {
              detail: {
                lessonId: lesson.id,
                lessonTitle: lesson.title,
                unlockAllLessons: true
              }
            }));
          } catch (toastError) {
            console.error('Error showing completion toast:', toastError);
          }
        } catch (aiError) {
          console.error('Error tracking lesson completion with AI:', aiError);
        }

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
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-muted text-muted-foreground';
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
            <span className="text-foreground">Loading lesson...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !lesson) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="text-red-600 dark:text-red-400 mb-4">
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
            <Button onClick={onClose} variant="ghost" size="sm" className="w-full sm:w-auto">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Lessons
            </Button>
            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              {onPrevious && (
                <Button onClick={onPrevious} variant="outline" size="sm" className="flex-1 sm:flex-none">
                  <ArrowLeft className="w-4 h-4 sm:mr-0" />
                  <span className="ml-2 sm:hidden">Previous</span>
                </Button>
              )}
              {onNext && (
                <Button onClick={onNext} variant="outline" size="sm" className="flex-1 sm:flex-none">
                  <span className="mr-2 sm:hidden">Next</span>
                  <ArrowRight className="w-4 h-4 sm:ml-0" />
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
        <Card className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
          <CardContent className="p-6 text-center">
            <div className="space-y-4">
              <div className="text-4xl">🎉</div>
              <div>
                <h3 className="text-xl font-bold text-green-800 dark:text-green-300 mb-2">Lesson Completed!</h3>
                <p className="text-green-700 dark:text-green-200">
                  Congratulations! You've successfully completed this lesson.
                  All lessons are now unlocked for you to explore freely!
                </p>
              </div>
              <Button
                onClick={onClose}
                className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
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
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
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
          {/* Support both string and object format for lesson content with proper rendering */}
          {lesson.content && typeof lesson.content === 'object' && Array.isArray((lesson.content as any)?.examples) ? (
            <div className="space-y-8">
              {(lesson.content as any).examples.map((example: any, idx: number) => (
                <div key={idx} className="border-b pb-6 mb-6">
                  <h3 className="font-semibold text-lg mb-2">Example {idx + 1}</h3>
                  <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: example }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="prose prose-lg max-w-none">
              <MarkdownRenderer content={lesson.content ?? ''} />
            </div>
          )}
          
          {/* AI Tutor Button */}
          <div className="mt-8 pt-6 border-t">
            <div className="text-center space-y-3">
              <h4 className="text-lg font-semibold text-foreground">Need Help Understanding This Lesson?</h4>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Get personalized guidance from our AI Tutor! Ask questions about concepts, 
                get step-by-step explanations, and discover connections to real-world applications.
              </p>
              <AITutor
                lessonTitle={lesson.title}
                lessonContent={lesson.content || ''}
                subject={subject || 'General'}
                difficultyLevel={lesson.difficulty_level}
                lessonId={lesson.id}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lesson Quizzes */}

      {/* Navigation Footer */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-0 justify-between">
            <div>
              {onPrevious && (
                <Button onClick={onPrevious} variant="outline" className="w-full sm:w-auto">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous Lesson
                </Button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:space-x-2">
              {user && progress?.status !== 'completed' && isStarted && (
                <Button onClick={completeLesson} className="w-full sm:w-auto">
                  <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                  Complete Lesson
                </Button>
              )}

              {onNext && (
                <Button onClick={onNext} className="w-full sm:w-auto">
                  Next Lesson
                  <ArrowRight className="w-4 h-4 ml-2 flex-shrink-0" />
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