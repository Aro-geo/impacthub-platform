import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useAI } from '@/hooks/useAI';
import { useAuth } from '@/contexts/AuthContext';
import MarkdownRenderer from '@/components/ui/markdown-renderer';
import { AdaptiveLearningService, type StudentProfile } from '@/services/adaptiveLearningService';
import { personalizedLearningService, type UserLearningPreferences, type PersonalizedLearningExperience } from '@/services/personalizedLearningService';
import ProgressiveHintSystem from '@/components/ai/ProgressiveHintSystem';
import LearningPreferencesManager from '@/components/ai/LearningPreferencesManager';
import { Bot, Send, Loader2, GraduationCap, RefreshCw, Brain, Target, TrendingUp, BookOpen, Lightbulb, Users } from 'lucide-react';

interface AITutorProps {
  lessonTitle: string;
  lessonContent: string;
  subject?: string;
  difficultyLevel?: string;
  lessonId?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    responseTime?: number;
    conceptsDiscussed?: string[];
    difficulty?: number;
    hintLevel?: number;
  };
}

interface LearningSession {
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  conceptsDiscussed: string[];
  questionsAsked: number;
  hintsRequested: number;
  averageResponseTime: number;
  difficultyProgression: number[];
}

const AITutor: React.FC<AITutorProps> = ({ 
  lessonTitle, 
  lessonContent, 
  subject = 'General',
  difficultyLevel = 'intermediate',
  lessonId
}) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [userPreferences, setUserPreferences] = useState<UserLearningPreferences | null>(null);
  const [currentSession, setCurrentSession] = useState<LearningSession | null>(null);
  const [adaptiveDifficulty, setAdaptiveDifficulty] = useState(5); // 1-10 scale
  const [showHints, setShowHints] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [responseStartTime, setResponseStartTime] = useState<Date | null>(null);
  const [learningExperiences, setLearningExperiences] = useState<PersonalizedLearningExperience[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { getAITutorResponse, loading } = useAI();

  // Load user learning preferences when component mounts
  useEffect(() => {
    if (user) {
      loadUserPreferences();
      loadLearningExperiences();
    }
  }, [user]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize conversation when dialog opens
  useEffect(() => {
    if (isOpen && !hasInitialized) {
      initializeConversation();
      setHasInitialized(true);
      startLearningSession();
    }
  }, [isOpen, hasInitialized]);

  // End session when dialog closes
  useEffect(() => {
    if (!isOpen && currentSession) {
      endLearningSession();
    }
  }, [isOpen]);

  const loadUserPreferences = async () => {
    try {
      const preferences = await personalizedLearningService.getUserLearningPreferences(user!.id);
      setUserPreferences(preferences);
      
      // Set initial difficulty based on existing experiences
      if (preferences) {
        const recentExperiences = await personalizedLearningService.getUserLearningExperiences(user!.id, 10);
        if (recentExperiences.length > 0) {
          const avgDifficulty = recentExperiences.reduce((sum, exp) => sum + exp.difficultyLevel, 0) / recentExperiences.length;
          setAdaptiveDifficulty(Math.round(avgDifficulty));
        }
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  };

  const loadLearningExperiences = async () => {
    try {
      const experiences = await personalizedLearningService.getUserLearningExperiences(user!.id, 20);
      setLearningExperiences(experiences);
    } catch (error) {
      console.error('Error loading learning experiences:', error);
    }
  };

  const startLearningSession = () => {
    const session: LearningSession = {
      sessionId: `session-${Date.now()}`,
      startTime: new Date(),
      conceptsDiscussed: [],
      questionsAsked: 0,
      hintsRequested: 0,
      averageResponseTime: 0,
      difficultyProgression: [adaptiveDifficulty]
    };
    setCurrentSession(session);
  };

  const endLearningSession = async () => {
    if (!currentSession || !user) return;

    const endedSession = {
      ...currentSession,
      endTime: new Date()
    };

    // Create a learning experience record for the session
    await personalizedLearningService.createLearningExperience({
      userId: user.id,
      lessonId: lessonId,
      sessionId: endedSession.sessionId,
      experienceType: 'concept_review',
      conceptName: lessonTitle,
      difficultyLevel: adaptiveDifficulty,
      learningStyle: userPreferences?.preferredLearningStyle,
      hintsUsed: endedSession.hintsRequested,
      attemptsCount: endedSession.questionsAsked,
      studentInterests: userPreferences?.interests || [],
      careerGoals: userPreferences?.careerGoals || [],
      personalizedContent: {
        adaptations: {
          difficultyAdjustments: endedSession.difficultyProgression,
          learningStyleModifications: [],
          engagementBoosters: []
        }
      },
      masteryLevel: 0.5, // Default mastery level
      interactionData: {
        studentEngagement: {
          sessionDuration: Math.round((endedSession.endTime.getTime() - endedSession.startTime.getTime()) / 60000),
          questionsCount: endedSession.questionsAsked,
          hintRequests: endedSession.hintsRequested,
          followUpQuestions: 0
        }
      }
    });

    setCurrentSession(null);
  };

  const initializeConversation = async () => {
    const personalizedIntro = userPreferences 
      ? await generatePersonalizedIntro()
      : getDefaultIntro();

    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      role: 'assistant',
      content: personalizedIntro,
      timestamp: new Date()
    };

    setMessages([welcomeMessage]);
  };

  const generatePersonalizedIntro = async (): Promise<string> => {
    if (!userPreferences) return getDefaultIntro();

    const interests = userPreferences.interests.slice(0, 3).join(', ');
    const careerGoals = userPreferences.careerGoals.slice(0, 2).join(' or ');
    
    return `👋 Welcome back! I'm your AI tutor, ready to help you explore "${lessonTitle}".

Since I know you're interested in ${interests}${careerGoals ? ` and thinking about careers in ${careerGoals}` : ''}, I'll try to connect today's ${subject} concepts to these areas whenever possible.

**Your Learning Profile:**
- Preferred difficulty: ${adaptiveDifficulty}/10
- Learning style: ${userPreferences.preferredLearningStyle}
- Grade level: ${userPreferences.gradeLevel}

**What makes me special:**
- I adapt to your learning pace in real-time
- I provide hints progressively (never just give answers!)
- I connect concepts to your interests and career goals
- I use spaced repetition for concepts you find challenging

Ready to dive into this lesson? What specific part would you like to explore first, or do you have any questions about the concepts presented?`;
  };

  const getDefaultIntro = (): string => {
    return `👋 Hello! I'm your AI tutor, here to help you understand "${lessonTitle}" better.

I'm designed to guide you through learning concepts step by step, rather than giving you direct answers. Think of me as a supportive learning companion who will help you discover solutions through questioning and hints.

**What I can help you with:**
- Clarifying concepts from the lesson
- Breaking down complex ideas into simpler parts
- Guiding you through problem-solving steps
- Connecting this lesson to real-world applications
- Providing progressive hints when you're stuck

**How to get the best help:**
- Ask specific questions about what you don't understand
- Tell me what part is confusing you
- Share your thinking process so I can guide you better

What would you like to explore about this ${subject} lesson? Is there a particular concept or part that you'd like to understand better?`;
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isGenerating) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentQuestion(inputMessage);
    setResponseStartTime(new Date());
    setInputMessage('');
    setIsGenerating(true);

    // Update session stats
    if (currentSession) {
      setCurrentSession(prev => prev ? {
        ...prev,
        questionsAsked: prev.questionsAsked + 1
      } : null);
    }

    try {
      // Analyze question complexity and adjust difficulty if needed
      const questionComplexity = await analyzeQuestionComplexity(inputMessage);
      const adjustedDifficulty = await adjustDifficultyBasedOnPerformance(questionComplexity);
      
      // Get enhanced AI tutor response
      const response = await getEnhancedAIResponse(inputMessage, messages, adjustedDifficulty);
      
      if (response) {
        const responseTime = responseStartTime ? 
          (new Date().getTime() - responseStartTime.getTime()) / 1000 : 0;

        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response,
          timestamp: new Date(),
          metadata: {
            responseTime,
            difficulty: adjustedDifficulty,
            conceptsDiscussed: extractConceptsFromResponse(response)
          }
        };
        
        setMessages(prev => [...prev, assistantMessage]);

        // Track the interaction for adaptive learning
        if (user && lessonId) {
          await personalizedLearningService.createLearningExperience({
            userId: user.id,
            lessonId: lessonId,
            sessionId: currentSession?.sessionId || `session-${Date.now()}`,
            experienceType: 'difficulty_adjustment',
            conceptName: lessonTitle,
            difficultyLevel: adjustedDifficulty,
            learningStyle: userPreferences?.preferredLearningStyle,
            responseTimeSeconds: responseTime,
            accuracyScore: 0.8, // This would be calculated based on actual response quality
            hintsUsed: 0,
            attemptsCount: 1,
            studentInterests: userPreferences?.interests || [],
            careerGoals: userPreferences?.careerGoals || [],
            personalizedContent: {
              examples: [{
                type: 'interest_based',
                content: response,
                effectivenessScore: 0.8
              }]
            },
            masteryLevel: 0.6,
            interactionData: {
              questionAsked: inputMessage,
              aiResponse: response,
              studentEngagement: {
                sessionDuration: Math.round((new Date().getTime() - (currentSession?.startTime.getTime() || Date.now())) / 60000),
                questionsCount: currentSession?.questionsAsked || 1,
                hintRequests: 0,
                followUpQuestions: 0
              }
            }
          });
        }
      }
    } catch (error) {
      console.error('Error getting AI tutor response:', error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: "I'm sorry, I encountered an error while trying to help you. Please try asking your question again, or rephrase it in a different way.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
      setResponseStartTime(null);
    }
  };

  const analyzeQuestionComplexity = async (question: string): Promise<number> => {
    // Simple heuristics for question complexity (1-10 scale)
    const complexity = question.length > 100 ? 7 :
                      question.includes('why') || question.includes('how') ? 6 :
                      question.includes('what') ? 4 :
                      question.includes('?') ? 5 : 3;
    
    return Math.min(10, Math.max(1, complexity));
  };

  const adjustDifficultyBasedOnPerformance = async (questionComplexity: number): Promise<number> => {
    if (!userPreferences || !user) return adaptiveDifficulty;

    // Use the personalized learning service to calculate new difficulty
    const newDifficulty = personalizedLearningService.calculateNewDifficulty(
      adaptiveDifficulty,
      responseStartTime ? (new Date().getTime() - responseStartTime.getTime()) / 1000 : 30,
      0.8, // Mock accuracy - in real implementation, this would be calculated
      0    // Mock hints used for this calculation
    );

    setAdaptiveDifficulty(newDifficulty);
    
    // Update session progression
    if (currentSession) {
      setCurrentSession(prev => prev ? {
        ...prev,
        difficultyProgression: [...prev.difficultyProgression, newDifficulty]
      } : null);
    }

    return newDifficulty;
  };

  const getEnhancedAIResponse = async (
    userInput: string, 
    conversationHistory: ChatMessage[], 
    difficulty: number
  ): Promise<string> => {
    // Build conversation context from history
    const conversationContext = conversationHistory
      .filter(msg => msg.role !== 'assistant' || msg.id !== 'welcome')
      .map(msg => `${msg.role === 'user' ? 'Student' : 'Tutor'}: ${msg.content}`)
      .join('\n\n');

    // Get personalized examples if available
    const personalizedExample = userPreferences && lessonId 
      ? personalizedLearningService.generatePersonalizedExample(
          lessonTitle,
          userPreferences.interests,
          userPreferences.careerGoals
        )
      : null;

    // Enhanced prompt with adaptive features
    const enhancedPrompt = `
    You are an AI tutor helping a student with "${lessonTitle}" (${subject}).
    
    Student Profile:
    - Grade level: ${userPreferences?.gradeLevel || 'middle school'}
    - Learning style: ${userPreferences?.preferredLearningStyle || 'visual'}
    - Interests: ${userPreferences?.interests?.join(', ') || 'general topics'}
    - Career goals: ${userPreferences?.careerGoals?.join(', ') || 'exploring options'}
    - Current difficulty preference: ${difficulty}/10
    
    ${personalizedExample ? `
    Personalized Example:
    ${personalizedExample}
    ` : ''}

    Lesson Content: ${lessonContent}
    
    Previous Conversation: ${conversationContext}
    
    Current Question: ${userInput}
    
    Instructions:
    1. Adapt your response to difficulty level ${difficulty}/10
    2. Use Socratic method - guide with questions rather than direct answers
    3. Incorporate student's interests and career goals when relevant
    4. Provide scaffolding appropriate for their grade level
    5. If they're struggling, suggest using the hint system
    6. Connect concepts to real-world applications they care about
    `;

    try {
      // Use the enhanced tutor response for all cases
      const response = await getAITutorResponse(
        enhancedPrompt,
        lessonTitle,
        lessonContent,
        subject,
        difficultyLevel,
        conversationContext
      );
      
      return response || "I'm sorry, I couldn't generate a response. Please try asking your question in a different way.";
    } catch (error) {
      console.error('Error getting enhanced AI response:', error);
      throw error;
    }
  };

  const extractConceptsFromResponse = (response: string): string[] => {
    // Simple concept extraction - in a real app, this would be more sophisticated
    const concepts = [];
    if (response.toLowerCase().includes(lessonTitle.toLowerCase())) {
      concepts.push(lessonTitle);
    }
    return concepts;
  };

  const resetConversation = () => {
    setMessages([]);
    setHasInitialized(false);
    setShowHints(false);
    setCurrentQuestion('');
    if (isOpen) {
      initializeConversation();
      setHasInitialized(true);
      startLearningSession();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleHintRequested = async (hintLevel: number, hintType: string) => {
    if (currentSession) {
      setCurrentSession(prev => prev ? {
        ...prev,
        hintsRequested: prev.hintsRequested + 1
      } : null);
    }

    // Track hint usage for adaptive learning
    if (user && lessonId) {
      await personalizedLearningService.createLearningExperience({
        userId: user.id,
        lessonId: lessonId,
        sessionId: currentSession?.sessionId || `session-${Date.now()}`,
        experienceType: 'hint_usage',
        conceptName: lessonTitle,
        difficultyLevel: adaptiveDifficulty,
        learningStyle: userPreferences?.preferredLearningStyle,
        hintsUsed: hintLevel,
        attemptsCount: 1,
        studentInterests: userPreferences?.interests || [],
        careerGoals: userPreferences?.careerGoals || [],
        personalizedContent: {
          hints: [{
            level: hintLevel,
            type: hintType as any,
            content: `Hint level ${hintLevel} requested`,
            used: true
          }]
        },
        masteryLevel: 0.4, // Lower mastery when hints are needed
        interactionData: {
          questionAsked: currentQuestion,
          studentEngagement: {
            sessionDuration: Math.round((new Date().getTime() - (currentSession?.startTime.getTime() || Date.now())) / 60000),
            questionsCount: currentSession?.questionsAsked || 0,
            hintRequests: (currentSession?.hintsRequested || 0) + 1,
            followUpQuestions: 0
          }
        }
      });
    }
  };

  const handleProfileUpdate = (updatedProfile: UserLearningPreferences) => {
    setUserPreferences(updatedProfile);
    // Adjust difficulty based on updated preferences
    setAdaptiveDifficulty(5); // Reset to middle difficulty when profile changes
  };

  const getPerformanceStats = () => {
    if (!currentSession) return null;

    const avgDifficulty = currentSession.difficultyProgression.reduce((a, b) => a + b, 0) / 
                         currentSession.difficultyProgression.length;
    
    return {
      questionsAsked: currentSession.questionsAsked,
      hintsRequested: currentSession.hintsRequested,
      averageDifficulty: Math.round(avgDifficulty * 10) / 10,
      sessionDuration: Math.round((new Date().getTime() - currentSession.startTime.getTime()) / 60000)
    };
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 hover:from-blue-100 hover:to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 dark:border-blue-800"
        >
          <Bot className="w-4 h-4 mr-2" />
          Ask AI Tutor
          {userPreferences && (
            <Badge variant="secondary" className="ml-2">
              Personalized
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            AI Tutor - {lessonTitle}
            {userPreferences && (
              <Badge variant="outline" className="ml-2">
                Adaptive Learning Active
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-4">
            <span>Get personalized guidance and explanations for this lesson</span>
            {userPreferences && (
              <Badge variant="secondary">
                Difficulty: {adaptiveDifficulty}/10
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="hints" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Hints
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 flex flex-col min-h-0">
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30 rounded-lg">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <Card className={`max-w-[80%] ${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-background'
                    }`}>
                      <CardContent className="p-3">
                        {message.role === 'assistant' ? (
                          <MarkdownRenderer content={message.content} />
                        ) : (
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        )}
                        <div className={`text-xs mt-2 flex items-center gap-2 ${
                          message.role === 'user' 
                            ? 'text-primary-foreground/70' 
                            : 'text-muted-foreground'
                        }`}>
                          <span>{message.timestamp.toLocaleTimeString()}</span>
                          {message.metadata?.difficulty && (
                            <Badge variant="outline" className="text-xs">
                              Difficulty: {message.metadata.difficulty}/10
                            </Badge>
                          )}
                          {message.metadata?.responseTime && (
                            <Badge variant="outline" className="text-xs">
                              {message.metadata.responseTime.toFixed(1)}s
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
                
                {isGenerating && (
                  <div className="flex justify-start">
                    <Card className="bg-background">
                      <CardContent className="p-3">
                        <div className="flex items-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-muted-foreground">AI Tutor is thinking...</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Input Area */}
              <div className="p-4 border-t space-y-3">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={resetConversation}
                    variant="outline"
                    size="sm"
                    disabled={isGenerating}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => setShowHints(!showHints)}
                    variant="outline"
                    size="sm"
                    disabled={!currentQuestion}
                  >
                    <Lightbulb className="w-4 h-4" />
                    Hints
                  </Button>
                  <div className="flex-1 flex gap-2">
                    <Textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything about this lesson... What would you like to understand better?"
                      className="flex-1 min-h-[40px] max-h-[120px] resize-none"
                      disabled={isGenerating}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!inputMessage.trim() || isGenerating || loading}
                      className="self-end"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  💡 I adapt to your learning pace and provide personalized examples based on your interests. Press Enter to send.
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="hints" className="flex-1 overflow-y-auto p-4">
            {currentQuestion ? (
              <ProgressiveHintSystem
                concept={lessonTitle}
                problemContext={currentQuestion}
                studentInterests={userPreferences?.interests || []}
                onHintUsed={handleHintRequested}
              />
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <Lightbulb className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold mb-2">No Active Question</h3>
                  <p className="text-muted-foreground">
                    Ask a question in the chat first, then come here for progressive hints!
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="profile" className="flex-1 overflow-y-auto p-4">
            <LearningPreferencesManager onPreferencesUpdate={handleProfileUpdate} />
          </TabsContent>

          <TabsContent value="analytics" className="flex-1 overflow-y-auto p-4">
            <div className="space-y-6">
              {/* Current Session Stats */}
              {currentSession && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5" />
                      Current Session
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {getPerformanceStats()?.questionsAsked || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">Questions Asked</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {getPerformanceStats()?.hintsRequested || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">Hints Used</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {getPerformanceStats()?.averageDifficulty || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">Avg Difficulty</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {getPerformanceStats()?.sessionDuration || 0}m
                        </div>
                        <div className="text-sm text-muted-foreground">Session Time</div>
                      </div>
                    </div>
                    
                    {currentSession.difficultyProgression.length > 1 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Difficulty Progression</h4>
                        <div className="flex items-center gap-1">
                          {currentSession.difficultyProgression.map((level, index) => (
                            <div
                              key={index}
                              className="flex-1 h-2 rounded bg-primary/20 relative overflow-hidden"
                            >
                              <div
                                className={`h-full rounded bg-primary transition-all duration-300 ${
                                  level <= 2 ? 'w-1/5' :
                                  level <= 4 ? 'w-2/5' :
                                  level <= 6 ? 'w-3/5' :
                                  level <= 8 ? 'w-4/5' :
                                  'w-full'
                                }`}
                              />
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>Start</span>
                          <span>Current</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Long-term Analytics */}
              {learningExperiences.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      Learning History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {learningExperiences.slice(0, 5).map(experience => (
                        <div key={experience.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <div className="font-medium">{experience.conceptName}</div>
                            <div className="text-sm text-muted-foreground">
                              {experience.experienceType} - Difficulty: {experience.difficultyLevel}/10
                            </div>
                          </div>
                          <Badge variant="secondary">
                            Mastery: {Math.round(experience.masteryLevel * 100)}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AITutor;
