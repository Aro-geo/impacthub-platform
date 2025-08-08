import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAI } from '@/hooks/useAI';
import { 
  FileQuestion, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Volume2,
  RotateCcw,
  Star
} from 'lucide-react';

interface SimpleQuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface SimpleQuiz {
  questions: SimpleQuizQuestion[];
}

const SimpleQuizCreator = () => {
  const [content, setContent] = useState('');
  const [quiz, setQuiz] = useState<SimpleQuiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const { createQuiz, loading } = useAI();

  const sampleContent = `
Hello! My name is Sarah. I am a teacher.
I work at a school in the city.
I teach children how to read and write.
I love my job because I help children learn.
Every day, I go to school at 8 AM.
I teach from 9 AM to 3 PM.
After school, I prepare lessons for tomorrow.
Teaching is a very important job.
  `.trim();

  const handleCreateQuiz = async () => {
    const textToUse = content.trim() || sampleContent;
    
    const result = await createQuiz(textToUse, 'easy');
    if (result) {
      try {
        const parsedQuiz = JSON.parse(result);
        // Ensure we have simple, visual questions
        const simplifiedQuiz = {
          questions: parsedQuiz.questions.slice(0, 3).map((q: any) => ({
            ...q,
            options: q.options.slice(0, 3) // Limit to 3 options for simplicity
          }))
        };
        setQuiz(simplifiedQuiz);
        setCurrentQuestion(0);
        setUserAnswers([]);
        setShowResults(false);
        setSelectedAnswer(null);
        setShowExplanation(false);
      } catch (error) {
        console.error('Failed to parse quiz JSON:', error);
      }
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setShowExplanation(true);
    
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setUserAnswers(newAnswers);

    // Speak the explanation
    if (quiz) {
      const explanation = quiz.questions[currentQuestion].explanation;
      const isCorrect = answerIndex === quiz.questions[currentQuestion].correct;
      const feedback = isCorrect ? 'Correct! ' + explanation : 'Not quite right. ' + explanation;
      speakText(feedback);
    }
  };

  const nextQuestion = () => {
    if (quiz && currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setShowResults(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setUserAnswers([]);
    setShowResults(false);
    setSelectedAnswer(null);
    setShowExplanation(false);
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;
      utterance.lang = 'en-US';
      
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Natural') || 
        voice.name.includes('Enhanced') ||
        (voice.lang.startsWith('en') && voice.name.includes('Female'))
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      speechSynthesis.speak(utterance);
    }
  };

  const calculateScore = () => {
    if (!quiz) return 0;
    const correct = userAnswers.filter((answer, index) => 
      answer === quiz.questions[index].correct
    ).length;
    return Math.round((correct / quiz.questions.length) * 100);
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 80) return '🎉';
    if (score >= 60) return '😊';
    if (score >= 40) return '🙂';
    return '💪';
  };

  const getScoreMessage = (score: number) => {
    if (score >= 80) return 'Excellent work!';
    if (score >= 60) return 'Good job!';
    if (score >= 40) return 'Keep practicing!';
    return 'Try again - you can do it!';
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <FileQuestion className="h-8 w-8 text-purple-600" />
          Practice Quiz
        </CardTitle>
        <CardDescription className="text-lg">
          Create simple quizzes from any text to test your understanding
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {!quiz && (
          <>
            {/* Content Input */}
            <div className="space-y-3">
              <Label className="text-lg font-medium">
                Paste your text here (or use our sample):
              </Label>
              <Textarea
                placeholder="Enter the text you want to create a quiz from..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                className="text-base"
              />
              {!content && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-blue-800 text-sm mb-2">
                    <strong>Sample text:</strong> We'll use this if you don't enter your own text:
                  </p>
                  <p className="text-blue-700 text-sm italic">
                    "{sampleContent.substring(0, 100)}..."
                  </p>
                </div>
              )}
            </div>

            {/* Generate Button */}
            <Button 
              onClick={handleCreateQuiz}
              disabled={loading}
              size="lg"
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg py-6"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  Creating Your Quiz...
                </>
              ) : (
                <>
                  <FileQuestion className="mr-2 h-6 w-6" />
                  Create Simple Quiz
                </>
              )}
            </Button>
          </>
        )}

        {/* Quiz Display */}
        {quiz && !showResults && (
          <div className="space-y-6">
            {/* Progress */}
            <div className="text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Question {currentQuestion + 1} of {quiz.questions.length}
              </h3>
              <div className="w-full bg-gray-200 rounded-full h-3 max-w-md mx-auto">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Question */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6 text-center">
                <h4 className="text-2xl font-semibold text-blue-900 mb-4">
                  {quiz.questions[currentQuestion].question}
                </h4>
                <Button
                  onClick={() => speakText(quiz.questions[currentQuestion].question)}
                  variant="outline"
                  size="sm"
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  <Volume2 className="mr-1 h-4 w-4" />
                  Listen to Question
                </Button>
              </CardContent>
            </Card>

            {/* Answer Options */}
            <div className="space-y-3">
              {quiz.questions[currentQuestion].options.map((option, index) => (
                <Button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showExplanation}
                  variant={
                    showExplanation
                      ? index === quiz.questions[currentQuestion].correct
                        ? "default"
                        : selectedAnswer === index
                        ? "destructive"
                        : "outline"
                      : "outline"
                  }
                  className="w-full h-16 text-lg justify-start px-6"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span>{option}</span>
                    {showExplanation && index === quiz.questions[currentQuestion].correct && (
                      <CheckCircle className="ml-auto h-5 w-5 text-green-600" />
                    )}
                    {showExplanation && selectedAnswer === index && index !== quiz.questions[currentQuestion].correct && (
                      <XCircle className="ml-auto h-5 w-5 text-red-600" />
                    )}
                  </div>
                </Button>
              ))}
            </div>

            {/* Explanation */}
            {showExplanation && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">💡</div>
                    <div>
                      <h5 className="font-semibold text-green-900 mb-2">Explanation:</h5>
                      <p className="text-green-800 text-lg">
                        {quiz.questions[currentQuestion].explanation}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center pt-4">
              <Button
                onClick={() => setQuiz(null)}
                variant="outline"
                size="lg"
              >
                Back to Creator
              </Button>
              
              <Button
                onClick={nextQuestion}
                disabled={!showExplanation}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-green-600"
              >
                {currentQuestion === quiz.questions.length - 1 ? 'See Results' : 'Next Question'}
              </Button>
            </div>
          </div>
        )}

        {/* Results Display */}
        {quiz && showResults && (
          <div className="text-center space-y-6">
            <div className="text-8xl mb-4">
              {getScoreEmoji(calculateScore())}
            </div>
            
            <h3 className="text-3xl font-bold text-gray-900">
              Quiz Complete!
            </h3>
            
            <div className="text-6xl font-bold text-blue-600 mb-4">
              {calculateScore()}%
            </div>
            
            <p className="text-2xl text-gray-700 mb-6">
              {getScoreMessage(calculateScore())}
            </p>

            {/* Score Breakdown */}
            <Card className="bg-gray-50 max-w-md mx-auto">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-lg">
                    <span>Correct Answers:</span>
                    <span className="font-bold text-green-600">
                      {userAnswers.filter((answer, index) => answer === quiz.questions[index].correct).length}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span>Total Questions:</span>
                    <span className="font-bold">{quiz.questions.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={resetQuiz}
                variant="outline"
                size="lg"
                className="px-8"
              >
                <RotateCcw className="mr-2 h-5 w-5" />
                Try Again
              </Button>
              <Button
                onClick={() => setQuiz(null)}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 px-8"
              >
                <Star className="mr-2 h-5 w-5" />
                Create New Quiz
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SimpleQuizCreator;