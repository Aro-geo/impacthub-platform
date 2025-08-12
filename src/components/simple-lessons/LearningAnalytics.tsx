import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { lessonProgressService } from '@/services/lessonProgressService';
import { supabase } from '@/integrations/supabase/client';
import {
  TrendingUp,
  Clock,
  Target,
  Award,
  Calendar,
  BookOpen,
  CheckCircle,
  BarChart3
} from 'lucide-react';

interface LearningStats {
  totalLessons: number;
  completedLessons: number;
  inProgressLessons: number;
  completionPercentage: number;
  currentStreak: number;
  longestStreak: number;
  averageTimePerLesson: number;
  lessonsThisWeek: number;
  lessonsThisMonth: number;
  favoriteSubjects: Array<{ subject: string; count: number }>;
  recentActivity: Array<{
    date: string;
    lessonsCompleted: number;
    timeSpent: number;
  }>;
}

interface LearningAnalyticsProps {
  className?: string;
}

const LearningAnalytics: React.FC<LearningAnalyticsProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user]);

  const loadAnalytics = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Get basic progress stats
      const basicStats = await lessonProgressService.getUserStats(user.id);

      // Get detailed progress data
      const { data: progressData, error: progressError } = await supabase
        .from('lesson_progress')
        .select(`
          *,
          simple_lessons!inner(
            title,
            subject_id,
            subjects(name)
          )
        `)
        .eq('user_id', user.id);

      if (progressError) throw progressError;

      // Calculate advanced analytics
      const analytics = calculateAdvancedStats(basicStats, progressData || []);
      setStats(analytics);

    } catch (err) {
      console.error('Error loading learning analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const calculateAdvancedStats = (basicStats: any, progressData: any[]): LearningStats => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Calculate streaks
    const completedLessons = progressData
      .filter(p => p.status === 'completed')
      .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());

    const { currentStreak, longestStreak } = calculateStreaks(completedLessons);

    // Calculate time-based stats
    const lessonsThisWeek = completedLessons.filter(
      lesson => new Date(lesson.completed_at) >= oneWeekAgo
    ).length;

    const lessonsThisMonth = completedLessons.filter(
      lesson => new Date(lesson.completed_at) >= oneMonthAgo
    ).length;

    // Calculate average time per lesson (estimated)
    const averageTimePerLesson = calculateAverageTime(progressData);

    // Calculate favorite subjects
    const subjectCounts: Record<string, number> = {};
    progressData.forEach(progress => {
      if (progress.status === 'completed' && progress.simple_lessons?.subjects?.name) {
        const subject = progress.simple_lessons.subjects.name;
        subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
      }
    });

    const favoriteSubjects = Object.entries(subjectCounts)
      .map(([subject, count]) => ({ subject, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate recent activity (last 7 days)
    const recentActivity = calculateRecentActivity(completedLessons);

    return {
      ...basicStats,
      currentStreak,
      longestStreak,
      averageTimePerLesson,
      lessonsThisWeek,
      lessonsThisMonth,
      favoriteSubjects,
      recentActivity
    };
  };

  const calculateStreaks = (completedLessons: any[]) => {
    if (completedLessons.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if there's a lesson completed today or yesterday for current streak
    const mostRecent = new Date(completedLessons[0].completed_at);
    mostRecent.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((today.getTime() - mostRecent.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 1) {
      currentStreak = 1;
      
      // Calculate consecutive days
      for (let i = 1; i < completedLessons.length; i++) {
        const currentDate = new Date(completedLessons[i - 1].completed_at);
        const prevDate = new Date(completedLessons[i].completed_at);
        
        currentDate.setHours(0, 0, 0, 0);
        prevDate.setHours(0, 0, 0, 0);
        
        const diff = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diff === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    for (let i = 1; i < completedLessons.length; i++) {
      const currentDate = new Date(completedLessons[i - 1].completed_at);
      const prevDate = new Date(completedLessons[i].completed_at);
      
      currentDate.setHours(0, 0, 0, 0);
      prevDate.setHours(0, 0, 0, 0);
      
      const diff = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    
    longestStreak = Math.max(longestStreak, tempStreak);

    return { currentStreak, longestStreak };
  };

  const calculateAverageTime = (progressData: any[]) => {
    const completedWithTime = progressData.filter(p => 
      p.status === 'completed' && p.started_at && p.completed_at
    );

    if (completedWithTime.length === 0) return 0;

    const totalTime = completedWithTime.reduce((sum, lesson) => {
      const start = new Date(lesson.started_at).getTime();
      const end = new Date(lesson.completed_at).getTime();
      return sum + (end - start);
    }, 0);

    return Math.round(totalTime / completedWithTime.length / (1000 * 60)); // Convert to minutes
  };

  const calculateRecentActivity = (completedLessons: any[]) => {
    const activity: Record<string, { lessonsCompleted: number; timeSpent: number }> = {};
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    });

    last7Days.forEach(date => {
      activity[date] = { lessonsCompleted: 0, timeSpent: 0 };
    });

    completedLessons.forEach(lesson => {
      const date = new Date(lesson.completed_at).toISOString().split('T')[0];
      if (activity[date]) {
        activity[date].lessonsCompleted++;
        // Estimate time spent (could be enhanced with actual tracking)
        activity[date].timeSpent += 15; // Assume 15 minutes per lesson
      }
    });

    return Object.entries(activity)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  const getStreakBadgeColor = (streak: number) => {
    if (streak >= 30) return 'bg-purple-100 text-purple-800';
    if (streak >= 14) return 'bg-blue-100 text-blue-800';
    if (streak >= 7) return 'bg-green-100 text-green-800';
    if (streak >= 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (!user) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Please sign in to view your learning analytics.</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
            <span>Loading analytics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <p className="text-red-600">{error || 'Failed to load analytics'}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Completion Rate</p>
                <p className="text-2xl font-bold">{stats.completionPercentage}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold">{stats.completedLessons}</p>
                <p className="text-xs text-muted-foreground">of {stats.totalLessons} lessons</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium">Current Streak</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold">{stats.currentStreak}</p>
                  <Badge className={getStreakBadgeColor(stats.currentStreak)}>
                    {stats.currentStreak >= 7 ? '🔥' : '📚'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Avg. Time</p>
                <p className="text-2xl font-bold">{stats.averageTimePerLesson}m</p>
                <p className="text-xs text-muted-foreground">per lesson</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Learning Progress</span>
          </CardTitle>
          <CardDescription>
            Your overall progress across all lessons
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Completion</span>
                <span>{stats.completionPercentage}%</span>
              </div>
              <Progress value={stats.completionPercentage} className="h-2" />
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.completedLessons}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats.inProgressLessons}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-600">
                  {stats.totalLessons - stats.completedLessons - stats.inProgressLessons}
                </p>
                <p className="text-sm text-muted-foreground">Not Started</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity & Streaks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">This Week</span>
                <Badge variant="outline">{stats.lessonsThisWeek} lessons</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">This Month</span>
                <Badge variant="outline">{stats.lessonsThisMonth} lessons</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Longest Streak</span>
                <Badge className={getStreakBadgeColor(stats.longestStreak)}>
                  {stats.longestStreak} days
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Favorite Subjects</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.favoriteSubjects.length > 0 ? (
                stats.favoriteSubjects.map((subject, index) => (
                  <div key={subject.subject} className="flex justify-between items-center">
                    <span className="text-sm">{subject.subject}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ 
                            width: `${(subject.count / stats.favoriteSubjects[0].count) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-xs text-muted-foreground">{subject.count}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Complete some lessons to see your favorite subjects!</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LearningAnalytics;