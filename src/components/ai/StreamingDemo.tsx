import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAI } from '@/hooks/useAI';
import MarkdownRenderer from '@/components/ui/markdown-renderer';
import StreamingChatExample from '@/components/ai/StreamingChatExample';
import { Zap, MessageCircle, Brain, Calculator, BookOpen, Loader2, Play, Square, Clock } from 'lucide-react';

const StreamingDemo = () => {
  const [selectedDemo, setSelectedDemo] = useState<string>('');
  const [input, setInput] = useState('');
  const [streamingOutput, setStreamingOutput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingComplete, setStreamingComplete] = useState(false);
  const [lastUsedModel, setLastUsedModel] = useState<string>('');
  const [streamingTime, setStreamingTime] = useState(0);
  
  const startTimeRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const {
    streamResponse,
    streamReasonedResponse,
    streamConversationalLearning,
    streamHomeworkHelp,
    loading
  } = useAI();

  const demoOptions = [
    {
      id: 'general_streaming',
      title: 'General Streaming Response',
      description: 'Stream any general AI response with real-time token output',
      model: 'deepseek-chat',
      icon: MessageCircle,
      placeholder: 'Ask any question or request any task (e.g., "Explain quantum computing in simple terms")',
      color: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    {
      id: 'reasoning_streaming',
      title: 'Streaming Reasoning',
      description: 'Stream complex problem-solving with DeepSeek Reasoner model',
      model: 'deepseek-reasoner',
      icon: Brain,
      placeholder: 'Describe a complex problem (e.g., "Design an efficient algorithm to solve the traveling salesman problem")',
      color: 'bg-purple-100 text-purple-800 border-purple-200'
    },
    {
      id: 'math_streaming',
      title: 'Streaming Math Help',
      description: 'Stream mathematical explanations and problem-solving',
      model: 'deepseek-reasoner',
      icon: Calculator,
      placeholder: 'Enter a math problem (e.g., "Solve and explain: ∫(2x + 3)dx from 0 to 5")',
      color: 'bg-green-100 text-green-800 border-green-200'
    },
    {
      id: 'learning_streaming',
      title: 'Streaming Conversational Learning',
      description: 'Stream friendly, engaging educational conversations',
      model: 'deepseek-chat',
      icon: BookOpen,
      placeholder: 'Start a learning conversation (e.g., "I want to understand how machine learning works")',
      color: 'bg-orange-100 text-orange-800 border-orange-200'
    }
  ];

  const selectedDemoConfig = demoOptions.find(demo => demo.id === selectedDemo);

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    setStreamingTime(0);
    intervalRef.current = setInterval(() => {
      setStreamingTime(Date.now() - startTimeRef.current);
    }, 100);
  }, []);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const handleStreamDemo = async () => {
    if (!selectedDemo || !input.trim()) return;
    
    setIsStreaming(true);
    setStreamingComplete(false);
    setStreamingOutput('');
    startTimer();

    const streamOptions = {
      onToken: (token: string) => {
        setStreamingOutput(prev => prev + token);
      },
      onComplete: (response: string) => {
        setStreamingOutput(response);
        setStreamingComplete(true);
        setIsStreaming(false);
        stopTimer();
      },
      onError: (error: Error) => {
        console.error('Streaming error:', error);
        setStreamingOutput(prev => prev + `\n\n**Error:** ${error.message}`);
        setStreamingComplete(true);
        setIsStreaming(false);
        stopTimer();
      }
    };
    
    try {
      switch (selectedDemo) {
        case 'general_streaming':
          await streamResponse(input, streamOptions, 'general');
          setLastUsedModel('deepseek-chat');
          break;
          
        case 'reasoning_streaming':
          await streamReasonedResponse(input, streamOptions);
          setLastUsedModel('deepseek-reasoner');
          break;
          
        case 'math_streaming':
          await streamHomeworkHelp(input, 'Mathematics', streamOptions);
          setLastUsedModel('deepseek-reasoner');
          break;
          
        case 'learning_streaming':
          await streamConversationalLearning('General Learning', input, 'intermediate', streamOptions);
          setLastUsedModel('deepseek-chat');
          break;
          
        default:
          throw new Error('Unknown demo type');
      }
    } catch (error) {
      console.error('Demo error:', error);
      setStreamingOutput(prev => prev + '\n\nSorry, there was an error processing your request. Please try again.');
      setStreamingComplete(true);
      setIsStreaming(false);
      stopTimer();
    }
  };

  const stopStreaming = () => {
    setIsStreaming(false);
    setStreamingComplete(true);
    stopTimer();
  };

  const resetDemo = () => {
    setInput('');
    setStreamingOutput('');
    setSelectedDemo('');
    setLastUsedModel('');
    setStreamingComplete(false);
    stopTimer();
    setStreamingTime(0);
  };

  const formatTime = (ms: number) => {
    const seconds = (ms / 1000).toFixed(1);
    return `${seconds}s`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="flex">
              <Zap className="h-8 w-8 text-blue-600" />
              <MessageCircle className="h-8 w-8 text-purple-600 -ml-2" />
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Streaming Demo
            </span>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Real-time
            </Badge>
          </CardTitle>
          <CardDescription className="text-lg">
            Experience real-time AI responses with token-by-token streaming. Watch the AI generate responses 
            in real-time, token by token, for a more interactive and engaging experience.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Demo Tabs */}
      <Tabs defaultValue="demo" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="demo">Interactive Demo</TabsTrigger>
          <TabsTrigger value="chat">Live Chat Example</TabsTrigger>
        </TabsList>

        {/* Interactive Demo Tab */}
        <TabsContent value="demo" className="space-y-6">
          {/* Demo Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Choose a Streaming Demo</CardTitle>
              <CardDescription>
                Select the type of streaming response you want to test
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {demoOptions.map((demo) => {
                  const Icon = demo.icon;
                  return (
                    <div
                      key={demo.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedDemo === demo.id
                          ? `${demo.color} border-current`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedDemo(demo.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="h-6 w-6 mt-1" />
                        <div className="flex-1">
                          <h3 className="font-semibold">{demo.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {demo.description}
                          </p>
                          <Badge variant="outline" className="mt-2 text-xs">
                            {demo.model}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Input Section */}
          {selectedDemo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {selectedDemoConfig && <selectedDemoConfig.icon className="h-5 w-5" />}
                  {selectedDemoConfig?.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder={selectedDemoConfig?.placeholder}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="min-h-[120px]"
                  disabled={isStreaming}
                />
                
                <div className="flex gap-3">
                  <Button 
                    onClick={handleStreamDemo}
                    disabled={!input.trim() || isStreaming || loading}
                    className="flex-1"
                  >
                    {isStreaming ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Streaming...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Start Streaming
                      </>
                    )}
                  </Button>
                  
                  {isStreaming && (
                    <Button variant="outline" onClick={stopStreaming}>
                      <Square className="mr-2 h-4 w-4" />
                      Stop
                    </Button>
                  )}
                  
                  <Button variant="outline" onClick={resetDemo}>
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Streaming Output */}
          {(streamingOutput || isStreaming) && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Streaming Response
                    {isStreaming && (
                      <div className="flex items-center gap-2 ml-4">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-muted-foreground">Live</span>
                      </div>
                    )}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {streamingTime > 0 && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatTime(streamingTime)}
                      </div>
                    )}
                    {lastUsedModel && (
                      <Badge variant="secondary" className="text-xs">
                        {lastUsedModel}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 min-h-[200px] max-h-[600px] overflow-y-auto">
                  {streamingOutput ? (
                    <MarkdownRenderer content={streamingOutput} />
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Waiting for response...
                    </div>
                  )}
                  
                  {isStreaming && (
                    <div className="inline-block w-2 h-5 bg-blue-600 animate-pulse ml-1"></div>
                  )}
                </div>
                
                {streamingComplete && streamingOutput && (
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">
                        Streaming completed in {formatTime(streamingTime)}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Live Chat Example Tab */}
        <TabsContent value="chat" className="space-y-6">
          <StreamingChatExample />
        </TabsContent>
      </Tabs>

      {/* Benefits Section */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">Benefits of Real-time Streaming</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-green-600 mt-1" />
              <div>
                <h4 className="font-semibold text-green-800">Immediate Feedback</h4>
                <p className="text-sm text-green-700">
                  Users see responses as they're generated, providing instant engagement
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MessageCircle className="h-5 w-5 text-blue-600 mt-1" />
              <div>
                <h4 className="font-semibold text-blue-800">Enhanced User Experience</h4>
                <p className="text-sm text-blue-700">
                  More natural, conversation-like interaction with the AI
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-purple-600 mt-1" />
              <div>
                <h4 className="font-semibold text-purple-800">Perceived Performance</h4>
                <p className="text-sm text-purple-700">
                  Responses feel faster even for complex queries
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Brain className="h-5 w-5 text-orange-600 mt-1" />
              <div>
                <h4 className="font-semibold text-orange-800">Real-time Learning</h4>
                <p className="text-sm text-orange-700">
                  Students can follow the AI's thought process as it develops
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StreamingDemo;
