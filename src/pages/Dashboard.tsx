
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAI } from '@/hooks/useAI';
import { lessonProgressService } from '@/services/lessonProgressService';
import { achievementsService } from '@/services/achievementsService';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import LearningRecommendations from '@/components/ai/LearningRecommendations';
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
  const { getUserStats } = useAI();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [aiStats, setAiStats] = useState<any>(null);
  const [dashboardStats, setDashboardStats] = useState({
    impactPoints: 0,
    lessonsCompleted: 0,
    quizzesAttempted: 0,
    communityConnections: 0
  });
  const [achievementsData, setAchievementsData] = useState({
    badges: [],
    currentStreak: 0,
    totalAchievements: 0
  });
  const [loading, setLoading] = useState(true);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  useEffect(() => {
    const fetchAllStats = async () => {
      if (!user) return;
      
      // Debounce to prevent multiple rapid calls
      const now = Date.now();
      if (now - lastFetchTime < 2000) { // 2 second debounce
        return;
      }
      setLastFetchTime(now);
      
      setLoading(true);
      try {
        // Fetch all data in a single optimized call to reduce concurrent queries
        await fetchAllStatsOptimized();
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchAllStats, 100); // Small delay to batch multiple effect triggers
    return () => clearTimeout(timeoutId);
  }, [user, getUserStats, lastFetchTime]);

  // Optimized single function to fetch all stats with minimal database calls
  const fetchAllStatsOptimized = async () => {
    if (!user) return;
    
    try {
      // Use Promise.allSettled to prevent one failure from blocking others
      const results = await Promise.allSettled([
        // AI stats
        getUserStats(),
        // Lesson stats
        lessonProgressService.getUserStats(user.id),
        // Achievements and streaks
        achievementsService.getUserAchievements(user.id),
        achievementsService.getUserStreaks(user.id),
        // Combined database query for all counts to reduce concurrent requests
        Promise.all([
          supabase.from('lesson_quiz_attempts').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('community_posts').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('comments').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('ai_interactions' as any).select('id').eq('user_id', user.id),
          supabase.from('profiles').select('impact_points').eq('id', user.id).single()
        ])
      ]);

      // Process AI stats
      if (results[0].status === 'fulfilled') {
        setAiStats(results[0].value);
      }

      // Process lesson stats
      if (results[1].status === 'fulfilled') {
        const lessonStats = results[1].value;
        setDashboardStats(prev => ({
          ...prev,
          lessonsCompleted: lessonStats.completedLessons
        }));
      }

      // Process lesson stats
      if (results[1].status === 'fulfilled') {
        const lessonStats = results[1].value;
        setDashboardStats(prev => ({
          ...prev,
          lessonsCompleted: lessonStats.completedLessons
        }));
      }

      // Process achievements data
      if (results[2].status === 'fulfilled' && results[3].status === 'fulfilled') {
        const achievements = results[2].value;
        const streaks = results[3].value;
        setAchievementsData({
          badges: achievements || [],
          currentStreak: streaks?.current_streak || 0,
          totalAchievements: achievements?.length || 0
        });
      }

      // Process combined database results
      if (results[4].status === 'fulfilled') {
        const [quizResult, postsResult, commentsResult, aiInteractionsResult, profileResult] = results[4].value;
        
        const quizzesAttempted = quizResult.count || 0;
        const communityConnections = (postsResult.count || 0) + (commentsResult.count || 0);
        const aiInteractionCount = aiInteractionsResult?.data?.length || 0;
        const profilePoints = profileResult?.data?.impact_points || 0;
        
        // Calculate impact points
        const calculatedPoints = profilePoints || (
          (results[1].status === 'fulfilled' ? results[1].value.completedLessons * 10 : 0) +
          (quizzesAttempted * 2) +
          ((postsResult.count || 0) * 15) +
          ((commentsResult.count || 0) * 5) +
          (aiInteractionCount * 3)
        );

        setDashboardStats(prev => ({
          ...prev,
          quizzesAttempted,
          communityConnections,
          impactPoints: calculatedPoints
        }));
      }
    } catch (error) {
      console.error('Error in optimized stats fetch:', error);
    }
  };

  const fetchAIStats = async () => {
    const stats = await getUserStats();
    setAiStats(stats);
  };

  const fetchLessonStats = async () => {
    if (!user) return;
    try {
      const lessonStats = await lessonProgressService.getUserStats(user.id);
      setDashboardStats(prev => ({
        ...prev,
        lessonsCompleted: lessonStats.completedLessons
      }));
    } catch (error) {
      console.error('Error fetching lesson stats:', error);
    }
  };

  const fetchQuizStats = async () => {
    if (!user) return;
    try {
      const { count } = await supabase
        .from('lesson_quiz_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      setDashboardStats(prev => ({
        ...prev,
        quizzesAttempted: count || 0
      }));
    } catch (error) {
      console.error('Error fetching quiz stats:', error);
    }
  };

  const fetchCommunityStats = async () => {
    if (!user) return;
    try {
      // Count community posts and comments as connections
      const [postsResult, commentsResult] = await Promise.all([
        supabase.from('community_posts').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('comments').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
      ]);
      
      const connections = (postsResult.count || 0) + (commentsResult.count || 0);
      
      setDashboardStats(prev => ({
        ...prev,
        communityConnections: connections
      }));
    } catch (error) {
      console.error('Error fetching community stats:', error);
    }
  };

  const fetchAIInteractionCount = async () => {
    if (!user) return 0;
    try {
      // Direct query to ai_interactions table using a manual count
      const { data } = await supabase
        .from('ai_interactions' as any)
        .select('id')
        .eq('user_id', user.id);
      
      return data?.length || 0;
    } catch (error) {
      console.error('Error counting AI interactions:', error);
      return 0;
    }
  };

  const fetchImpactPoints = async () => {
    if (!user) return;
    try {
      // Get impact points from user profile first, then calculate additional based on activities
      const { data: profile } = await supabase
        .from('profiles')
        .select('impact_points')
        .eq('id', user.id)
        .single();

      const profilePoints = profile?.impact_points || 0;

      // Calculate additional points based on activities if profile points are low
      const [lessonStats, quizCount, communityPosts, communityComments, aiInteractionCount] = await Promise.all([
        lessonProgressService.getUserStats(user.id),
        supabase.from('lesson_quiz_attempts').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('community_posts').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('comments').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        fetchAIInteractionCount()
      ]);

      // Use profile points if available, otherwise calculate
      const calculatedPoints = profilePoints || (
        (lessonStats.completedLessons * 10) + // 10 points per lesson
        ((quizCount.count || 0) * 2) + // 2 points per quiz attempt
        ((communityPosts.count || 0) * 15) + // 15 points per community post
        ((communityComments.count || 0) * 5) + // 5 points per comment
        (aiInteractionCount * 3) // 3 points per AI interaction
      );

      setDashboardStats(prev => ({
        ...prev,
        impactPoints: calculatedPoints
      }));
    } catch (error) {
      console.error('Error calculating impact points:', error);
    }
  };

  const stats = [
    { label: 'Impact Points', value: loading ? '...' : dashboardStats.impactPoints.toString(), icon: Award, color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Lessons Completed', value: loading ? '...' : dashboardStats.lessonsCompleted.toString(), icon: BookOpen, color: 'text-green-600 dark:text-green-400' },
    { label: 'AI Interactions', value: loading ? '...' : (aiStats?.totalInteractions?.toString() || '0'), icon: Brain, color: 'text-purple-600 dark:text-purple-400' },
    { label: 'Quizzes Attempted', value: loading ? '...' : dashboardStats.quizzesAttempted.toString(), icon: Target, color: 'text-green-600 dark:text-green-400' },
    { label: 'Community Connections', value: loading ? '...' : dashboardStats.communityConnections.toString(), icon: Users, color: 'text-indigo-600 dark:text-indigo-400' },
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:scale-105 border-0 shadow-md">
              <CardContent className="p-6 flex flex-col items-center text-center h-full">
                <div className={`p-4 rounded-xl bg-muted ${stat.color} mb-4`}>
                  <stat.icon className="h-8 w-8" />
                </div>
                <div className="mt-auto">
                  <p className="text-3xl font-bold text-foreground mb-2">{stat.value}</p>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-heading font-bold text-foreground mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border-0 shadow-md" onClick={action.action}>
                <CardContent className="p-6 flex flex-col items-center text-center h-full min-h-[180px]">
                  <div className={`w-16 h-16 ${action.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <action.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="mt-auto">
                    <h3 className="font-semibold text-foreground mb-2">{action.title}</h3>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
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
                        <h3 className="text-xl font-semibold text-foreground mb-2">Start Your Learning Journey</h3>
                        <p className="text-muted-foreground mb-6">Begin exploring our AI-powered tools and track your progress</p>
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
                          <div key={index} className="p-3 hover:bg-muted/30 rounded-lg transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-foreground text-sm">{lesson.title}</h4>
                              <Badge variant="outline" className="text-xs">{lesson.type}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {lesson.duration}
                              </div>
                              <div className="text-xs font-medium text-green-600 dark:text-green-400">
                                {lesson.progress}%
                              </div>
                            </div>
                            <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full transition-all duration-300"
                                data-progress={lesson.progress}
                                style={{ width: `${Math.min(100, Math.max(0, lesson.progress))}%` }}
                              ></div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <BookOpen className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                          <p className="text-muted-foreground text-sm">No lessons completed yet</p>
                          <p className="text-muted-foreground/70 text-xs">Start learning to see your progress here</p>
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
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                            <Award className="h-5 w-5 text-yellow-600" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">Badges Earned</p>
                            <p className="text-sm text-muted-foreground">Learning milestones</p>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{achievementsData.totalAchievements}</div>
                      </div>
                      {achievementsData.badges.length > 0 ? (
                        <div className="space-y-2">
                          {achievementsData.badges.slice(0, 3).map((badge: any, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 rounded-lg">
                              <span className="text-lg">{badge.achievement?.icon || '🏆'}</span>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-foreground">{badge.achievement?.name || 'Achievement'}</p>
                                <p className="text-xs text-muted-foreground">{badge.achievement?.description || 'Congratulations!'}</p>
                              </div>
                            </div>
                          ))}
                          {achievementsData.badges.length > 3 && (
                            <p className="text-xs text-center text-muted-foreground">
                              +{achievementsData.badges.length - 3} more achievements
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <Award className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                          <p className="text-muted-foreground text-sm">No badges yet</p>
                          <p className="text-muted-foreground/70 text-xs">Complete lessons to earn your first badge</p>
                        </div>
                      )}
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
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl cursor-pointer hover:shadow-lg transition-shadow flex flex-col items-center text-center min-h-[200px]">
                    <div className="text-4xl mb-4">🎓</div>
                    <div className="mt-auto">
                      <h3 className="font-semibold mb-2">AI Learning Tools</h3>
                      <p className="text-sm text-muted-foreground mb-3">Advanced AI-powered learning features</p>
                      <Button size="sm" onClick={() => navigate('/ai-dashboard')}>
                        <Brain className="mr-2 h-4 w-4" />
                        Explore
                      </Button>
                    </div>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl cursor-pointer hover:shadow-lg transition-shadow flex flex-col items-center text-center min-h-[200px]">
                    <div className="text-4xl mb-4">📚</div>
                    <div className="mt-auto">
                      <h3 className="font-semibold mb-2">Simple Lessons</h3>
                      <p className="text-sm text-muted-foreground mb-3">Visual, voice-guided learning</p>
                      <Button size="sm" onClick={() => navigate('/simple-lessons')}>
                        <Play className="mr-2 h-4 w-4" />
                        Start
                      </Button>
                    </div>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl cursor-pointer hover:shadow-lg transition-shadow flex flex-col items-center text-center min-h-[200px]">
                    <div className="text-4xl mb-4">🎤</div>
                    <div className="mt-auto">
                      <h3 className="font-semibold mb-2">Voice Practice</h3>
                      <p className="text-sm text-muted-foreground mb-3">Speaking practice with AI feedback</p>
                      <Button size="sm">
                        <Mic className="mr-2 h-4 w-4" />
                        Practice
                      </Button>
                    </div>
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
                  <p className="text-muted-foreground mb-6">Interactive practice sessions, quizzes, and speaking exercises</p>
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
                  <p className="text-muted-foreground mb-6">Mentorship matching, learning groups, and global connections</p>
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
