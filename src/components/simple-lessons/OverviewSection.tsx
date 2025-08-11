import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  BookOpen,
  Play,
  ArrowRight,
  TrendingUp,
  Clock,
  Star
} from 'lucide-react';
import GradeInfo from './GradeInfo';

interface UserStats {
  totalLessonsCompleted: number;
  totalQuizzesAttempted: number;
  currentStreak: number;
  completionPercentage: number;
  totalLessons: number;
}

interface OverviewSectionProps {
  userStats: UserStats;
  onRefresh: () => void;
}

interface SuggestedLesson {
  id: string;
  title: string;
  description: string;
  subject_name: string;
  difficulty_level: string;
  duration_minutes: number;
}

interface ContinueLesson {
  id: string;
  title: string;
  subject_name: string;
  progress_percentage: number;
}

const OverviewSection = ({ userStats, onRefresh }: OverviewSectionProps) => {
  const { user } = useAuth();
  const [suggestedLessons, setSuggestedLessons] = useState<SuggestedLesson[]>([]);
  const [continueLesson, setContinueLesson] = useState<ContinueLesson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOverviewData();
    }
  }, [user]);

  const fetchOverviewData = async () => {
    try {
      setLoading(true);

      // Get lesson to continue (most recent in-progress lesson)
      const { data: inProgressLesson } = await supabase
        .from('lesson_progress')
        .select(`
          lesson_id,
          progress_percentage,
          simple_lessons!inner (
            id,
            title,
            subjects!inner (name)
          )
        `)
        .eq('user_id', user?.id)
        .eq('status', 'in_progress')
        .order('last_accessed', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (inProgressLesson?.simple_lessons) {
        setContinueLesson({
          id: inProgressLesson.simple_lessons.id,
          title: inProgressLesson.simple_lessons.title,
          subject_name: inProgressLesson.simple_lessons.subjects?.name || 'Unknown',
          progress_percentage: inProgressLesson.progress_percentage
        });
      }

      // Get user profile for grade filtering
      let userGrade = null;
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('grade')
          .eq('id', user?.id)
          .single();

        if (!profileError && profile?.grade) {
          userGrade = profile.grade;
        }
      } catch (error) {
        console.error('Error fetching user profile for grade filtering:', error);
      }

      // Build suggested lessons query with grade filtering
      let suggestedQuery = supabase
        .from('simple_lessons')
        .select(`
          id,
          title,
          description,
          difficulty_level,
          duration_minutes,
          grade,
          subjects!inner (name)
        `)
        .eq('is_published', true)
        .not('subject_id', 'is', null);

      // Apply grade filter if user has a grade set
      if (userGrade) {
        const gradeFilters = [`grade.is.null`, `grade.eq.${userGrade}`];

        // Add adjacent grades if they're valid (1-12 range)
        if (userGrade > 1) {
          gradeFilters.push(`grade.eq.${userGrade - 1}`);
        }
        if (userGrade < 12) {
          gradeFilters.push(`grade.eq.${userGrade + 1}`);
        }

        suggestedQuery = suggestedQuery.or(gradeFilters.join(','));
      }

      const [{ data: suggested }, { data: userProgress }] = await Promise.all([
        suggestedQuery.order('order_index').limit(10), // Get more lessons to filter from
        supabase
          .from('lesson_progress')
          .select('lesson_id')
          .eq('user_id', user?.id)
          .in('status', ['completed', 'in_progress'])
      ]);

      if (suggested) {
        // Filter out lessons that are already completed or in progress
        const progressLessonIds = new Set(userProgress?.map(p => p.lesson_id) || []);
        const filteredSuggested = suggested
          .filter(lesson => !progressLessonIds.has(lesson.id))
          .slice(0, 3); // Take only 3 after filtering

        setSuggestedLessons(filteredSuggested.map(lesson => ({
          ...lesson,
          subject_name: lesson.subjects?.name || 'Unknown'
        })));
      }

    } catch (error) {
      console.error('Error fetching overview data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyStars = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '⭐';
      case 'intermediate': return '⭐⭐';
      case 'advanced': return '⭐⭐⭐';
      default: return '⭐';
    }
  };

  const getMotivationalMessage = () => {
    const { completionPercentage, currentStreak } = userStats;

    if (completionPercentage === 0) {
      return "Welcome! Start your learning journey today 🚀";
    } else if (completionPercentage < 25) {
      return "Great start! Keep building momentum 💪";
    } else if (completionPercentage < 50) {
      return "You're making excellent progress! 🌟";
    } else if (completionPercentage < 75) {
      return "Fantastic work! You're more than halfway there! 🎯";
    } else if (completionPercentage < 100) {
      return "Almost there! You're so close to completing everything! 🏆";
    } else {
      return "Congratulations! You've completed all lessons! 🎉";
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Grade Information */}
      <GradeInfo />

      {/* Progress Overview */}
      <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Your Learning Progress</h2>
              <p className="text-blue-100">{getMotivationalMessage()}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{userStats.completionPercentage}%</div>
              <div className="text-blue-100 text-sm">Complete</div>
            </div>
          </div>
          <Progress
            value={userStats.completionPercentage}
            className="h-3 bg-blue-500"
          />
          <div className="mt-2 text-blue-100 text-sm">
            {userStats.totalLessonsCompleted} of {userStats.totalLessons} lessons completed
          </div>
        </CardContent>
      </Card>



      {/* Continue Learning & Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Continue Where You Left Off */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Play className="h-5 w-5 text-blue-600" />
              <span>Continue Learning</span>
            </CardTitle>
            <CardDescription>
              Pick up where you left off
            </CardDescription>
          </CardHeader>
          <CardContent>
            {continueLesson ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {continueLesson.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {continueLesson.subject_name}
                  </p>
                  <Progress value={continueLesson.progress_percentage} className="h-2 mb-2" />
                  <p className="text-xs text-gray-500">
                    {continueLesson.progress_percentage}% complete
                  </p>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Play className="mr-2 h-4 w-4" />
                  Continue Lesson
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">No lessons in progress</p>
                <Button variant="outline" className="w-full">
                  Browse Lessons
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Suggested Lessons */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span>Suggested for You</span>
            </CardTitle>
            <CardDescription>
              Recommended based on your progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            {suggestedLessons.length > 0 ? (
              <div className="space-y-3">
                {suggestedLessons.map((lesson) => (
                  <div key={lesson.id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {lesson.title}
                      </h4>
                      <Badge className={getDifficultyColor(lesson.difficulty_level)}>
                        {getDifficultyStars(lesson.difficulty_level)}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">
                      {lesson.subject_name}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {lesson.duration_minutes} min
                      </div>
                      <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">
                        Start
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Star className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No suggestions available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OverviewSection;