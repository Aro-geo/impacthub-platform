import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { aiLearningObserver, LearningRecommendation, LearnerProfile } from '@/services/aiLearningObserver';
import {
  Brain,
  BookOpen,
  Target,
  Clock,
  TrendingUp,
  Star,
  Lightbulb,
  Award,
  AlertCircle
} from 'lucide-react';

const LearningRecommendations = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<LearningRecommendation[]>([]);
  const [learnerProfile, setLearnerProfile] = useState<LearnerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadRecommendations();
    }
  }, [user]);

  const loadRecommendations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Load learner profile and recommendations
      const [profile, recs] = await Promise.all([
        aiLearningObserver.getLearnerProfile(user.id),
        aiLearningObserver.generateRecommendations(user.id)
      ]);

      setLearnerProfile(profile);
      setRecommendations(recs);
    } catch (error) {
      console.error('Error loading recommendations:', error);
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'medium': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'hard': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-5/6"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Learning Insights Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-blue-600" />
            <span>AI Learning Insights</span>
          </CardTitle>
          <CardDescription>
            Personalized recommendations based on your learning patterns and performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {learnerProfile ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Interests */}
              <div>
                <h4 className="font-medium text-foreground mb-2 flex items-center">
                  <Star className="h-4 w-4 mr-1 text-yellow-500" />
                  Your Interests
                </h4>
                <div className="flex flex-wrap gap-1">
                  {learnerProfile.interests.slice(0, 3).map((interest, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {interest}
                    </Badge>
                  ))}
                  {learnerProfile.interests.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{learnerProfile.interests.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Strengths */}
              <div>
                <h4 className="font-medium text-foreground mb-2 flex items-center">
                  <Award className="h-4 w-4 mr-1 text-green-500" />
                  Your Strengths
                </h4>
                <div className="flex flex-wrap gap-1">
                  {learnerProfile.strengths.slice(0, 3).map((strength, index) => (
                    <Badge key={index} className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 text-xs">
                      {strength}
                    </Badge>
                  ))}
                  {learnerProfile.strengths.length === 0 && (
                    <span className="text-xs text-muted-foreground">Keep learning to discover your strengths!</span>
                  )}
                </div>
              </div>

              {/* Areas to Improve */}
              <div>
                <h4 className="font-medium text-foreground mb-2 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1 text-orange-500" />
                  Focus Areas
                </h4>
                <div className="flex flex-wrap gap-1">
                  {learnerProfile.weaknesses.slice(0, 3).map((weakness, index) => (
                    <Badge key={index} className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300 text-xs">
                      {weakness}
                    </Badge>
                  ))}
                  {learnerProfile.weaknesses.length === 0 && (
                    <span className="text-xs text-muted-foreground">Great job! No weak areas identified yet.</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">
                Start learning to get personalized insights and recommendations!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Recommended for You</h3>
          <Button variant="outline" size="sm" onClick={loadRecommendations}>
            Refresh
          </Button>
        </div>

        {recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec, index) => {
              const IconComponent = getRecommendationIcon(rec.type);
              return (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <IconComponent className="h-5 w-5 text-blue-600" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-foreground truncate">{rec.title}</h4>
                          <Badge className={getPriorityColor(rec.priority)} size="sm">
                            {rec.priority}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {rec.description}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                          <div className="flex items-center space-x-3">
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {rec.estimatedTime}min
                            </span>
                            <Badge className={getDifficultyColor(rec.difficulty)} size="sm">
                              {rec.difficulty}
                            </Badge>
                          </div>
                          <span className="text-xs font-medium text-blue-600">
                            {rec.subject}
                          </span>
                        </div>
                        
                        <p className="text-xs text-muted-foreground mb-3 italic">
                          {rec.reason}
                        </p>
                        
                        <Button size="sm" className="w-full">
                          Start Learning
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h4 className="font-medium text-foreground mb-2">No Recommendations Yet</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Complete some quizzes or lessons to get personalized AI recommendations!
              </p>
              <Button variant="outline">
                Explore Lessons
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LearningRecommendations;