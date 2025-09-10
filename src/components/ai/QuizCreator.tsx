import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAI } from '@/hooks/useAI';
import { FileQuestion, Loader2, CheckCircle, XCircle } from 'lucide-react';

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface Quiz {
  questions: QuizQuestion[];
}

const QuizCreator = () => {
  const [content, setContent] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const resultRef = useRef<HTMLDivElement>(null);

  const { streamQuizFromContent, loading } = useAI();

  // Scroll to results when content is available
  useEffect(() => {
    if (quiz && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [quiz]);

  // Update processing stage for visual feedback
  useEffect(() => {
    if (isGenerating) {
      const stages = [
        "Analyzing content...",
        "Identifying key concepts...",
        "Creating questions...",
        "Generating answer options...",
        "Finalizing quiz..."
      ];
      
      let currentStage = 0;
      const stageInterval = setInterval(() => {
        if (currentStage < stages.length) {
          setProcessingStage(stages[currentStage]);
          currentStage++;
        } else {
          clearInterval(stageInterval);
        }
      }, 1000);
      
      return () => clearInterval(stageInterval);
    } else {
      setProcessingStage('');
    }
  }, [isGenerating]);

  const handleCreateQuiz = async () => {
    if (!content.trim()) {
      alert('Please enter some content to create a quiz from.');
      return;
    }

    setIsGenerating(true);
    setQuiz(null);
    
    let streamedContent = '';

    try {
      await streamQuizFromContent(content, difficulty, {
        onToken: (token: string) => {
          streamedContent += token;
          setProcessingStage('Generating quiz...');
        },
        onComplete: (response: string) => {
          console.log('Quiz creation completed:', response);
          streamedContent = response;
          processQuizResponse(streamedContent);
        },
        onError: (error: Error) => {
          console.error('Error creating quiz:', error);
          alert('Error creating quiz. Please try again with different content.');
          createFallbackQuiz();
        }
      });
    } catch (error) {
      console.error('Error creating quiz:', error);
      alert('Error creating quiz. Please try again with different content.');
      createFallbackQuiz();
    } finally {
      setIsGenerating(false);
    }
  };

  const processQuizResponse = (result: string) => {
    try {
      if (!result) {
        console.error('processQuizResponse received null or undefined');
        createFallbackQuiz();
        return;
      }

      if (typeof result !== 'string') {
        console.error('processQuizResponse received non-string result:', result);
        createFallbackQuiz();
        return;
      }

      if (result.length === 0) {
        console.error('processQuizResponse received empty string');
        createFallbackQuiz();
        return;
      }

      // Clean the result in case there's extra text around the JSON
      const cleanResult = result.trim();
      console.log('Cleaned result:', cleanResult);

      let jsonStart = cleanResult.indexOf('{');
      let jsonEnd = cleanResult.lastIndexOf('}') + 1;

      if (jsonStart === -1 || jsonEnd === 0) {
        console.error('No JSON found in response');
        createFallbackQuiz();
        return;
      }

      const jsonString = cleanResult.substring(jsonStart, jsonEnd);
      console.log('Extracted JSON:', jsonString);

      const parsedQuiz = JSON.parse(jsonString);
      console.log('Parsed quiz:', parsedQuiz);

      // Validate the quiz structure
      if (!parsedQuiz.questions || !Array.isArray(parsedQuiz.questions)) {
        console.error('Invalid quiz format:', parsedQuiz);
        createFallbackQuiz();
        return;
      }

      if (parsedQuiz.questions.length === 0) {
        console.error('No questions in quiz');
        createFallbackQuiz();
        return;
      }

      setQuiz(parsedQuiz);
      setCurrentQuestion(0);
      setUserAnswers([]);
      setShowResults(false);
    } catch (error) {
      console.error('Error parsing quiz data:', error);
      createFallbackQuiz();
    }
  };

  const createFallbackQuiz = () => {
    console.log('Creating fallback quiz');
    const fallbackQuiz: Quiz = {
      questions: [
        {
          question: "What is the main topic of the content you provided?",
          options: [
            "The content discusses important concepts",
            "The content is about learning",
            "The content covers various topics",
            "The content is educational material"
          ],
          correct: 0,
          explanation: "This is a general question about your content since the AI couldn't generate specific questions."
        },
        {
          question: "What would you like to learn more about from this content?",
          options: [
            "Key concepts and definitions",
            "Practical applications",
            "Historical background",
            "Related topics"
          ],
          correct: 0,
          explanation: "This helps identify areas for further study."
        },
        {
          question: "How would you rate your understanding of this content?",
          options: [
            "I understand the basics",
            "I need more explanation",
            "I'm familiar with most concepts",
            "I'm ready for advanced topics"
          ],
          correct: 0,
          explanation: "Self-assessment helps track your learning progress."
        },
        {
          question: "What type of learning approach works best for you with this content?",
          options: [
            "Visual examples and diagrams",
            "Step-by-step explanations",
            "Hands-on practice",
            "Discussion and questions"
          ],
          correct: 0,
          explanation: "Understanding your learning style helps improve comprehension."
        },
        {
          question: "How can you apply what you've learned from this content?",
          options: [
            "In real-world situations",
            "For academic purposes",
            "To teach others",
            "For personal development"
          ],
          correct: 0,
          explanation: "Application helps reinforce learning and makes it meaningful."
        }
      ]
    };

    setQuiz(fallbackQuiz);
    setCurrentQuestion(0);
    setUserAnswers([]);
    setShowResults(false);
    alert('AI service unavailable. Here\'s a general quiz to help you think about your content.');
  };



  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setUserAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestion < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setUserAnswers([]);
    setShowResults(false);
  };

  const calculateScore = () => {
    if (!quiz) return 0;
    const correct = userAnswers.filter((answer, index) =>
      answer === quiz.questions[index].correct
    ).length;
    return Math.round((correct / quiz.questions.length) * 100);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileQuestion className="h-6 w-6 text-purple-600" />
          AI Quiz Creator
        </CardTitle>
        <CardDescription>
          Generate interactive quizzes from any text content using AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!quiz && (
          <>
            {/* Content Input */}
            <div className="space-y-3">
              <Label>Learning Content</Label>
              <Textarea
                placeholder="Paste your lesson content, article, or study material here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                className="resize-none"
              />
            </div>

            {/* Difficulty Selection */}
            <div className="space-y-3">
              <Label>Quiz Difficulty</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Generate Button */}
            <div className="space-y-3">
              <Button
                onClick={handleCreateQuiz}
                disabled={loading || !content.trim()}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Quiz...
                  </>
                ) : (
                  'Generate Quiz'
                )}
              </Button>

            </div>
          </>
        )}

        {/* Quiz Display */}
        {quiz && !showResults && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                Question {currentQuestion + 1} of {quiz.questions.length}
              </h3>
              <div className="text-sm text-gray-500">
                Progress: {Math.round(((currentQuestion + 1) / quiz.questions.length) * 100)}%
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-medium">
                {quiz.questions[currentQuestion].question}
              </h4>

              <div className="space-y-2">
                {quiz.questions[currentQuestion].options.map((option, index) => (
                  <Button
                    key={index}
                    variant={userAnswers[currentQuestion] === index ? "default" : "outline"}
                    className="w-full text-left justify-start h-auto p-4"
                    onClick={() => handleAnswerSelect(index)}
                  >
                    <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </Button>
                ))}
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setQuiz(null)}
                >
                  Back to Creator
                </Button>
                <Button
                  onClick={nextQuestion}
                  disabled={userAnswers[currentQuestion] === undefined}
                >
                  {currentQuestion === quiz.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Results Display */}
        {quiz && showResults && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">Quiz Complete!</h3>
              <div className="text-3xl font-bold text-blue-600 mb-4">
                Score: {calculateScore()}%
              </div>
            </div>

            <div className="space-y-4">
              {quiz.questions.map((question, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start gap-3">
                    {userAnswers[index] === question.correct ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium mb-2">{question.question}</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Your answer: {question.options[userAnswers[index]]}
                      </p>
                      {userAnswers[index] !== question.correct && (
                        <p className="text-sm text-green-600 mb-2">
                          Correct answer: {question.options[question.correct]}
                        </p>
                      )}
                      <p className="text-sm text-gray-700">{question.explanation}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex gap-4">
              <Button onClick={resetQuiz} variant="outline" className="flex-1">
                Retake Quiz
              </Button>
              <Button onClick={() => setQuiz(null)} className="flex-1">
                Create New Quiz
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuizCreator;