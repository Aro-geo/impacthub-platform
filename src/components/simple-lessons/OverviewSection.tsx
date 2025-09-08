import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useAI } from '@/hooks/useAI';
import { supabase } from '@/integrations/supabase/client';
import {
  BookOpen,
  Play,
  ArrowRight,
  TrendingUp,
  Clock,
  Star,
  Brain,
  Target,
  Lightbulb
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

// AI Recommendations Section Component
const AIRecommendationsSection = () => {
  const { user } = useAuth();
  const { getLearningRecommendations, getLearnerProfile } = useAI();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [learnerProfile, setLearnerProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAIRecommendations();
    }
  }, [user]);

  const loadAIRecommendations = async () => {
    try {
      setLoading(true);
      const [recs, profile] = await Promise.all([
        getLearningRecommendations(),
        getLearnerProfile()
      ]);
      
      setRecommendations(recs || []);
      setLearnerProfile(profile);
    } catch (error) {
      console.error('Error loading AI recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'lesson': return BookOpen;
      case 'skill': return Target;
      case 'topic': return Lightbulb;
      case 'practice': return TrendingUp;
      default: return Brain;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-3 border rounded-lg animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-muted rounded w-full mb-2"></div>
            <div className="h-6 bg-muted rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-6">
        <Brain className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
        <p className="text-muted-foreground mb-2">AI Learning Assistant</p>
        <p className="text-sm text-muted-foreground">
          Complete some lessons and quizzes to get personalized recommendations!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Show learner insights if available */}
      {learnerProfile && (learnerProfile.interests.length > 0 || learnerProfile.strengths.length > 0) && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-2 mb-2">
            <Brain className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-300">AI Insights</span>
          </div>
          <div className="text-xs text-blue-700 dark:text-blue-400">
            {learnerProfile.interests.length > 0 && (
              <span>Interested in: {learnerProfile.interests.slice(0, 2).join(', ')}</span>
            )}
            {learnerProfile.strengths.length > 0 && learnerProfile.interests.length > 0 && ' • '}
            {learnerProfile.strengths.length > 0 && (
              <span>Strong in: {learnerProfile.strengths.slice(0, 2).join(', ')}</span>
            )}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.slice(0, 3).map((rec, index) => {
        const IconComponent = getRecommendationIcon(rec.type);
        return (
          <div key={index} className="p-3 border rounded-lg hover:bg-muted/30 transition-colors">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <IconComponent className="h-4 w-4 text-blue-600" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-foreground text-sm truncate">
                    {rec.title}
                  </h4>
                  <Badge className={getPriorityColor(rec.priority)} size="sm">
                    {rec.priority}
                  </Badge>
                </div>
                
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                  {rec.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {rec.estimatedTime}min
                  </div>
                  <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">
                    Start
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      
      {recommendations.length > 3 && (
        <Button variant="outline" size="sm" className="w-full mt-2">
          View All Recommendations
        </Button>
      )}
    </div>
  );
};

const OverviewSection = ({ userStats, onRefresh }: OverviewSectionProps) => {
  const { user, isAdmin } = useAuth();
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

      // Apply grade filter if user has a grade set and is not admin
      if (userGrade && !isAdmin) {
        suggestedQuery = suggestedQuery.eq('grade', userGrade);
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
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-muted text-muted-foreground';
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
              <p className="text-blue-100 dark:text-blue-200">{getMotivationalMessage()}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{userStats.completionPercentage}%</div>
              <div className="text-blue-100 dark:text-blue-200 text-sm">Complete</div>
            </div>
          </div>
          <Progress
            value={userStats.completionPercentage}
            className="h-3 bg-blue-500"
          />
          <div className="mt-2 text-blue-100 dark:text-blue-200 text-sm">
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
              <Play className="h-5 w-5 text-blue-600 dark:text-blue-400" />
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
                  <h3 className="font-semibold text-foreground mb-1">
                    {continueLesson.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {continueLesson.subject_name}
                  </p>
                  <Progress value={continueLesson.progress_percentage} className="h-2 mb-2" />
                  <p className="text-xs text-muted-foreground">
                    {continueLesson.progress_percentage}% complete
                  </p>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600">
                  <Play className="mr-2 h-4 w-4" />
                  Continue Lesson
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <BookOpen className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">No lessons in progress</p>
                <Button variant="outline" className="w-full">
                  Browse Lessons
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI-Powered Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span>Suggested for You</span>
            </CardTitle>
            <CardDescription>
              AI-powered recommendations based on your learning patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AIRecommendationsSection />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OverviewSection;