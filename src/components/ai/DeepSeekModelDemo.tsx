import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAI } from '@/hooks/useAI';
import MarkdownRenderer from '@/components/ui/markdown-renderer';
import { Brain, MessageCircle, Loader2, Zap, Calculator, Lightbulb, BookOpen } from 'lucide-react';

const DeepSeekModelDemo = () => {
  const [selectedDemo, setSelectedDemo] = useState<string>('');
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUsedModel, setLastUsedModel] = useState<string>('');
  
  const {
    solveComplexProblem,
    provideMathematicalReasoning,
    engageInConversationalLearning,
    generateCreativeContent
  } = useAI();

  const demoOptions = [
    {
      id: 'complex_reasoning',
      title: 'Complex Problem Solving',
      description: 'Uses deepseek-reasoner for advanced logical reasoning and analysis',
      model: 'deepseek-reasoner',
      icon: Brain,
      placeholder: 'Describe a complex problem you need help solving (e.g., "How can a small city reduce its carbon footprint by 30% in 5 years while maintaining economic growth?")',
      color: 'bg-purple-100 text-purple-800 border-purple-200'
    },
    {
      id: 'mathematical_reasoning', 
      title: 'Mathematical Reasoning',
      description: 'Uses deepseek-reasoner for step-by-step mathematical problem solving',
      model: 'deepseek-reasoner',
      icon: Calculator,
      placeholder: 'Enter a mathematical problem (e.g., "Solve for x: 2x² + 5x - 3 = 0 and explain each step")',
      color: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    {
      id: 'conversational_learning',
      title: 'Conversational Learning',
      description: 'Uses deepseek-chat for friendly, engaging educational conversations',
      model: 'deepseek-chat',
      icon: MessageCircle,
      placeholder: 'Start a learning conversation (e.g., "I\'m curious about how photosynthesis works but I find biology confusing")',
      color: 'bg-green-100 text-green-800 border-green-200'
    },
    {
      id: 'creative_content',
      title: 'Creative Content Generation',
      description: 'Uses deepseek-chat for engaging, original content creation',
      model: 'deepseek-chat',
      icon: Lightbulb,
      placeholder: 'Describe the content you need (e.g., "Create an engaging social media post about renewable energy for teenagers")',
      color: 'bg-orange-100 text-orange-800 border-orange-200'
    }
  ];

  const selectedDemoConfig = demoOptions.find(demo => demo.id === selectedDemo);

  const handleDemo = async () => {
    if (!selectedDemo || !input.trim()) return;
    
    setIsLoading(true);
    setResult('');
    
    try {
      let response = '';
      
      switch (selectedDemo) {
        case 'complex_reasoning':
          response = await solveComplexProblem(input, 'general');
          setLastUsedModel('deepseek-reasoner');
          break;
          
        case 'mathematical_reasoning':
          response = await provideMathematicalReasoning(input, 'high');
          setLastUsedModel('deepseek-reasoner');
          break;
          
        case 'conversational_learning':
          response = await engageInConversationalLearning('General Learning', input, 'intermediate');
          setLastUsedModel('deepseek-chat');
          break;
          
        case 'creative_content':
          response = await generateCreativeContent('social media post', input, 'general audience');
          setLastUsedModel('deepseek-chat');
          break;
          
        default:
          throw new Error('Unknown demo type');
      }
      
      setResult(response || 'No response received');
    } catch (error) {
      console.error('Demo error:', error);
      setResult('Sorry, there was an error processing your request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetDemo = () => {
    setInput('');
    setResult('');
    setSelectedDemo('');
    setLastUsedModel('');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="flex">
              <Brain className="w-6 h-6 text-purple-600" />
              <MessageCircle className="w-6 h-6 text-blue-600 -ml-2" />
            </div>
            DeepSeek AI Models Demo
          </CardTitle>
          <CardDescription className="text-lg">
            Experience the power of DeepSeek's two specialized AI models: 
            <span className="font-semibold text-purple-700"> deepseek-reasoner</span> for complex reasoning and 
            <span className="font-semibold text-blue-700"> deepseek-chat</span> for conversational interactions.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Model Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Choose a Demo</CardTitle>
          <CardDescription>
            Each demo showcases different AI capabilities using the optimal DeepSeek model for that task.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {demoOptions.map((demo) => {
              const Icon = demo.icon;
              const isSelected = selectedDemo === demo.id;
              
              return (
                <Card 
                  key={demo.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'ring-2 ring-primary bg-primary/5' 
                      : 'hover:shadow-md hover:scale-105'
                  }`}
                  onClick={() => setSelectedDemo(demo.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Icon className="w-5 h-5 mt-1 text-primary" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{demo.title}</h3>
                          <Badge className={demo.color}>
                            {demo.model}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{demo.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Input Section */}
      {selectedDemo && selectedDemoConfig && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <selectedDemoConfig.icon className="w-5 h-5" />
              {selectedDemoConfig.title}
              <Badge className={selectedDemoConfig.color}>
                {selectedDemoConfig.model}
              </Badge>
            </CardTitle>
            <CardDescription>
              {selectedDemoConfig.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={selectedDemoConfig.placeholder}
                rows={4}
                className="resize-none"
              />
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={handleDemo}
                disabled={!input.trim() || isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing with {selectedDemoConfig.model}...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Try {selectedDemoConfig.title}
                  </>
                )}
              </Button>
              
              <Button variant="outline" onClick={resetDemo}>
                Reset Demo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              AI Response
              {lastUsedModel && (
                <Badge className={
                  lastUsedModel === 'deepseek-reasoner' 
                    ? 'bg-purple-100 text-purple-800 border-purple-200'
                    : 'bg-blue-100 text-blue-800 border-blue-200'
                }>
                  Generated by {lastUsedModel}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {lastUsedModel === 'deepseek-reasoner' 
                ? 'This response demonstrates advanced reasoning and analytical capabilities.'
                : 'This response showcases conversational and creative capabilities.'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 rounded-lg p-4">
              <MarkdownRenderer content={result} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Model Comparison Info */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle>Model Capabilities Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-purple-800">deepseek-reasoner</h3>
              </div>
              <ul className="space-y-1 text-sm">
                <li>• Complex problem solving and analysis</li>
                <li>• Mathematical reasoning and proofs</li>
                <li>• Scientific analysis and logic</li>
                <li>• Critical thinking and deduction</li>
                <li>• Academic research and planning</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-800">deepseek-chat</h3>
              </div>
              <ul className="space-y-1 text-sm">
                <li>• Natural conversations and tutoring</li>
                <li>• Creative content generation</li>
                <li>• Language tasks and translation</li>
                <li>• Social interactions and matching</li>
                <li>• Accessibility and user assistance</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeepSeekModelDemo;
