import { useState, useEffect, lazy, Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { 
  BookOpen, 
  Target, 
  BarChart3,
  Users
} from 'lucide-react';

// Lazy load components for better performance
const OverviewSection = lazy(() => import('@/components/simple-lessons/OverviewSection'));
const LessonsSection = lazy(() => import('@/components/simple-lessons/LessonsSection'));
const PracticeSection = lazy(() => import('@/components/simple-lessons/PracticeSection'));
const OptimizedUnifiedCommunityForum = lazy(() => import('@/components/shared/OptimizedUnifiedCommunityForum'));

interface UserStats {
  totalLessonsCompleted: number;
  totalQuizzesAttempted: number;
  currentStreak: number;
  completionPercentage: number;
  totalLessons: number;
}

const SimpleLessonDashboard = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [userStats, setUserStats] = useState<UserStats>({
    totalLessonsCompleted: 0,
    totalQuizzesAttempted: 0,
    currentStreak: 0,
    completionPercentage: 0,
    totalLessons: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (user && !loading) {
      fetchUserStats();
    }
  }, [user, loading]);

  const fetchUserStats = async () => {
    try {
      setStatsLoading(true);
      
      // Batch all queries for better performance
      const [
        { count: totalLessons },
        { count: completedLessons },
        { count: quizAttempts },
        { data: streakData }
      ] = await Promise.all([
        supabase
          .from('simple_lessons')
          .select('*', { count: 'exact', head: true })
          .eq('is_published', true),
        supabase
          .from('lesson_progress')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user?.id)
          .eq('status', 'completed'),
        supabase
          .from('lesson_quiz_attempts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user?.id),
        supabase
          .from('learning_streaks')
          .select('current_streak')
          .eq('user_id', user?.id)
          .single()
      ]);

      const stats: UserStats = {
        totalLessonsCompleted: completedLessons || 0,
        totalQuizzesAttempted: quizAttempts || 0,
        currentStreak: streakData?.current_streak || 0,
        totalLessons: totalLessons || 0,
        completionPercentage: totalLessons ? Math.round(((completedLessons || 0) / totalLessons) * 100) : 0
      };

      setUserStats(stats);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const tabItems = [
    {
      value: 'overview',
      label: 'Overview',
      icon: BarChart3,
      color: 'text-blue-600'
    },
    {
      value: 'lessons',
      label: 'Lessons',
      icon: BookOpen,
      color: 'text-green-600'
    },
    {
      value: 'practice',
      label: 'Practice',
      icon: Target,
      color: 'text-purple-600'
    },
    {
      value: 'community',
      label: 'Community',
      icon: Users,
      color: 'text-orange-600'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-gray-600">Please sign in to access Simple Lessons.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Simple Lessons</h1>
          <p className="text-gray-600 mt-2">Continue your learning journey</p>
        </div>

        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Navigation Tabs */}
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            {tabItems.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <tab.icon className={`h-4 w-4 ${tab.color}`} />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Tab Content with Lazy Loading */}
          <TabsContent value="overview" className="space-y-6">
            <Suspense fallback={
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            }>
              <OverviewSection userStats={userStats} onRefresh={fetchUserStats} />
            </Suspense>
          </TabsContent>

          <TabsContent value="lessons" className="space-y-6">
            <Suspense fallback={
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            }>
              <LessonsSection />
            </Suspense>
          </TabsContent>

          <TabsContent value="practice" className="space-y-6">
            <Suspense fallback={
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            }>
              <PracticeSection />
            </Suspense>
          </TabsContent>

          <TabsContent value="community" className="space-y-6">
            <Suspense fallback={
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            }>
              <OptimizedUnifiedCommunityForum 
                context="simple-lessons"
                title="Simple Lessons Community"
                description="Discuss lessons, ask questions, and share resources"
              />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SimpleLessonDashboard;