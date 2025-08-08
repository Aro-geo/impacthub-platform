
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
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
  Sparkles
} from 'lucide-react';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    { label: 'Impact Points', value: '1,250', icon: Award, color: 'text-blue-600' },
    { label: 'Lessons Completed', value: '24', icon: BookOpen, color: 'text-green-600' },
    { label: 'AI Interactions', value: '89', icon: Brain, color: 'text-purple-600' },
    { label: 'Community Connections', value: '15', icon: Users, color: 'text-orange-600' },
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
      action: () => setActiveTab('lessons')
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
      action: () => setActiveTab('community')
    }
  ];

  const recentLessons = [
    { title: 'Basic English Greetings', progress: 100, type: 'English', duration: '5 min' },
    { title: 'AI Learning Path Generator', progress: 75, type: 'AI Tools', duration: '10 min' },
    { title: 'Healthy Eating Basics', progress: 60, type: 'Health', duration: '7 min' },
    { title: 'Voice Q&A Practice', progress: 40, type: 'Speaking', duration: '8 min' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50">
      <div className="bg-white/95 backdrop-blur-sm shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  {user?.user_metadata?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-heading font-bold text-gray-900">
                  Welcome back, {user?.user_metadata?.name || 'Learner'}! 👋
                </h1>
                <p className="text-gray-600">Ready to learn and create impact today?</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => navigate('/ai-dashboard')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Brain className="mr-2 h-4 w-4" />
                AI Tools
              </Button>
              <Button variant="outline" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                        <div>
                          <h3 className="font-semibold text-blue-900">Current Focus</h3>
                          <p className="text-blue-700">AI-Enhanced Learning Path</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-blue-600">Progress</p>
                          <p className="text-3xl font-bold text-blue-900">75%</p>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 bg-green-50 rounded-xl">
                          <h4 className="font-semibold text-green-900 flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            This Week
                          </h4>
                          <p className="text-green-700">12 lessons completed</p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-xl">
                          <h4 className="font-semibold text-purple-900 flex items-center gap-2">
                            <Brain className="h-4 w-4" />
                            AI Interactions
                          </h4>
                          <p className="text-purple-700">25 AI-powered sessions</p>
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
                      {recentLessons.map((lesson, index) => (
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
                      ))}
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
                    <div className="grid grid-cols-2 gap-2">
                      <Badge className="bg-blue-100 text-blue-800 justify-center py-2">
                        🎓 AI Learner
                      </Badge>
                      <Badge className="bg-green-100 text-green-800 justify-center py-2">
                        🌱 Eco Warrior
                      </Badge>
                      <Badge className="bg-purple-100 text-purple-800 justify-center py-2">
                        🤝 Community Helper
                      </Badge>
                      <Badge className="bg-orange-100 text-orange-800 justify-center py-2">
                        🔥 5-Day Streak
                      </Badge>
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
                    <Button size="sm">
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
