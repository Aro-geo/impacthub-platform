import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { 
  Brain, 
  FileQuestion, 
  GraduationCap, 
  Leaf, 
  Users, 
  MessageSquare,
  Sparkles,
  TrendingUp,
  Target,
  Award,
  Accessibility
} from 'lucide-react';

// Import AI Components
import LearningPathGenerator from '@/components/ai/LearningPathGenerator';
import QuizCreator from '@/components/ai/QuizCreator';
import HomeworkHelper from '@/components/ai/HomeworkHelper';
import SustainabilityCalculator from '@/components/ai/SustainabilityCalculator';
import MentorshipMatcher from '@/components/ai/MentorshipMatcher';
import CommunityForum from '@/components/ai/CommunityForum';
import AccessibilityTools from '@/components/ai/AccessibilityTools';

const AIDashboard = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

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

  const stats = [
    { label: 'AI Interactions', value: '127', icon: Sparkles, color: 'text-blue-600' },
    { label: 'Learning Hours', value: '48', icon: TrendingUp, color: 'text-green-600' },
    { label: 'Goals Achieved', value: '12', icon: Target, color: 'text-purple-600' },
    { label: 'Impact Points', value: '1,250', icon: Award, color: 'text-orange-600' },
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
            Welcome back, {user?.user_metadata?.name || 'Impact Maker'}! 
            Ready to explore AI-powered social impact tools?
          </p>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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
            {/* Stats Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                      <div className={`p-3 rounded-full bg-gray-50 ${stat.color}`}>
                        <stat.icon className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

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
                    onClick={() => setActiveTab(feature.id)}
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
                    onClick={() => setActiveTab('learning-path')}
                  >
                    <Brain className="h-6 w-6" />
                    Generate Learning Path
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col gap-2"
                    onClick={() => setActiveTab('sustainability')}
                  >
                    <Leaf className="h-6 w-6" />
                    Calculate Impact
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col gap-2"
                    onClick={() => setActiveTab('forum')}
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
            <CommunityForum />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AIDashboard;