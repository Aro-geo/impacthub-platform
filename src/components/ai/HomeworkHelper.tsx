import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useAI } from '@/hooks/useAI';
import MarkdownRenderer from '@/components/ui/markdown-renderer';
import { GraduationCap, Loader2, BookOpen, Zap } from 'lucide-react';

const HomeworkHelper = () => {
  const [question, setQuestion] = useState('');
  const [subject, setSubject] = useState('');
  const [explanation, setExplanation] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [partialExplanation, setPartialExplanation] = useState('');
  const [useStreaming, setUseStreaming] = useState(true); // New state for streaming toggle
  const [streamingResponse, setStreamingResponse] = useState(''); // Current streaming response
  const isMountedRef = useRef(true);
  const resultRef = useRef<HTMLDivElement>(null);

  const { getHomeworkHelp, streamHomeworkHelp, loading } = useAI();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Scroll to results when explanation is available
  useEffect(() => {
    if (explanation && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [explanation]);

  // Update processing stage for visual feedback
  useEffect(() => {
    if (isGenerating) {
      const stages = [
        "Analyzing your question...",
        "Researching subject matter...",
        "Formulating step-by-step explanation...",
        "Reviewing and refining answer...",
        "Finalizing response..."
      ];
      
      let currentStage = 0;
      const stageInterval = setInterval(() => {
        if (currentStage < stages.length) {
          setProcessingStage(stages[currentStage]);
          currentStage++;
        } else {
          clearInterval(stageInterval);
        }
      }, 1200);
      
      return () => clearInterval(stageInterval);
    } else {
      setProcessingStage('');
    }
  }, [isGenerating]);

  const subjects = [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'English',
    'History',
    'Geography',
    'Computer Science',
    'Economics',
    'Psychology',
    'Philosophy',
    'Art',
    'Music',
    'Social Studies',
    'General Science',
    'Kiswahili',
    'Other'
  ];

  const handleGetHelp = async () => {
    if (!question.trim() || !subject) return;
    
    setIsGenerating(true);
    setExplanation('');
    setPartialExplanation('');
    setStreamingResponse('');
    
    try {
      if (useStreaming) {
        // Use streaming mode
        await streamHomeworkHelp(
          question,
          subject,
          {
            onToken: (token) => {
              if (isMountedRef.current) {
                setStreamingResponse(prev => prev + token);
              }
            },
            onComplete: (response) => {
              if (isMountedRef.current) {
                setExplanation(response);
                setStreamingResponse('');
                setIsGenerating(false);
              }
            },
            onError: (error) => {
              console.error('Streaming error:', error);
              if (isMountedRef.current) {
                setExplanation("An error occurred while generating your explanation. Please try again with a different question.");
                setStreamingResponse('');
                setIsGenerating(false);
              }
            }
          }
        );
      } else {
        // Use traditional mode
        // Start the explanation generation process
        const resultPromise = getHomeworkHelp(question, subject);
        
        // Show progressive feedback while waiting for the result
        // Simulate incremental content building
        setTimeout(() => {
          if (isMountedRef.current && !explanation) {
            setPartialExplanation('*Analyzing your homework question...*\n\n');
          }
        }, 800);
        
        setTimeout(() => {
          if (isMountedRef.current && !explanation) {
            setPartialExplanation(prev => prev + '*Preparing step-by-step explanation for your ' + subject + ' question...*\n\n');
          }
        }, 2000);
        
        // Wait for the actual result
        const result = await resultPromise;
        
        if (isMountedRef.current) {
          if (result) {
            setExplanation(result);
          } else {
            setExplanation("I'm sorry, I couldn't generate a helpful explanation for this question. Please try rephrasing your question or providing more context.");
          }
          setIsGenerating(false);
          setPartialExplanation('');
        }
      }
    } catch (error) {
      console.error('Error getting homework help:', error);
      if (isMountedRef.current) {
        setExplanation("An error occurred while generating your explanation. Please try again with a different question.");
        setIsGenerating(false);
        setPartialExplanation('');
        setStreamingResponse('');
      }
    }
  };

  const clearForm = () => {
    setQuestion('');
    setSubject('');
    setExplanation('');
    setStreamingResponse('');
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-green-600" />
          AI Homework Helper
        </CardTitle>
        <CardDescription>
          Get step-by-step explanations for your homework questions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Subject Selection */}
        <div className="space-y-3">
          <Label>Subject</Label>
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger>
              <SelectValue placeholder="Select the subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subj) => (
                <SelectItem key={subj} value={subj}>
                  {subj}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Question Input */}
        <div className="space-y-3">
          <Label>Your Question</Label>
          <Textarea
            placeholder="Enter your homework question here. Be as specific as possible for better help..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={6}
            className="resize-none"
          />
          <div className="text-sm text-muted-foreground">
            Tip: Include any relevant formulas, context, or specific parts you're struggling with
          </div>
        </div>

        {/* Streaming Toggle */}
        <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-blue-600" />
            <div>
              <Label className="text-sm font-medium">Real-time Streaming</Label>
              <p className="text-xs text-muted-foreground">
                See the explanation as it's generated, token by token
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={useStreaming}
              onCheckedChange={setUseStreaming}
              disabled={isGenerating}
            />
            {useStreaming && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                Live
              </Badge>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            onClick={handleGetHelp}
            disabled={isGenerating || loading || !question.trim() || !subject}
            className="flex-1"
          >
            {isGenerating || loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {useStreaming ? "Streaming explanation..." : (processingStage || "Getting Help...")}
              </>
            ) : (
              <>
                {useStreaming ? <Zap className="mr-2 h-4 w-4" /> : <BookOpen className="mr-2 h-4 w-4" />}
                {useStreaming ? "Stream Step-by-Step Help" : "Get Step-by-Step Help"}
              </>
            )}
          </Button>
          
          {explanation && (
            <Button variant="outline" onClick={clearForm}>
              Ask New Question
            </Button>
          )}
        </div>

        {/* Loading Indicator with Progressive Content or Streaming Response */}
        {isGenerating && (
          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" ref={resultRef}>
            <CardContent className="pt-6">
              {useStreaming && streamingResponse ? (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-700 dark:text-green-400 font-medium">
                      Streaming live response...
                    </span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                      <Zap className="h-3 w-3 mr-1" />
                      Live
                    </Badge>
                  </div>
                  <MarkdownRenderer 
                    content={streamingResponse} 
                    className="text-green-800 dark:text-green-300"
                  />
                  <div className="inline-block w-2 h-4 bg-green-600 animate-pulse ml-1"></div>
                </div>
              ) : partialExplanation ? (
                <div>
                  <MarkdownRenderer 
                    content={partialExplanation} 
                    className="text-green-800 dark:text-green-300"
                  />
                  <div className="flex items-center mt-4">
                    <Loader2 className="h-4 w-4 animate-spin mr-2 text-green-700 dark:text-green-400" />
                    <span className="text-sm text-green-700 dark:text-green-400">{processingStage}</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2 text-green-700 dark:text-green-400" />
                  <span className="text-sm text-green-700 dark:text-green-400">
                    {useStreaming ? "Initializing streaming..." : "Preparing your explanation..."}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Explanation Display */}
        {!isGenerating && explanation && (
          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" ref={resultRef}>
            <CardContent className="pt-6">
              <MarkdownRenderer 
                content={explanation} 
                className="text-green-800 dark:text-green-300"
              />
            </CardContent>
          </Card>
        )}

        {/* Tips Section */}
        <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <CardContent className="pt-6">
            <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-3">Tips for Better Help:</h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Be specific about what part you don't understand</li>
              <li>• Include any work you've already done</li>
              <li>• Mention if you need help with concepts or just calculations</li>
              <li>• Ask follow-up questions if something isn't clear</li>
            </ul>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default HomeworkHelper;