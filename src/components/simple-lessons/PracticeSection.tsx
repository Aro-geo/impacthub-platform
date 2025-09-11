import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import QuizInterface from './QuizInterface';
import { 
  Target, 
  Trophy, 
  RotateCcw, 
  Clock, 
  CheckCircle, 
  XCircle,
  Play,
  Star,
  TrendingUp,
  Award,
  Zap
} from 'lucide-react';

interface Subject {
  id: string;
  name: string;
  color: string;
}

interface LessonQuiz {
  lessonId: string;
  lessonTitle: string;
  lessonOrder: number;
  subject: Subject;
  quizzes: {
    id: string;
    question: string;
    options: string[];
    correct_answer: number;
    explanation: string;
    order_index: number;
  }[];
  isCompleted?: boolean;
  isUnlocked?: boolean;
}

interface QuizAttempt {
  id: string;
  quiz_id: string;
  selected_answer: number;
  is_correct: boolean;
  attempted_at: string;
}

interface QuizStats {
  totalAttempts: number;
  correctAnswers: number;
  averageScore: number;
  bestStreak: number;
}

const PracticeSection = () => {
  const { user, userProfile, isAdmin } = useAuth();
  const [quizzes, setQuizzes] = useState<LessonQuiz[]>([]);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [quizStats, setQuizStats] = useState<QuizStats>({
    totalAttempts: 0,
    correctAnswers: 0,
    averageScore: 0,
    bestStreak: 0
  });
  const [recentAttempts, setRecentAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [practiceMode, setPracticeMode] = useState<'review' | 'timed' | 'random'>('review');
  const [showQuizInterface, setShowQuizInterface] = useState(false);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, selectedSubject]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchSubjects(),
        fetchQuizzes(),
        fetchQuizStats(),
        fetchRecentAttempts()
      ]);
    } catch (error) {
      console.error('Error fetching practice data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('name');

    if (error) throw error;
    setSubjects(data || []);
  };

  const fetchQuizzes = async () => {

    let query = supabase
      .from('simple_lessons')
      .select(`
        id,
        title,
        order_index,
        grade,
        subjects!inner (
          id,
          name,
          color
        ),
        lesson_quizzes (
          id,
          question,
          options,
          correct_answer,
          explanation,
          order_index
        )
      `)
      .eq('is_published', true)
      .not('lesson_quizzes', 'is', null)
      .order('order_index');

    if (selectedSubject !== 'all') {
      query = query.eq('subject_id', selectedSubject);
    }

    // Filter by user grade for non-admin users only
    if (userProfile?.grade && !isAdmin) {
      query = query.eq('grade', userProfile.grade);
    }

    const { data, error } = await query;
    if (error) throw error;

    const lessonQuizzes = data?.map(lesson => ({
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      lessonOrder: lesson.order_index,
      subject: lesson.subjects,
      quizzes: lesson.lesson_quizzes?.map(quiz => ({
        ...quiz,
        correct_answer: typeof quiz.correct_answer === 'string' 
          ? parseInt(quiz.correct_answer, 10) 
          : quiz.correct_answer,
        options: Array.isArray(quiz.options) ? quiz.options : typeof quiz.options === 'string' ? JSON.parse(quiz.options) : []
      })) || []
    })).filter(lesson => lesson.quizzes.length > 0) || [];

    setQuizzes(lessonQuizzes);
  };

  const fetchQuizStats = async () => {
    if (!user) return;

    // Get user's grade-appropriate lesson IDs first
    let lessonIds: string[] = [];
    if (userProfile?.grade && !isAdmin) {
      const { data: lessons } = await supabase
        .from('simple_lessons')
        .select('id')
        .eq('grade', userProfile.grade)
        .eq('is_published', true);
      lessonIds = lessons?.map(l => l.id) || [];
    }

    let attemptsQuery = supabase
      .from('lesson_quiz_attempts')
      .select(`
        *,
        lesson_quizzes!inner (
          lesson_id
        )
      `)
      .eq('user_id', user.id);

    // Filter by grade-appropriate lessons for non-admin users
    if (lessonIds.length > 0) {
      attemptsQuery = attemptsQuery.in('lesson_quizzes.lesson_id', lessonIds);
    }

    const { data: attempts, error } = await attemptsQuery;
    if (error) throw error;

    const totalAttempts = attempts?.length || 0;
    const correctAnswers = attempts?.filter(a => a.is_correct).length || 0;
    const averageScore = totalAttempts > 0 ? Math.round((correctAnswers / totalAttempts) * 100) : 0;

    // Track completed lessons (lessons where user has attempted all quizzes)
    const lessonAttempts = new Map<string, boolean>();
    attempts?.forEach(attempt => {
      const lessonId = attempt.lesson_quizzes?.lesson_id;
      if (lessonId && attempt.is_correct) {
        lessonAttempts.set(lessonId, true);
      }
    });
    
    setCompletedLessons(new Set(lessonAttempts.keys()));

    let currentStreak = 0;
    let bestStreak = 0;
    const sortedAttempts = attempts?.sort((a, b) => 
      new Date(a.attempted_at).getTime() - new Date(b.attempted_at).getTime()
    ) || [];

    for (const attempt of sortedAttempts) {
      if (attempt.is_correct) {
        currentStreak++;
        bestStreak = Math.max(bestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    setQuizStats({
      totalAttempts,
      correctAnswers,
      averageScore,
      bestStreak
    });
  };

  const fetchRecentAttempts = async () => {
    if (!user) return;

    // Get user's grade-appropriate lesson IDs first
    let lessonIds: string[] = [];
    if (userProfile?.grade && !isAdmin) {
      const { data: lessons } = await supabase
        .from('simple_lessons')
        .select('id')
        .eq('grade', userProfile.grade)
        .eq('is_published', true);
      lessonIds = lessons?.map(l => l.id) || [];
    }

    let attemptsQuery = supabase
      .from('lesson_quiz_attempts')
      .select(`
        *,
        lesson_quizzes!inner (
          id,
          question,
          lesson_id,
          simple_lessons (
            id,
            title,
            subjects (
              id,
              name,
              color
            )
          )
        )
      `)
      .eq('user_id', user.id)
      .order('attempted_at', { ascending: false })
      .limit(5);

    // Filter by grade-appropriate lessons for non-admin users
    if (lessonIds.length > 0) {
      attemptsQuery = attemptsQuery.in('lesson_quizzes.lesson_id', lessonIds);
    }

    const { data, error } = await attemptsQuery;
    if (error) throw error;

    const formattedAttempts = data?.map(attempt => ({
      ...attempt,
      quiz: {
        ...attempt.lesson_quizzes,
        lesson: attempt.lesson_quizzes?.simple_lessons ? {
          id: attempt.lesson_quizzes.simple_lessons.id,
          title: attempt.lesson_quizzes.simple_lessons.title,
          subject: attempt.lesson_quizzes.simple_lessons.subjects
        } : null
      }
    })).filter(attempt => attempt.quiz.lesson) || [];

    setRecentAttempts(formattedAttempts);
  };

  const retryQuiz = async (quizId: string) => {
    // Find the quiz and set up practice session for that specific quiz
    const quiz = recentAttempts.find(attempt => attempt.quiz_id === quizId);
    if (quiz) {
      setSelectedSubject(quiz.quiz.lesson.subject.id);
      setPracticeMode('review');
      setShowQuizInterface(true);
    }
  };

  const startPracticeSession = async () => {
    setShowQuizInterface(true);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
    return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Show quiz interface if practice session is started
  if (showQuizInterface) {
    return (
      <QuizInterface
        practiceMode={practiceMode}
        selectedSubject={selectedSubject}
        selectedLessonId={(window as any).selectedLessonId}
        onClose={() => {
          setShowQuizInterface(false);
          (window as any).selectedLessonId = undefined;
          // Refresh data when returning from quiz
          fetchData();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Practice & Quizzes</h2>
          <p className="text-muted-foreground">Test your knowledge and improve your skills</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">
              {quizStats.totalAttempts}
            </div>
            <div className="text-sm text-muted-foreground">Total Attempts</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">
              {quizStats.correctAnswers}
            </div>
            <div className="text-sm text-muted-foreground">Correct Answers</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className={`text-2xl font-bold mb-1 ${getScoreColor(quizStats.averageScore)}`}>
              {quizStats.averageScore}%
            </div>
            <div className="text-sm text-muted-foreground">Average Score</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Zap className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">
              {quizStats.bestStreak}
            </div>
            <div className="text-sm text-muted-foreground">Best Streak</div>
          </CardContent>
        </Card>
      </div>

      {/* Practice Modes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Start Practice Session */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Play className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span>Start Practice Session</span>
            </CardTitle>
            <CardDescription>
              Choose your practice mode and subject to start taking quizzes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Practice Mode
              </label>
              <Select value={practiceMode} onValueChange={(value: any) => setPracticeMode(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="review">
                    <div className="flex flex-col">
                      <span>Review Mode</span>
                      <span className="text-xs text-muted-foreground">Take your time, see explanations</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="timed">
                    <div className="flex flex-col">
                      <span>Timed Practice</span>
                      <span className="text-xs text-muted-foreground">10 questions in 10 minutes</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="random">
                    <div className="flex flex-col">
                      <span>Random Questions</span>
                      <span className="text-xs text-muted-foreground">Mixed questions from all topics</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Subject
              </label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map(subject => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Lesson Quiz
              </label>
              <Select value={(window as any).selectedLessonId || 'all-lessons'} onValueChange={(value) => {
                (window as any).selectedLessonId = value === 'all-lessons' ? undefined : value;
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select specific lesson (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-lessons">All Lessons</SelectItem>
                  {quizzes
                    .filter(lessonQuiz => selectedSubject === 'all' || lessonQuiz.subject.id === selectedSubject)
                    .map((lessonQuiz, index) => {
                      const isCompleted = completedLessons.has(lessonQuiz.lessonId);
                      const isUnlocked = index === 0 || completedLessons.has(quizzes[index - 1]?.lessonId);
                      
                      return (
                        <SelectItem 
                          key={lessonQuiz.lessonId} 
                          value={lessonQuiz.lessonId}
                          disabled={!isUnlocked}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>{lessonQuiz.lessonTitle}</span>
                            <div className="flex items-center space-x-1 ml-2">
                              {isCompleted && <span className="text-green-600">✓</span>}
                              {!isUnlocked && <span className="text-muted-foreground">🔒</span>}
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                </SelectContent>
              </Select>
            </div>

            <Button 
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={() => {
                setPracticeMode('review');
                setShowQuizInterface(true);
              }}
              disabled={quizzes.length === 0}
            >
              <Play className="mr-2 h-4 w-4" />
              Start Practice Session
            </Button>

            <div className="text-sm text-muted-foreground text-center">
              {quizzes.length > 0 ? (
                <span className="text-green-600 dark:text-green-400 font-medium">
                  {quizzes.length} lesson quizzes available
                </span>
              ) : (
                <span className="text-muted-foreground">
                  No lesson quizzes available
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Quiz Attempts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span>Recent Attempts</span>
            </CardTitle>
            <CardDescription>
              Your latest quiz performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentAttempts.length > 0 ? (
              <div className="space-y-3">
                {recentAttempts.map((attempt) => (
                  <div key={attempt.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground text-sm mb-1">
                        {attempt.quiz.lesson.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        {attempt.quiz.lesson.subject.name}
                      </p>
                      <div className="flex items-center space-x-2">
                        {attempt.is_correct ? (
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        )}
                        <span className="text-xs text-muted-foreground">
                          {new Date(attempt.attempted_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={attempt.is_correct ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'}>
                        {attempt.is_correct ? 'Correct' : 'Incorrect'}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => retryQuiz(attempt.quiz_id)}
                        className="h-8 px-2"
                      >
                        <RotateCcw className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Target className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No quiz attempts yet</p>
                <p className="text-muted-foreground/70 text-xs">Start practicing to see your progress</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>



    </div>
  );
};

export default PracticeSection;