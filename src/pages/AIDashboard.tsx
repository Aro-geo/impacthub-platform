import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useAI } from '@/hooks/useAI';
import { aiTrackingService } from '@/services/aiTrackingService';
import { toast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import {
  Brain,
  FileQuestion,
  GraduationCap,
  Leaf,
  Users,
  MessageSquare,
  Accessibility
} from 'lucide-react';

// Import AI Components
import LearningPathGenerator from '@/components/ai/LearningPathGenerator';
import QuizCreator from '@/components/ai/QuizCreator';
import HomeworkHelper from '@/components/ai/HomeworkHelper';
import SustainabilityCalculator from '@/components/ai/SustainabilityCalculator';
import MentorshipMatcher from '@/components/ai/MentorshipMatcher';
import OptimizedUnifiedCommunityForum from '@/components/shared/OptimizedUnifiedCommunityForum';
import AccessibilityTools from '@/components/ai/AccessibilityTools';

const AIDashboard = () => {
  const { user, signOut } = useAuth();
  const { getUserStats } = useAI();
  const [activeTab, setActiveTab] = useState('overview');
  const [aiStats, setAiStats] = useState<any>(null);
  const [trackingInteraction, setTrackingInteraction] = useState(false);

  useEffect(() => {
    const fetchAIStats = async () => {
      if (user) {
        const stats = await getUserStats();
        setAiStats(stats);
      }
    };

    fetchAIStats();
  }, [user, getUserStats]);

  // Function to handle AI tool interactions
  const handleToolInteraction = async (toolId: string, toolName: string) => {
    if (!user) {
      setActiveTab(toolId);
      return;
    }

    try {
      setTrackingInteraction(true);

      // Map tool IDs to interaction types
      const interactionTypeMap: Record<string, string> = {
        'learning-path': 'learning_path_generation',
        'quiz-creator': 'quiz_creation',
        'homework-helper': 'homework_help',
        'accessibility': 'alt_text_generation',
        'sustainability': 'sustainability_impact',
        'mentorship': 'mentorship_matching',
        'forum': 'sentiment_analysis'
      };

      const interactionType = interactionTypeMap[toolId];
      if (interactionType) {
        // Record the tool access interaction
        const interactionId = await aiTrackingService.startInteraction(
          user.id,
          interactionType as any,
          {
            tool_accessed: toolName,
            access_method: 'dashboard_card',
            timestamp: new Date().toISOString()
          }
        );

        // Mark as completed immediately for tool access
        await aiTrackingService.completeInteraction(
          interactionId,
          { tool_opened: toolName },
          50, // Small processing time for tool access
          0 // No tokens used for tool access
        );

        // Refresh stats to show updated interaction count
        const updatedStats = await getUserStats();
        setAiStats(updatedStats);

        // Show success toast (only in development)
        if (process.env.NODE_ENV === 'development') {
          toast({
            title: "Tool Access Recorded",
            description: `Your interaction with ${toolName} has been tracked.`,
            duration: 2000,
          });
        }
      }
    } catch (error) {
      console.error('Error tracking tool interaction:', error);
    } finally {
      setTrackingInteraction(false);
    }

    // Switch to the tool tab
    setActiveTab(toolId);
  };

  const aiFeatures = [
    {
      id: 'learning-path',
      title: 'Learning Path Generator',
      description: 'Get personalized learning recommendations based on your skills and interests',
      icon: Brain,
      category: 'Education',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'quiz-creator',
      title: 'AI Quiz Creator',
      description: 'Generate interactive quizzes from any text content',
      icon: FileQuestion,
      category: 'Education',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      id: 'homework-helper',
      title: 'Homework Helper',
      description: 'Get step-by-step explanations for your questions',
      icon: GraduationCap,
      category: 'Education',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 'accessibility',
      title: 'Accessibility Tools',
      description: 'Text-to-speech, translation, and alt text generation',
      icon: Accessibility,
      category: 'Accessibility',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      id: 'sustainability',
      title: 'Impact Calculator',
      description: 'Track your environmental impact and CO₂ savings',
      icon: Leaf,
      category: 'Sustainability',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      id: 'mentorship',
      title: 'Mentorship Matcher',
      description: 'Find perfect mentor-mentee matches using AI',
      icon: Users,
      category: 'Community',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      id: 'forum',
      title: 'Smart Community Forum',
      description: 'AI-powered discussions with sentiment analysis',
      icon: MessageSquare,
      category: 'Community',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    }
  ];



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Navigation />

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
          if (value !== 'overview' && value !== activeTab) {
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
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="learning-path">Learning Path</TabsTrigger>
            <TabsTrigger value="quiz-creator">Quiz Creator</TabsTrigger>
            <TabsTrigger value="homework-helper">Homework Help</TabsTrigger>
            <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
            <TabsTrigger value="sustainability">Sustainability</TabsTrigger>
            <TabsTrigger value="mentorship">Mentorship</TabsTrigger>
            <TabsTrigger value="forum">Forum</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* AI Features Grid */}
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">
                  AI-Powered Impact Tools
                </h2>
                <p className="text-gray-600">
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
                      <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{feature.description}</p>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded-full ${feature.bgColor} ${feature.color} font-medium`}>
                          {feature.category}
                        </span>
                        <Button variant="ghost" size="sm" className="group-hover:bg-gray-100">
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
                <div className="grid md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-2"
                    onClick={() => handleToolInteraction('learning-path', 'Learning Path Generator')}
                  >
                    <Brain className="h-6 w-6" />
                    Generate Learning Path
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-2"
                    onClick={() => handleToolInteraction('sustainability', 'Impact Calculator')}
                  >
                    <Leaf className="h-6 w-6" />
                    Calculate Impact
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-2"
                    onClick={() => handleToolInteraction('forum', 'Smart Community Forum')}
                  >
                    <MessageSquare className="h-6 w-6" />
                    Join Discussion
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

          <TabsContent value="mentorship">
            <MentorshipMatcher />
          </TabsContent>

          <TabsContent value="forum">
            <OptimizedUnifiedCommunityForum
              context="ai-tools"
              title="AI Community Forum"
              description="Discuss AI tools, get help, and share insights"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AIDashboard;