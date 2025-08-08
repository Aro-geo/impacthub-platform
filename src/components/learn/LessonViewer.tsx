import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAI } from '@/hooks/useAI';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  ArrowLeft, 
  ArrowRight, 
  BookOpen,
  Star,
  CheckCircle,
  RotateCcw
} from 'lucide-react';

interface LessonSlide {
  id: number;
  title: string;
  content: string;
  image?: string;
  audioText: string;
  quiz?: {
    question: string;
    options: string[];
    correct: number;
    explanation: string;
  };
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  slides: LessonSlide[];
}

const LessonViewer = ({ lessonId }: { lessonId: string }) => {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [lessonCompleted, setLessonCompleted] = useState(false);

  const { translateText } = useAI();

  useEffect(() => {
    loadLesson();
  }, [lessonId]);

  const loadLesson = () => {
    // Mock lesson data - in real app, fetch from Supabase
    const mockLesson: Lesson = {
      id: lessonId,
      title: 'Basic English Greetings',
      description: 'Learn how to greet people in English',
      category: 'English',
      difficulty: 'beginner',
      slides: [
        {
          id: 1,
          title: 'Welcome to English Greetings! 👋',
          content: 'Today we will learn how to say hello and introduce ourselves in English.',
          image: '👋',
          audioText: 'Welcome to English Greetings! Today we will learn how to say hello and introduce ourselves in English.'
        },
        {
          id: 2,
          title: 'Saying Hello',
          content: 'The most common greeting in English is "Hello". You can also say "Hi" for a more casual greeting.',
          image: '😊',
          audioText: 'The most common greeting in English is Hello. You can also say Hi for a more casual greeting.'
        },
        {
          id: 3,
          title: 'Introducing Yourself',
          content: 'To introduce yourself, say: "My name is..." or "I am...". For example: "My name is Maria" or "I am Ahmed".',
          image: '🙋‍♀️',
          audioText: 'To introduce yourself, say: My name is, or I am. For example: My name is Maria, or I am Ahmed.'
        },
        {
          id: 4,
          title: 'Practice Time!',
          content: 'Let\'s practice what we learned!',
          image: '📝',
          audioText: 'Now let\'s practice what we learned!',
          quiz: {
            question: 'How do you say hello in a casual way?',
            options: ['Hello', 'Hi', 'Good morning', 'How are you'],
            correct: 1,
            explanation: 'Hi is the casual way to say hello in English!'
          }
        },
        {
          id: 5,
          title: 'Great Job! 🎉',
          content: 'You completed the lesson! You now know how to greet people and introduce yourself in English.',
          image: '🎉',
          audioText: 'Great job! You completed the lesson! You now know how to greet people and introduce yourself in English.'
        }
      ]
    };
    setLesson(mockLesson);
  };

  const playAudio = (text: string) => {
    if (isMuted) return;

    if ('speechSynthesis' in window) {
      // Stop any current speech
      speechSynthesis.cancel();
      
      setIsPlaying(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;
      utterance.lang = 'en-US';

      // Get available voices and use a natural sounding one
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Natural') || 
        voice.name.includes('Enhanced') ||
        (voice.lang.startsWith('en') && voice.name.includes('Female'))
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => {
        setIsPlaying(false);
      };

      speechSynthesis.speak(utterance);
    }
  };

  const stopAudio = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  const nextSlide = () => {
    if (lesson && currentSlide < lesson.slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
      setQuizAnswer(null);
      setShowQuizResult(false);
      
      // Auto-play audio for new slide
      setTimeout(() => {
        if (!isMuted) {
          playAudio(lesson.slides[currentSlide + 1].audioText);
        }
      }, 500);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
      setQuizAnswer(null);
      setShowQuizResult(false);
    }
  };

  const handleQuizAnswer = (answerIndex: number) => {
    setQuizAnswer(answerIndex);
    setShowQuizResult(true);
    
    const slide = lesson?.slides[currentSlide];
    if (slide?.quiz) {
      const isCorrect = answerIndex === slide.quiz.correct;
      setTimeout(() => {
        if (!isMuted) {
          playAudio(isCorrect ? 'Correct! ' + slide.quiz.explanation : 'Not quite right. ' + slide.quiz.explanation);
        }
      }, 500);
    }
  };

  const completeLesson = () => {
    setLessonCompleted(true);
    if (!isMuted) {
      playAudio('Congratulations! You have completed this lesson successfully!');
    }
  };

  const restartLesson = () => {
    setCurrentSlide(0);
    setQuizAnswer(null);
    setShowQuizResult(false);
    setLessonCompleted(false);
  };

  if (!lesson) {
    return <div className="text-center py-8">Loading lesson...</div>;
  }

  const currentSlideData = lesson.slides[currentSlide];
  const progress = ((currentSlide + 1) / lesson.slides.length) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Lesson Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <BookOpen className="h-6 w-6 text-blue-600" />
                {lesson.title}
              </CardTitle>
              <CardDescription className="text-lg mt-1">
                {lesson.description}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-100 text-blue-800">
                {lesson.category}
              </Badge>
              <Badge variant="outline">
                {lesson.difficulty === 'beginner' && '⭐ Beginner'}
                {lesson.difficulty === 'intermediate' && '⭐⭐ Intermediate'}
                {lesson.difficulty === 'advanced' && '⭐⭐⭐ Advanced'}
              </Badge>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progress</span>
              <span>{currentSlide + 1} of {lesson.slides.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-600 to-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <Card className="min-h-[500px]">
        <CardContent className="p-8">
          {!lessonCompleted ? (
            <div className="space-y-6">
              {/* Slide Content */}
              <div className="text-center space-y-6">
                <div className="text-8xl mb-4">
                  {currentSlideData.image}
                </div>
                
                <h2 className="text-3xl font-heading font-bold text-gray-900">
                  {currentSlideData.title}
                </h2>
                
                <p className="text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
                  {currentSlideData.content}
                </p>
              </div>

              {/* Audio Controls */}
              <div className="flex justify-center gap-4">
                <Button
                  onClick={() => playAudio(currentSlideData.audioText)}
                  disabled={isPlaying}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="mr-2 h-5 w-5" />
                      Playing...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-5 w-5" />
                      Listen
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={() => setIsMuted(!isMuted)}
                  variant="outline"
                  size="lg"
                >
                  {isMuted ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </Button>
              </div>

              {/* Quiz Section */}
              {currentSlideData.quiz && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-center text-gray-900">
                    {currentSlideData.quiz.question}
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                    {currentSlideData.quiz.options.map((option, index) => (
                      <Button
                        key={index}
                        onClick={() => handleQuizAnswer(index)}
                        disabled={showQuizResult}
                        variant={
                          showQuizResult
                            ? index === currentSlideData.quiz!.correct
                              ? "default"
                              : quizAnswer === index
                              ? "destructive"
                              : "outline"
                            : "outline"
                        }
                        className="h-16 text-lg"
                      >
                        {option}
                        {showQuizResult && index === currentSlideData.quiz!.correct && (
                          <CheckCircle className="ml-2 h-5 w-5" />
                        )}
                      </Button>
                    ))}
                  </div>

                  {showQuizResult && (
                    <Card className="bg-blue-50 border-blue-200 max-w-2xl mx-auto">
                      <CardContent className="p-4 text-center">
                        <p className="text-blue-900 text-lg">
                          {currentSlideData.quiz.explanation}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Completion Screen */
            <div className="text-center space-y-6">
              <div className="text-8xl mb-4">🎉</div>
              <h2 className="text-3xl font-heading font-bold text-gray-900">
                Lesson Complete!
              </h2>
              <p className="text-xl text-gray-700">
                Great job! You've successfully completed "{lesson.title}"
              </p>
              <div className="flex justify-center gap-4">
                <Button
                  onClick={restartLesson}
                  variant="outline"
                  size="lg"
                >
                  <RotateCcw className="mr-2 h-5 w-5" />
                  Review Lesson
                </Button>
                <Button
                  onClick={() => window.history.back()}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-green-600"
                >
                  <Star className="mr-2 h-5 w-5" />
                  Next Lesson
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      {!lessonCompleted && (
        <div className="flex justify-between items-center">
          <Button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            variant="outline"
            size="lg"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Previous
          </Button>
          
          <div className="text-gray-600 font-medium">
            {currentSlide + 1} / {lesson.slides.length}
          </div>
          
          {currentSlide === lesson.slides.length - 1 ? (
            <Button
              onClick={completeLesson}
              size="lg"
              className="bg-gradient-to-r from-green-600 to-blue-600"
            >
              <CheckCircle className="mr-2 h-5 w-5" />
              Complete Lesson
            </Button>
          ) : (
            <Button
              onClick={nextSlide}
              disabled={currentSlideData.quiz && !showQuizResult}
              size="lg"
            >
              Next
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default LessonViewer;