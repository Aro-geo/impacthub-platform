import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import LearningAnalytics from '@/components/simple-lessons/LearningAnalytics';
import LessonsSection from '@/components/simple-lessons/LessonsSection';
import { 
  BarChart3, 
  BookOpen, 
  Target, 
  TrendingUp,
  Calendar,
  Award
} from 'lucide-react';

const LearningDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Learning Dashboard</h2>
            <p className="text-muted-foreground mb-6">
              Please sign in to access your personalized learning dashboard and track your progress.
            </p>
            <Button onClick={() => window.location.href = '/auth'}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Learning Dashboard</h1>
        <p className="text-muted-foreground">
          Track your progress, analyze your learning patterns, and discover new lessons.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="lessons" className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4" />
            <span>Lessons</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Stats */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Learning Overview</span>
                </CardTitle>
                <CardDescription>
                  Your learning progress at a glance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LearningAnalytics />
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full" 
                  onClick={() => setActiveTab('lessons')}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Browse Lessons
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setActiveTab('analytics')}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.location.href = '/profile'}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Learning Goals
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Lessons Preview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Continue Learning</CardTitle>
                  <CardDescription>
                    Pick up where you left off or start something new
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab('lessons')}
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <LessonsSection showSearch={false} maxLessons={6} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lessons" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>All Lessons</span>
              </CardTitle>
              <CardDescription>
                Explore and continue your learning journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LessonsSection />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Learning Analytics</span>
              </CardTitle>
              <CardDescription>
                Detailed insights into your learning patterns and progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LearningAnalytics />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LearningDashboard;