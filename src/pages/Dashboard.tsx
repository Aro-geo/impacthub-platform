
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAI } from '@/hooks/useAI';
// Legacy services kept for fallback; core data now via RPC (useDashboardData)
import { lessonProgressService } from '@/services/lessonProgressService';
import { achievementsService } from '@/services/achievementsService';
import { supabase } from '@/integrations/supabase/client';
import { useDashboardData, useConnectionHealth } from '@/hooks/useRPCDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
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

  // New RPC-based dashboard data
  const { data: rpcDashboard, loading: rpcLoading, error: rpcError, lastFetched, refetch } = useDashboardData(!!user);
  const { healthy: connectionHealthy } = useConnectionHealth(45000);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Always use direct queries for now until RPC is fixed
        await Promise.all([
          fetchLessonStats(),
          fetchQuizStats(),
          fetchCommunityStats(),
          fetchImpactPoints(),
          fetchAIStats()
        ]);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, [user]);

  // Optimized single function to fetch all stats with minimal database calls
  // Legacy fetchAllStatsOptimized removed in favor of RPC; keep placeholder for potential fallback usage.
  const fetchAllStatsOptimized = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await Promise.all([
        fetchLessonStats(),
        fetchQuizStats(),
        fetchCommunityStats(),
        fetchImpactPoints(),
        fetchAIStats()
      ]);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAIStats = async () => {
    if (!user) return;
    try {
      const stats = await getUserStats();
      setAiStats(stats);
    } catch (error) {
      console.error('Error fetching AI stats:', error);
    }
  };

  const fetchLessonStats = async () => {
    if (!user) {
      console.debug('[Dashboard] No user available for lesson stats fetch');
      return;
    }
    try {
      console.debug('[Dashboard] Fetching lesson stats for user:', user.id);
      const start = performance.now();
      
      const lessonStats = await lessonProgressService.getUserStats(user.id);
      const duration = performance.now() - start;
      
      console.debug('[Dashboard] Lesson stats retrieved:', {
        userId: user.id,
        completedLessons: lessonStats.completedLessons,
        duration: `${duration.toFixed(2)}ms`,
        hasStats: !!lessonStats
      });
      
      setDashboardStats(prev => {
        const newStats = {
          ...prev,
          lessonsCompleted: lessonStats.completedLessons
        };
        console.debug('[Dashboard] Updated dashboard stats:', {
          previous: prev.lessonsCompleted,
          new: newStats.lessonsCompleted,
          userId: user.id
        });
        return newStats;
      });
    } catch (error) {
      console.error('[Dashboard] Error fetching lesson stats:', {
        userId: user.id,
        error,
        errorMessage: error.message,
        stack: error.stack
      });
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
        supabase.from('post_comments').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
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
    if (!user) {
      console.debug('[Dashboard] No user available for impact points fetch');
      return;
    }
    try {
      console.debug('[Dashboard] Fetching impact points for user:', user.id);
      
      // Get impact points from user profile first, then calculate additional based on activities
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('impact_points')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('[Dashboard] Error fetching profile points:', {
          userId: user.id,
          error: profileError
        });
      }

      const profilePoints = profile?.impact_points || 0;
      console.debug('[Dashboard] Profile points retrieved:', {
        userId: user.id,
        points: profilePoints,
        source: 'profile'
      });

      // Calculate additional points based on activities if profile points are low
      console.debug('[Dashboard] Fetching activity-based points');
      const [lessonStats, quizCount, communityPosts, communityComments, aiInteractionCount] = await Promise.all([
        lessonProgressService.getUserStats(user.id),
        supabase.from('lesson_quiz_attempts').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('community_posts').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('post_comments').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
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
    { label: 'Impact Points', value: dashboardStats.impactPoints.toString(), icon: Award, color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Lessons Completed', value: dashboardStats.lessonsCompleted.toString(), icon: BookOpen, color: 'text-green-600 dark:text-green-400' },
    { label: 'AI Interactions', value: (aiStats?.totalInteractions?.toString() || '0'), icon: Brain, color: 'text-purple-600 dark:text-purple-400' },
    { label: 'Quizzes Attempted', value: dashboardStats.quizzesAttempted.toString(), icon: Target, color: 'text-green-600 dark:text-green-400' },
    { label: 'Community Connections', value: dashboardStats.communityConnections.toString(), icon: Users, color: 'text-indigo-600 dark:text-indigo-400' },
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Dashboard
            </h1>
            <p className="text-muted-foreground text-lg">Track your learning progress and achievements</p>
          </div>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:scale-102 border-0 shadow-md">
              <CardContent className="p-3 sm:p-4 lg:p-6 flex flex-col items-center text-center h-full">
                <div className={`p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl bg-muted ${stat.color} mb-2 sm:mb-4`}>
                  <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8" />
                </div>
                <div className="mt-auto">
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-1 sm:mb-2">{stat.value}</p>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-foreground mb-4 sm:mb-6 px-2 sm:px-0">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {quickActions.map((action, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:scale-102 cursor-pointer border-0 shadow-md" onClick={action.action}>
                <CardContent className="p-3 sm:p-4 lg:p-6 flex flex-col items-center text-center h-full min-h-[120px] sm:min-h-[160px] lg:min-h-[180px]">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 ${action.color} rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4`}>
                    <action.icon className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
                  </div>
                  <div className="mt-auto">
                    <h3 className="font-semibold text-foreground text-sm sm:text-base mb-1 sm:mb-2">{action.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{action.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-2 p-1 h-auto">
            <TabsTrigger value="overview" className="text-xs sm:text-sm py-2 h-auto">Overview</TabsTrigger>
            <TabsTrigger value="lessons" className="text-xs sm:text-sm py-2 h-auto">Lessons</TabsTrigger>
            <TabsTrigger value="practice" className="text-xs sm:text-sm py-2 h-auto">Practice</TabsTrigger>
            <TabsTrigger value="community" className="text-xs sm:text-sm py-2 h-auto">Community</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-lg">
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                      Your Learning Journey
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Track your progress across all platforms
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <div className="space-y-4">
                      <div className="text-center py-6 sm:py-12">
                        <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🚀</div>
                        <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">Start Your Learning Journey</h3>
                        <p className="text-sm text-muted-foreground mb-4 sm:mb-6">Begin exploring our AI-powered tools and track your progress</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 px-4 sm:px-0">
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
