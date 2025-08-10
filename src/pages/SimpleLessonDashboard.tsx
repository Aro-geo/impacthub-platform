import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Target, 
  Trophy, 
  Flame,
  BarChart3,
  MessageSquare,
  Users,
  Play,
  Clock,
  Star,
  Bookmark,
  Search,
  Filter,
  GraduationCap,
  ArrowLeft
} from 'lucide-react';
import OverviewSection from '@/components/simple-lessons/OverviewSection';
import LessonsSection from '@/components/simple-lessons/LessonsSection';
import PracticeSection from '@/components/simple-lessons/PracticeSection';
import CommunitySection from '@/components/simple-lessons/CommunitySection';
import SeedDataButton from '@/components/simple-lessons/SeedDataButton';
import GradeSelector from '@/components/simple-lessons/GradeSelector';

interface UserStats {
  totalLessonsCompleted: number;
  totalQuizzesAttempted: number;
  currentStreak: number;
  completionPercentage: number;
  totalLessons: number;
}

const SimpleLessonDashboard = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [userStats, setUserStats] = useState<UserStats>({
    totalLessonsCompleted: 0,
    totalQuizzesAttempted: 0,
    currentStreak: 0,
    completionPercentage: 0,
    totalLessons: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      
      // Get total lessons
      const { count: totalLessons } = await supabase
        .from('simple_lessons')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true);

      // Get completed lessons count
      const { count: completedLessons } = await supabase
        .from('lesson_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .eq('status', 'completed');

      // Get quiz attempts count
      const { count: quizAttempts } = await supabase
        .from('lesson_quiz_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);

      // Get current streak
      const { data: streakData } = await supabase
        .from('learning_streaks')
        .select('current_streak')
        .eq('user_id', user?.id)
        .single();

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
      setLoading(false);
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Simple Lesson Dashboard</h1>
                <p className="text-gray-600">
                  Continue your learning journey
                  {userProfile?.grade && (
                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <GraduationCap className="h-3 w-3 mr-1" />
                      Grade {userProfile.grade}
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Dashboard</span>
              </Button>
              
              {userStats.currentStreak > 0 && (
                <div className="flex items-center space-x-2 bg-orange-100 px-4 py-2 rounded-full">
                  <Flame className="h-5 w-5 text-orange-600" />
                  <span className="font-semibold text-orange-800">
                    {userStats.currentStreak} day streak!
                  </span>
                </div>
              )}
              <GradeSelector />
              <SeedDataButton />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        
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

          {/* Tab Content */}
          <TabsContent value="overview" className="space-y-6">
            <OverviewSection userStats={userStats} onRefresh={fetchUserStats} />
          </TabsContent>

          <TabsContent value="lessons" className="space-y-6">
            <LessonsSection />
          </TabsContent>

          <TabsContent value="practice" className="space-y-6">
            <PracticeSection />
          </TabsContent>

          <TabsContent value="community" className="space-y-6">
            <CommunitySection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SimpleLessonDashboard;