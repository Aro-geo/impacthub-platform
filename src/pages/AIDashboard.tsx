import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useAI } from '@/hooks/useAI';
import { aiTrackingService } from '@/services/aiTrackingService';
import {
  Brain,
  FileQuestion,
  GraduationCap,
  Leaf,
  Users,
  Accessibility,
  Zap
} from 'lucide-react';

// Import AI Components
import LearningPathGenerator from '@/components/ai/LearningPathGenerator';
import QuizCreator from '@/components/ai/QuizCreator';
import HomeworkHelper from '@/components/ai/HomeworkHelper';
import SustainabilityCalculator from '@/components/ai/SustainabilityCalculator';
import AccessibilityTools from '@/components/ai/AccessibilityTools';


const AIDashboard = () => {
  const { user, signOut } = useAuth();
  const { getUserStats } = useAI();
  const [activeTab, setActiveTab] = useState('overview');
  const [aiStats, setAiStats] = useState<any>(null);

  useEffect(() => {
    const fetchAIStats = async () => {
      if (user) {
        const stats = await getUserStats();
        setAiStats(stats);
      }
    };

    fetchAIStats();
  }, [user, getUserStats]);

  // Function to handle AI tool interactions (simplified - no popup notifications)
  const handleToolInteraction = async (toolId: string, toolName: string) => {
    // Switch to the tool tab immediately for better performance
    setActiveTab(toolId);

    // Don't track just opening tools - only track when AI actually generates content
    // The individual AI components will handle their own interaction tracking
    // when they actually use AI to generate responses
    
    console.log(`Opened ${toolName} tool`);
  };

  const aiFeatures = [
    {
      id: 'learning-path',
      title: 'Learning Path Generator',
      description: 'Get personalized learning recommendations based on your skills and interests',
      icon: Brain,
      category: 'Education',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      id: 'quiz-creator',
      title: 'AI Quiz Creator',
      description: 'Generate interactive quizzes from any text content',
      icon: FileQuestion,
      category: 'Education',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      id: 'homework-helper',
      title: 'Homework Helper',
      description: 'Get step-by-step explanations for your questions',
      icon: GraduationCap,
      category: 'Education',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      id: 'accessibility',
      title: 'Accessibility Tools',
      description: 'Text-to-speech, translation, and alt text generation',
      icon: Accessibility,
      category: 'Accessibility',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      id: 'sustainability',
      title: 'Impact Calculator',
      description: 'Track your environmental impact and CO₂ savings',
      icon: Leaf,
      category: 'Sustainability',
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20'
    }
  ];



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold text-foreground mb-2">
            ImpactHub AI
          </h1>
          <p className="text-muted-foreground text-lg">
            Explore AI-powered tools designed to amplify your social impact
          </p>
        </div>
        <Tabs value={activeTab} onValueChange={(value) => {
          // Track interaction when switching tabs directly
          if (value !== 'overview' && value !== activeTab && value !== 'performance') {
            const feature = aiFeatures.find(f => f.id === value);
            if (feature) {
              handleToolInteraction(value, feature.title);
            } else {
              setActiveTab(value);
            }
          } else {
            setActiveTab(value);
          }
        }} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            <TabsTrigger value="overview" className="text-sm sm:text-base">Overview</TabsTrigger>
            <TabsTrigger value="learning-path" className="text-sm sm:text-base">Learning Path</TabsTrigger>
            <TabsTrigger value="quiz-creator" className="text-sm sm:text-base">Quiz Creator</TabsTrigger>
            <TabsTrigger value="homework-helper" className="text-sm sm:text-base">Homework Help</TabsTrigger>
            <TabsTrigger value="accessibility" className="text-sm sm:text-base">Accessibility</TabsTrigger>
            <TabsTrigger value="sustainability" className="text-sm sm:text-base">Sustainability</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* AI Features Grid */}
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
                  AI-Powered Impact Tools
                </h2>
                <p className="text-muted-foreground">
                  Explore our suite of AI tools designed to amplify your social impact
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {aiFeatures.map((feature) => (
                  <Card
                    key={feature.id}
                    className="hover:shadow-lg transition-all duration-300 cursor-pointer group"
                    onClick={() => handleToolInteraction(feature.id, feature.title)}
                  >
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <feature.icon className={`h-6 w-6 ${feature.color}`} />
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{feature.description}</p>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded-full ${feature.bgColor} ${feature.color} font-medium`}>
                          {feature.category}
                        </span>
                        <Button variant="ghost" size="sm" className="group-hover:bg-muted/30">
                          Try Now →
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Jump into your most-used AI tools
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 p-2 sm:p-0">
                  <Button
                    variant="outline"
                    className="h-auto py-4 sm:h-20 flex-col gap-2"
                    onClick={() => handleToolInteraction('learning-path', 'Learning Path Generator')}
                  >
                    <Brain className="h-6 w-6" />
                    Generate Learning Path
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 sm:h-20 flex-col gap-2"
                    onClick={() => handleToolInteraction('sustainability', 'Impact Calculator')}
                  >
                    <Leaf className="h-6 w-6" />
                    Calculate Impact
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Feature Tabs */}
          <TabsContent value="learning-path">
            <LearningPathGenerator />
          </TabsContent>

          <TabsContent value="quiz-creator">
            <QuizCreator />
          </TabsContent>

          <TabsContent value="homework-helper">
            <HomeworkHelper />
          </TabsContent>

          <TabsContent value="accessibility">
            <AccessibilityTools />
          </TabsContent>

          <TabsContent value="sustainability">
            <SustainabilityCalculator />
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
};

export default AIDashboard;