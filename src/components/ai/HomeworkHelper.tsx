import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAI } from '@/hooks/useAI';
import MarkdownRenderer from '@/components/ui/markdown-renderer';
import { GraduationCap, Loader2, BookOpen } from 'lucide-react';

const HomeworkHelper = () => {
  const [question, setQuestion] = useState('');
  const [subject, setSubject] = useState('');
  const [explanation, setExplanation] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [partialExplanation, setPartialExplanation] = useState('');
  const isMountedRef = useRef(true);
  const resultRef = useRef<HTMLDivElement>(null);

  const { getHomeworkHelp, loading } = useAI();

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
    
    try {
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
      }
    } catch (error) {
      console.error('Error getting homework help:', error);
      if (isMountedRef.current) {
        setExplanation("An error occurred while generating your explanation. Please try again with a different question.");
      }
    } finally {
      if (isMountedRef.current) {
        setIsGenerating(false);
        setPartialExplanation('');
      }
    }
  };

  const clearForm = () => {
    setQuestion('');
    setSubject('');
    setExplanation('');
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
                {processingStage || "Getting Help..."}
              </>
            ) : (
              <>
                <BookOpen className="mr-2 h-4 w-4" />
                Get Step-by-Step Help
              </>
            )}
          </Button>
          
          {explanation && (
            <Button variant="outline" onClick={clearForm}>
              Ask New Question
            </Button>
          )}
        </div>

        {/* Loading Indicator with Progressive Content */}
        {isGenerating && partialExplanation && (
          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" ref={resultRef}>
            <CardContent className="pt-6">
              <MarkdownRenderer 
                content={partialExplanation} 
                className="text-green-800 dark:text-green-300"
              />
              <div className="flex items-center mt-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2 text-green-700 dark:text-green-400" />
                <span className="text-sm text-green-700 dark:text-green-400">{processingStage}</span>
              </div>
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