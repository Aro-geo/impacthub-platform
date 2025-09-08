import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useAI } from '@/hooks/useAI';
import { supabase } from '@/integrations/supabase/client';
import MarkdownRenderer from '@/components/ui/markdown-renderer';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  XCircle,
  Clock,
  Trophy,
  RotateCcw,
  Target
} from 'lucide-react';

interface Quiz {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  lesson: {
    id: string;
    title: string;
    subject: {
      id: string;
      name: string;
      color: string;
    };
  };
}

interface QuizInterfaceProps {
  practiceMode: 'review' | 'timed' | 'random';
  selectedSubject: string;
  selectedLessonId?: string;
  onClose: () => void;
}

const QuizInterface: React.FC<QuizInterfaceProps> = ({
  practiceMode,
  selectedSubject,
  selectedLessonId,
  onClose
}) => {
  const { user } = useAuth();
  const { trackQuizAttempt } = useAI();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [sessionComplete, setSessionComplete] = useState(false);

  useEffect(() => {
    fetchQuizzes();
  }, [selectedSubject]);

  useEffect(() => {
    if (practiceMode === 'timed' && timeLeft !== null && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (practiceMode === 'timed' && timeLeft === 0) {
      handleTimeUp();
    }
  }, [timeLeft, practiceMode]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('lesson_quizzes')
        .select(`
          id,
          question,
          options,
          correct_answer,
          explanation,
          simple_lessons!inner (
            id,
            title,
            subjects!inner (
              id,
              name,
              color
            )
          )
        `)
        .order('order_index');

      if (selectedLessonId) {
        query = query.eq('lesson_id', selectedLessonId);
      } else if (selectedSubject !== 'all') {
        query = query.eq('simple_lessons.subject_id', selectedSubject);
      }

      const { data, error } = await query;
      if (error) throw error;

      let formattedQuizzes = data?.map(quiz => {
        // Convert correct_answer to number if it's a string (database type conversion)
        const correctAnswerAsNumber = typeof quiz.correct_answer === 'string' 
          ? parseInt(quiz.correct_answer, 10) 
          : quiz.correct_answer;
        
        return {
          ...quiz,
          // Ensure correct_answer is a number for proper comparison
          correct_answer: correctAnswerAsNumber,
          // Ensure options is an array of strings
          options: Array.isArray(quiz.options) ? quiz.options : [],
          lesson: quiz.simple_lessons ? {
            id: quiz.simple_lessons.id,
            title: quiz.simple_lessons.title,
            subject: quiz.simple_lessons.subjects
          } : null
        };
      }).filter(quiz => quiz.lesson !== null) || [];

      // Shuffle for random mode
      if (practiceMode === 'random') {
        formattedQuizzes = formattedQuizzes.sort(() => Math.random() - 0.5);
      }

      // Limit to 10 questions for timed mode
      if (practiceMode === 'timed') {
        formattedQuizzes = formattedQuizzes.slice(0, 10);
        setTimeLeft(10 * 60); // 10 minutes for 10 questions
      }

      setQuizzes(formattedQuizzes);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = async () => {
    if (selectedAnswer === null || !user) return;

    const currentQuiz = quizzes[currentQuizIndex];
    const isCorrect = selectedAnswer === currentQuiz.correct_answer;
    
    // Log for verification (can be removed in production)
    console.log('Answer submitted:', {
      selected: selectedAnswer,
      correct: currentQuiz.correct_answer,
      isCorrect: isCorrect
    });
    
    // Save answer
    setAnswers(prev => ({ ...prev, [currentQuizIndex]: selectedAnswer }));
    
    // Record attempt in database
    try {
      await supabase
        .from('lesson_quiz_attempts')
        .insert({
          user_id: user.id,
          quiz_id: currentQuiz.id,
          selected_answer: selectedAnswer,
          is_correct: isCorrect,
          attempted_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error recording quiz attempt:', error);
    }

    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setShowResult(true);
  };

  const handleNextQuestion = async () => {
    if (currentQuizIndex < quizzes.length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // Quiz session completed - track with AI
      setSessionComplete(true);
      
      // Track the quiz session completion with AI learning observer
      if (user && quizzes.length > 0) {
        const totalAnswered = Object.keys(answers).length + (selectedAnswer !== null ? 1 : 0);
        const finalScore = score + (selectedAnswer === quizzes[currentQuizIndex]?.correct_answer ? 1 : 0);
        const scorePercentage = totalAnswered > 0 ? Math.round((finalScore / totalAnswered) * 100) : 0;
        
        // Get subject and topic from the first quiz
        const firstQuiz = quizzes[0];
        const subject = firstQuiz?.lesson?.subject?.name || 'Unknown';
        const topic = firstQuiz?.lesson?.title || 'Quiz Practice';
        
        // Determine difficulty based on practice mode and score
        let difficulty: 'easy' | 'medium' | 'hard' = 'medium';
        if (practiceMode === 'timed') difficulty = 'hard';
        else if (scorePercentage >= 80) difficulty = 'easy';
        else if (scorePercentage < 60) difficulty = 'hard';
        
        // Estimate time spent (for timed mode, use actual time, otherwise estimate)
        const timeSpent = practiceMode === 'timed' && timeLeft !== null 
          ? (10 * 60 - timeLeft) / 60  // Convert to minutes
          : Math.max(totalAnswered * 2, 5); // Estimate 2 minutes per question, minimum 5 minutes
        
        try {
          await trackQuizAttempt(subject, topic, scorePercentage, difficulty, timeSpent);
        } catch (error) {
          console.error('Error tracking quiz attempt with AI:', error);
        }
      }
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuizIndex > 0) {
      setCurrentQuizIndex(prev => prev - 1);
      setSelectedAnswer(answers[currentQuizIndex - 1] || null);
      setShowResult(false);
    }
  };

  const handleTimeUp = () => {
    setSessionComplete(true);
  };

  const restartSession = () => {
    setCurrentQuizIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setAnswers({});
    setScore(0);
    setSessionComplete(false);
    if (practiceMode === 'timed') {
      setTimeLeft(10 * 60);
    }
    fetchQuizzes();
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getScorePercentage = () => {
    const totalAnswered = Object.keys(answers).length;
    return totalAnswered > 0 ? Math.round((score / totalAnswered) * 100) : 0;
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 dark:text-green-400';
    if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (loading) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center p-8">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="text-foreground">Loading quiz...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (quizzes.length === 0) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <Target className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No quizzes available</h3>
          <p className="text-muted-foreground mb-6">
            There are no quizzes available for the selected subject.
          </p>
          <Button onClick={onClose} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Practice
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (sessionComplete) {
    const totalAnswered = Object.keys(answers).length;
    const percentage = getScorePercentage();
    
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl mb-4 text-foreground">Quiz Session Complete!</CardTitle>
          <div className="space-y-4">
            <div className="text-6xl mb-4">
              {percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '📚'}
            </div>
            <div className={`text-4xl font-bold ${getScoreColor(percentage)} dark:brightness-125`}>
              {score}/{totalAnswered}
            </div>
            <div className={`text-xl ${getScoreColor(percentage)} dark:brightness-125`}>
              {percentage}% Correct
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalAnswered}</div>
              <div className="text-sm text-muted-foreground">Questions Answered</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{score}</div>
              <div className="text-sm text-muted-foreground">Correct Answers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {practiceMode === 'timed' ? formatTime((10 * 60) - (timeLeft || 0)) : 'N/A'}
              </div>
              <div className="text-sm text-muted-foreground">Time Taken</div>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <Button onClick={restartSession} className="bg-blue-600 hover:bg-blue-700">
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button onClick={onClose} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Practice
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentQuiz = quizzes[currentQuizIndex];
  const progress = ((currentQuizIndex + 1) / quizzes.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button onClick={onClose} variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Practice
            </Button>
            <div className="flex items-center space-x-4">
              <Badge variant="outline">
                {practiceMode.charAt(0).toUpperCase() + practiceMode.slice(1)} Mode
              </Badge>
              {practiceMode === 'timed' && timeLeft !== null && (
                <Badge variant="outline" className="text-orange-600">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatTime(timeLeft)}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">
                Question {currentQuizIndex + 1} of {quizzes.length}
              </CardTitle>
              <Badge variant="secondary">
                {currentQuiz.lesson.subject.name}
              </Badge>
            </div>
            
            <Progress value={progress} className="w-full" />
          </div>
        </CardHeader>
      </Card>

      {/* Question */}
      <Card>
        <CardHeader>
          <MarkdownRenderer
            content={currentQuiz.question}
            className="text-lg text-foreground font-medium"
          />
          <p className="text-sm text-muted-foreground">From: {currentQuiz.lesson.title}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {currentQuiz.options.map((option, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleAnswerSelect(index)}
                disabled={showResult}
                className={`w-full p-4 text-left border rounded-lg transition-colors ${
                  selectedAnswer === index
                    ? showResult
                      ? index === currentQuiz.correct_answer
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-400'
                        : 'border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-400'
                      : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                    : showResult && index === currentQuiz.correct_answer
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-400'
                    : 'border-border hover:border-input bg-card'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-muted-foreground min-w-[20px]">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <MarkdownRenderer content={option} className="text-foreground" />
                  </div>
                  {showResult && (
                    <div className="flex items-center space-x-2">
                      {index === currentQuiz.correct_answer && (
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                          <span className="text-xs text-green-600 dark:text-green-400 font-medium">Correct</span>
                        </div>
                      )}
                      {selectedAnswer === index && index !== currentQuiz.correct_answer && (
                        <div className="flex items-center space-x-1">
                          <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                          <span className="text-xs text-red-600 dark:text-red-400 font-medium">Your Answer</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {showResult && (
            <>
              <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Explanation:</h4>
                  <MarkdownRenderer 
                    content={currentQuiz.explanation} 
                    className="text-blue-700 dark:text-blue-200"
                  />
                </CardContent>
              </Card>
              

            </>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <Button
              onClick={handlePreviousQuestion}
              variant="outline"
              disabled={currentQuizIndex === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="flex items-center space-x-2">
              {!showResult && selectedAnswer !== null && (
                <Button onClick={handleSubmitAnswer} className="bg-blue-600 hover:bg-blue-700">
                  Submit Answer
                </Button>
              )}
              
              {showResult && (
                <Button onClick={handleNextQuestion} className="bg-green-600 hover:bg-green-700">
                  {currentQuizIndex < quizzes.length - 1 ? (
                    <>
                      Next Question
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    <>
                      Finish Quiz
                      <Trophy className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizInterface;