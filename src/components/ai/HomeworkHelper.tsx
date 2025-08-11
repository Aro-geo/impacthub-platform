import React, { useState } from 'react';
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

  const { getHomeworkHelp, loading } = useAI();

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

    const result = await getHomeworkHelp(question, subject);
    if (result) {
      setExplanation(result);
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
          <div className="text-sm text-gray-500">
            Tip: Include any relevant formulas, context, or specific parts you're struggling with
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            onClick={handleGetHelp}
            disabled={loading || !question.trim() || !subject}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Getting Help...
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

        {/* Explanation Display */}
        {explanation && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <MarkdownRenderer 
                content={explanation} 
                className="text-green-800"
              />
            </CardContent>
          </Card>
        )}

        {/* Tips Section */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h4 className="font-semibold text-blue-900 mb-3">Tips for Better Help:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
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