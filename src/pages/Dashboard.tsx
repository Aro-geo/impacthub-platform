
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAI } from '@/hooks/useAI';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { 
  TrendingUp, 
  Users, 
  Globe, 
  Award, 
  Target, 
  Calendar, 
  MessageSquare,
  Brain,
  BookOpen,
  Mic,
  Zap,
  Play,
  Star,
  Clock,
  Heart,
  Sparkles,
  Flame
} from 'lucide-react';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { getUserStats } = useAI();
  const navigate = useNavigate();
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

  const stats = [
    { label: 'Impact Points', value: '0', icon: Award, color: 'text-blue-600' },
    { label: 'Lessons Completed', value: '0', icon: BookOpen, color: 'text-green-600' },
    { label: 'AI Interactions', value: aiStats?.totalInteractions?.toString() || '0', icon: Brain, color: 'text-purple-600' },
    { label: 'Quizzes Attempted', value: '0', icon: Target, color: 'text-green-600' },
    { label: 'Day Streak', value: '0', icon: Flame, color: 'text-orange-600' },
    { label: 'Community Connections', value: '0', icon: Users, color: 'text-indigo-600' },
  ];

  const quickActions = [
    {
      title: 'AI Learning Tools',
      description: 'Access advanced AI-powered learning features',
      icon: Brain,
      color: 'bg-blue-500',
      action: () => navigate('/ai-dashboard')
    },
    {
      title: 'Simple Lessons',
      description: 'Visual, voice-guided lessons for all levels',
      icon: BookOpen,
      color: 'bg-green-500',
      action: () => navigate('/simple-lessons')
    },
    {
      title: 'Voice Practice',
      description: 'Practice speaking with AI feedback',
      icon: Mic,
      color: 'bg-purple-500',
      action: () => setActiveTab('practice')
    },
    {
      title: 'Community',
      description: 'Connect with learners and mentors',
      icon: Users,
      color: 'bg-orange-500',
      action: () => navigate('/community')
    }
  ];

  const recentLessons = [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xl">
                {user?.user_metadata?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-heading font-bold text-foreground">
                Dashboard
              </h1>
              <p className="text-muted-foreground text-lg">Track your learning progress and achievements</p>
            </div>
          </div>
        </div>
        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:scale-105 border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 ${stat.color}`}>
                    <stat.icon className="h-7 w-7" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border-0 shadow-md" onClick={action.action}>
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 ${action.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <action.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="lessons">Lessons</TabsTrigger>
            <TabsTrigger value="practice">Practice</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Your Learning Journey
                    </CardTitle>
                    <CardDescription>
                      Track your progress across all platforms
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">🚀</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Your Learning Journey</h3>
                        <p className="text-gray-600 mb-6">Begin exploring our AI-powered tools and track your progress</p>
                        <div className="grid md:grid-cols-2 gap-4">
                          <Button onClick={() => navigate('/ai-dashboard')} className="bg-blue-600 hover:bg-blue-700">
                            <Brain className="mr-2 h-4 w-4" />
                            Try AI Tools
                          </Button>
                          <Button variant="outline" onClick={() => navigate('/simple-lessons')}>
                            <BookOpen className="mr-2 h-4 w-4" />
                            Browse Lessons
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Recent Lessons
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentLessons.length > 0 ? (
                        recentLessons.map((lesson, index) => (
                          <div key={index} className="p-3 hover:bg-gray-50 rounded-lg transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900 text-sm">{lesson.title}</h4>
                              <Badge variant="outline" className="text-xs">{lesson.type}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Clock className="h-3 w-3" />
                                {lesson.duration}
                              </div>
                              <div className="text-xs font-medium text-green-600">
                                {lesson.progress}%
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full"
                                style={{ width: `${lesson.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 text-sm">No lessons completed yet</p>
                          <p className="text-gray-400 text-xs">Start learning to see your progress here</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="mt-6 border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Your Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                            <Award className="h-5 w-5 text-yellow-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Badges Earned</p>
                            <p className="text-sm text-gray-600">Learning milestones</p>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-yellow-600">0</div>
                      </div>
                      <div className="text-center py-4">
                        <Award className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No badges yet</p>
                        <p className="text-gray-400 text-xs">Complete lessons to earn your first badge</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="lessons">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Continue Learning</CardTitle>
                <CardDescription>Pick up where you left off or start something new</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl cursor-pointer hover:shadow-lg transition-shadow">
                    <div className="text-4xl mb-3">🎓</div>
                    <h3 className="font-semibold mb-2">AI Learning Tools</h3>
                    <p className="text-sm text-gray-600 mb-3">Advanced AI-powered learning features</p>
                    <Button size="sm" onClick={() => navigate('/ai-dashboard')}>
                      <Brain className="mr-2 h-4 w-4" />
                      Explore
                    </Button>
                  </div>
                  
                  <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl cursor-pointer hover:shadow-lg transition-shadow">
                    <div className="text-4xl mb-3">📚</div>
                    <h3 className="font-semibold mb-2">Simple Lessons</h3>
                    <p className="text-sm text-gray-600 mb-3">Visual, voice-guided learning</p>
                    <Button size="sm" onClick={() => navigate('/simple-lessons')}>
                      <Play className="mr-2 h-4 w-4" />
                      Start
                    </Button>
                  </div>
                  
                  <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl cursor-pointer hover:shadow-lg transition-shadow">
                    <div className="text-4xl mb-3">🎤</div>
                    <h3 className="font-semibold mb-2">Voice Practice</h3>
                    <p className="text-sm text-gray-600 mb-3">Speaking practice with AI feedback</p>
                    <Button size="sm">
                      <Mic className="mr-2 h-4 w-4" />
                      Practice
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="practice">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Practice & Improve</CardTitle>
                <CardDescription>Interactive practice sessions to reinforce your learning</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎯</div>
                  <h3 className="text-xl font-semibold mb-2">Practice Features Coming Soon</h3>
                  <p className="text-gray-600 mb-6">Interactive practice sessions, quizzes, and speaking exercises</p>
                  <Button onClick={() => navigate('/ai-dashboard')}>
                    <Zap className="mr-2 h-4 w-4" />
                    Try AI Tools Instead
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="community">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Community & Mentorship</CardTitle>
                <CardDescription>Connect with learners and mentors worldwide</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🌍</div>
                  <h3 className="text-xl font-semibold mb-2">Community Features Coming Soon</h3>
                  <p className="text-gray-600 mb-6">Mentorship matching, learning groups, and global connections</p>
                  <Button onClick={() => navigate('/ai-dashboard')}>
                    <Users className="mr-2 h-4 w-4" />
                    Explore AI Community Tools
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
