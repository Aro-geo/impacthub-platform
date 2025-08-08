import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { 
  BookOpen, 
  Mic, 
  Users, 
  TrendingUp,
  Play,
  Star,
  Award,
  Clock,
  Globe,
  Heart,
  Volume2,
  MessageCircle,
  Target,
  Calendar,
  Zap
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  completed?: boolean;
}

interface UserProgress {
  totalLessons: number;
  completedLessons: number;
  currentStreak: number;
  totalPoints: number;
  badges: string[];
}

const ImpactLearnDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('lessons');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<UserProgress>({
    totalLessons: 0,
    completedLessons: 0,
    currentStreak: 0,
    totalPoints: 0,
    badges: []
  });

  useEffect(() => {
    fetchLessons();
    fetchUserProgress();
  }, []);

  const fetchLessons = async () => {
    // Mock data for now - in real app, fetch from Supabase
    const mockLessons: Lesson[] = [
      {
        id: '1',
        title: 'Basic English Greetings',
        description: 'Learn how to say hello and introduce yourself',
        category: 'English',
        duration: 5,
        difficulty: 'beginner',
        completed: true
      },
      {
        id: '2',
        title: 'Counting Numbers 1-20',
        description: 'Practice numbers with voice and visuals',
        category: 'English',
        duration: 7,
        difficulty: 'beginner'
      },
      {
        id: '3',
        title: 'Family Members',
        description: 'Learn words for family relationships',
        category: 'English',
        duration: 6,
        difficulty: 'beginner'
      },
      {
        id: '4',
        title: 'Basic Health Tips',
        description: 'Important health information for daily life',
        category: 'Health',
        duration: 10,
        difficulty: 'beginner'
      },
      {
        id: '5',
        title: 'Using Mobile Money',
        description: 'Safe digital payments and savings',
        category: 'Financial',
        duration: 8,
        difficulty: 'intermediate'
      }
    ];
    setLessons(mockLessons);
  };

  const fetchUserProgress = async () => {
    // Mock progress data
    setProgress({
      totalLessons: 50,
      completedLessons: 12,
      currentStreak: 5,
      totalPoints: 1250,
      badges: ['First Lesson', 'Week Streak', 'English Basics']
    });
  };

  const navigationItems = [
    {
      id: 'lessons',
      icon: BookOpen,
      label: 'Lessons',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      id: 'practice',
      icon: Mic,
      label: 'Practice',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      id: 'mentor',
      icon: Users,
      label: 'Mentor',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      id: 'progress',
      icon: TrendingUp,
      label: 'Progress',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  const getCategoryColor = (category: string) => {
    const colors = {
      'English': 'bg-blue-100 text-blue-800',
      'Health': 'bg-green-100 text-green-800',
      'Financial': 'bg-purple-100 text-purple-800',
      'Digital': 'bg-orange-100 text-orange-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '⭐';
      case 'intermediate': return '⭐⭐';
      case 'advanced': return '⭐⭐⭐';
      default: return '⭐';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src="/logo.png" 
                alt="ImpactHub Logo" 
                className="h-10 w-10 object-contain"
              />
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-heading font-bold text-gray-900">
                  Welcome back, {user?.user_metadata?.name || 'Learner'}! 👋
                </h1>
                <p className="text-gray-600 text-sm">Ready for today's lesson?</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-yellow-100 px-3 py-1 rounded-full">
                <Zap className="h-4 w-4 text-yellow-600" />
                <span className="text-yellow-800 font-medium">{progress.currentStreak} day streak!</span>
              </div>
              <Button variant="outline" onClick={signOut} size="sm">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{progress.completedLessons}</div>
              <div className="text-sm text-gray-600">Lessons Done</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Star className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{progress.totalPoints}</div>
              <div className="text-sm text-gray-600">Points</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{progress.currentStreak}</div>
              <div className="text-sm text-gray-600">Day Streak</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{progress.badges.length}</div>
              <div className="text-sm text-gray-600">Badges</div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {navigationItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "outline"}
              onClick={() => setActiveTab(item.id)}
              className={`h-20 flex-col gap-2 text-lg ${
                activeTab === item.id 
                  ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <item.icon className="h-8 w-8" />
              {item.label}
            </Button>
          ))}
        </div>

        {/* Content Area */}
        <div className="space-y-6">
          {activeTab === 'lessons' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-heading font-bold text-gray-900">
                  Today's Lessons
                </h2>
                <Button className="bg-gradient-to-r from-blue-600 to-green-600">
                  <Play className="mr-2 h-4 w-4" />
                  Continue Learning
                </Button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lessons.map((lesson) => (
                  <Card key={lesson.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <Badge className={getCategoryColor(lesson.category)}>
                          {lesson.category}
                        </Badge>
                        <div className="text-lg">{getDifficultyIcon(lesson.difficulty)}</div>
                      </div>
                      
                      <h3 className="font-semibold text-gray-900 mb-2 text-lg">
                        {lesson.title}
                      </h3>
                      
                      <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                        {lesson.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          {lesson.duration} min
                        </div>
                        
                        {lesson.completed ? (
                          <Badge className="bg-green-100 text-green-800">
                            ✓ Completed
                          </Badge>
                        ) : (
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            <Play className="mr-1 h-3 w-3" />
                            Start
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'practice' && (
            <div>
              <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">
                Practice Speaking
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mic className="h-10 w-10 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Voice Practice</h3>
                    <p className="text-gray-600 mb-4">Practice pronunciation with AI feedback</p>
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      Start Speaking Practice
                    </Button>
                  </div>
                </Card>
                
                <Card className="p-6">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Volume2 className="h-10 w-10 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Listen & Repeat</h3>
                    <p className="text-gray-600 mb-4">Improve listening skills with audio lessons</p>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Start Listening Practice
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'mentor' && (
            <div>
              <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">
                Connect with Mentors
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="h-10 w-10 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Find a Mentor</h3>
                    <p className="text-gray-600 mb-4">Connect with experienced learners in your area</p>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      Find Mentors
                    </Button>
                  </div>
                </Card>
                
                <Card className="p-6">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="h-10 w-10 text-orange-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Learning Groups</h3>
                    <p className="text-gray-600 mb-4">Join study groups with other learners</p>
                    <Button className="w-full bg-orange-600 hover:bg-orange-700">
                      Join Groups
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'progress' && (
            <div>
              <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">
                Your Learning Progress
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Achievements</h3>
                  <div className="space-y-3">
                    {progress.badges.map((badge, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                        <Award className="h-6 w-6 text-yellow-600" />
                        <span className="font-medium text-gray-900">{badge}</span>
                      </div>
                    ))}
                  </div>
                </Card>
                
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Learning Stats</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Lessons Completed</span>
                      <span className="font-semibold">{progress.completedLessons}/{progress.totalLessons}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-600 to-green-600 h-2 rounded-full"
                        style={{ width: `${(progress.completedLessons / progress.totalLessons) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Current Streak</span>
                      <span className="font-semibold">{progress.currentStreak} days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Points</span>
                      <span className="font-semibold">{progress.totalPoints}</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImpactLearnDashboard;