import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
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

interface Quiz {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  lesson: {
    id: string;
    title: string;
    subject: Subject;
  };
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
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [quizStats, setQuizStats] = useState<QuizStats>({
    totalAttempts: 0,
    correctAnswers: 0,
    averageScore: 0,
    bestStreak: 0
  });
  const [recentAttempts, setRecentAttempts] = useState<(QuizAttempt & { quiz: Quiz })[]>([]);
  const [loading, setLoading] = useState(true);
  const [practiceMode, setPracticeMode] = useState<'review' | 'timed' | 'random'>('review');

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
      .from('lesson_quizzes')
      .select(`
        id,
        question,
        options,
        correct_answer,
        explanation,
        simple_lessons (
          id,
          title,
          subjects (
            id,
            name,
            color
          )
        )
      `)
      .order('order_index');

    if (selectedSubject !== 'all') {
      query = query.eq('simple_lessons.subject_id', selectedSubject);
    }

    const { data, error } = await query;
    if (error) throw error;

    const formattedQuizzes = data?.map(quiz => ({
      ...quiz,
      lesson: {
        id: quiz.simple_lessons.id,
        title: quiz.simple_lessons.title,
        subject: quiz.simple_lessons.subjects
      }
    })) || [];

    setQuizzes(formattedQuizzes);
  };

  const fetchQuizStats = async () => {
    if (!user) return;

    const { data: attempts, error } = await supabase
      .from('lesson_quiz_attempts')
      .select('*')
      .eq('user_id', user.id);

    if (error) throw error;

    const totalAttempts = attempts?.length || 0;
    const correctAnswers = attempts?.filter(a => a.is_correct).length || 0;
    const averageScore = totalAttempts > 0 ? Math.round((correctAnswers / totalAttempts) * 100) : 0;

    // Calculate best streak
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

    const { data, error } = await supabase
      .from('lesson_quiz_attempts')
      .select(`
        *,
        lesson_quizzes (
          id,
          question,
          options,
          correct_answer,
          explanation,
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

    if (error) throw error;

    const formattedAttempts = data?.map(attempt => ({
      ...attempt,
      quiz: {
        ...attempt.lesson_quizzes,
        lesson: {
          id: attempt.lesson_quizzes.simple_lessons.id,
          title: attempt.lesson_quizzes.simple_lessons.title,
          subject: attempt.lesson_quizzes.simple_lessons.subjects
        }
      }
    })) || [];

    setRecentAttempts(formattedAttempts);
  };

  const retryQuiz = async (quizId: string) => {
    // In a real implementation, this would navigate to the quiz interface
    console.log('Retrying quiz:', quizId);
  };

  const startPracticeSession = async () => {
    // In a real implementation, this would start a practice session
    console.log('Starting practice session in mode:', practiceMode);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Practice & Quizzes</h2>
          <p className="text-gray-600">Test your knowledge and improve your skills</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {quizStats.totalAttempts}
            </div>
            <div className="text-sm text-gray-600">Total Attempts</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {quizStats.correctAnswers}
            </div>
            <div className="text-sm text-gray-600">Correct Answers</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className={`text-2xl font-bold mb-1 ${getScoreColor(quizStats.averageScore)}`}>
              {quizStats.averageScore}%
            </div>
            <div className="text-sm text-gray-600">Average Score</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Zap className="h-6 w-6 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {quizStats.bestStreak}
            </div>
            <div className="text-sm text-gray-600">Best Streak</div>
          </CardContent>
        </Card>
      </div>

      {/* Practice Modes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Start Practice Session */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Play className="h-5 w-5 text-green-600" />
              <span>Start Practice Session</span>
            </CardTitle>
            <CardDescription>
              Choose your practice mode and subject
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Practice Mode
              </label>
              <Select value={practiceMode} onValueChange={(value: any) => setPracticeMode(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="review">Review Mode</SelectItem>
                  <SelectItem value="timed">Timed Practice</SelectItem>
                  <SelectItem value="random">Random Questions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Subject
              </label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="All Subjects" />
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

            <Button 
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={startPracticeSession}
            >
              <Play className="mr-2 h-4 w-4" />
              Start Practice
            </Button>

            <div className="text-sm text-gray-600 text-center">
              {quizzes.length} questions available
            </div>
          </CardContent>
        </Card>

        {/* Recent Quiz Attempts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
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
                      <h4 className="font-medium text-gray-900 text-sm mb-1">
                        {attempt.quiz.lesson.title}
                      </h4>
                      <p className="text-xs text-gray-600 mb-2">
                        {attempt.quiz.lesson.subject.name}
                      </p>
                      <div className="flex items-center space-x-2">
                        {attempt.is_correct ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-xs text-gray-500">
                          {new Date(attempt.attempted_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={attempt.is_correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
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
                <Target className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No quiz attempts yet</p>
                <p className="text-gray-400 text-xs">Start practicing to see your progress</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Available Quizzes by Subject */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-purple-600" />
            <span>Available Quizzes</span>
          </CardTitle>
          <CardDescription>
            Practice quizzes organized by subject
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((subject) => {
                const subjectQuizzes = quizzes.filter(q => q.lesson?.subject?.id === subject.id);
                const userAttempts = recentAttempts.filter(a => a.quiz?.lesson?.subject?.id === subject.id);
                const correctAttempts = userAttempts.filter(a => a.is_correct).length;
                const successRate = userAttempts.length > 0 
                  ? Math.round((correctAttempts / userAttempts.length) * 100) 
                  : 0;

                return (
                  <Card key={subject.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">{subject.name}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {subjectQuizzes.length} quizzes
                        </Badge>
                      </div>
                      
                      {userAttempts.length > 0 && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-600">Success Rate</span>
                            <span className={`font-medium ${getScoreColor(successRate)}`}>
                              {successRate}%
                            </span>
                          </div>
                          <Progress value={successRate} className="h-2" />
                        </div>
                      )}

                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => {
                          setSelectedSubject(subject.id);
                          startPracticeSession();
                        }}
                      >
                        <Play className="mr-2 h-3 w-3" />
                        Practice {subject.name}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No quizzes available</h3>
              <p className="text-gray-600">Quizzes will appear here as lessons are added</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PracticeSection;