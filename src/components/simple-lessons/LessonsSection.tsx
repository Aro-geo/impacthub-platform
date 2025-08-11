import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, 
  Filter, 
  BookOpen, 
  Play, 
  CheckCircle, 
  Clock, 
  Bookmark, 
  BookmarkCheck,
  Grid,
  List,
  Star
} from 'lucide-react';
import GradeExplanation from './GradeExplanation';

interface Subject {
  id: string;
  name: string;
  color: string;
  icon: string;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  difficulty_level: string;
  duration_minutes: number;
  subject: Subject;
  progress?: {
    status: 'not_started' | 'in_progress' | 'completed';
    progress_percentage: number;
  };
  is_bookmarked: boolean;
}

const LessonsSection = () => {
  const { user, userProfile } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('title');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchSubjects();
    fetchLessons();
  }, [user, selectedSubject, selectedDifficulty, sortBy]);

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name');

      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchLessons = async () => {
    try {
      setLoading(true);
      
      // Get user grade from userProfile instead of making separate query
      const userGrade = userProfile?.grade;
      
      let query = supabase
        .from('simple_lessons')
        .select(`
          id,
          title,
          description,
          difficulty_level,
          duration_minutes,
          grade,
          subject_id,
          subjects!inner (
            id,
            name,
            color,
            icon
          )
        `)
        .eq('is_published', true)
        .limit(50); // Limit results for better performance

      // Apply grade filter if user has a grade set
      if (userGrade) {
        // Show lessons for user's grade and one grade above/below for flexibility
        const gradeFilters = [userGrade];
        if (userGrade > 1) gradeFilters.push(userGrade - 1);
        if (userGrade < 12) gradeFilters.push(userGrade + 1);
        
        query = query.or(`grade.is.null,grade.in.(${gradeFilters.join(',')})`);
      }

      // Apply filters
      if (selectedSubject !== 'all') {
        query = query.eq('subject_id', selectedSubject);
      }

      if (selectedDifficulty !== 'all') {
        query = query.eq('difficulty_level', selectedDifficulty);
      }

      // Apply sorting
      switch (sortBy) {
        case 'title':
          query = query.order('title');
          break;
        case 'difficulty':
          query = query.order('difficulty_level');
          break;
        case 'duration':
          query = query.order('duration_minutes');
          break;
        default:
          query = query.order('order_index');
      }

      // Batch all queries for better performance
      const [
        { data: lessonsData, error: lessonsError },
        { data: progressData },
        { data: bookmarksData }
      ] = await Promise.all([
        query,
        user ? supabase
          .from('lesson_progress')
          .select('lesson_id, status, progress_percentage')
          .eq('user_id', user.id) : Promise.resolve({ data: [] }),
        user ? supabase
          .from('user_bookmarks')
          .select('lesson_id')
          .eq('user_id', user.id) : Promise.resolve({ data: [] })
      ]);

      if (lessonsError) throw lessonsError;

      // Create lookup maps for better performance
      const progressMap = new Map(
        (progressData || []).map(p => [p.lesson_id, p])
      );
      const bookmarksSet = new Set(
        (bookmarksData || []).map(b => b.lesson_id)
      );

      // Combine data efficiently
      const lessonsWithProgress = (lessonsData || []).map(lesson => {
        const progress = progressMap.get(lesson.id);
        
        return {
          ...lesson,
          subject: lesson.subjects,
          progress: progress ? {
            status: progress.status,
            progress_percentage: progress.progress_percentage
          } : { status: 'not_started' as const, progress_percentage: 0 },
          is_bookmarked: bookmarksSet.has(lesson.id)
        };
      });

      setLessons(lessonsWithProgress);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      setLessons([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleBookmark = async (lessonId: string) => {
    if (!user) return;

    try {
      const lesson = lessons.find(l => l.id === lessonId);
      if (!lesson) return;

      if (lesson.is_bookmarked) {
        await supabase
          .from('user_bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('lesson_id', lessonId);
      } else {
        await supabase
          .from('user_bookmarks')
          .insert({
            user_id: user.id,
            lesson_id: lessonId
          });
      }

      // Update local state
      setLessons(prev => prev.map(l => 
        l.id === lessonId 
          ? { ...l, is_bookmarked: !l.is_bookmarked }
          : l
      ));
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const startLesson = async (lessonId: string) => {
    if (!user) return;

    try {
      // Create or update progress
      await supabase
        .from('lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          status: 'in_progress',
          started_at: new Date().toISOString(),
          last_accessed: new Date().toISOString()
        });

      // Refresh lessons to show updated progress
      fetchLessons();
    } catch (error) {
      console.error('Error starting lesson:', error);
    }
  };

  const filteredLessons = lessons.filter(lesson =>
    lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lesson.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lesson.subject.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <Play className="h-4 w-4 text-blue-600" />;
      default:
        return <BookOpen className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in_progress': return 'In Progress';
      default: return 'Not Started';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Browse Lessons</h2>
          <p className="text-gray-600">Explore and learn at your own pace</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Grade Explanation */}
      {userProfile?.grade && (
        <GradeExplanation userGrade={userProfile.grade} />
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search lessons..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map(subject => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="difficulty">Difficulty</SelectItem>
                <SelectItem value="duration">Duration</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lessons Grid/List */}
      {filteredLessons.length > 0 ? (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          : "space-y-4"
        }>
          {filteredLessons.map((lesson) => (
            <Card key={lesson.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs">
                      {lesson.subject.name}
                    </Badge>
                    <Badge className={getDifficultyColor(lesson.difficulty_level)}>
                      {lesson.difficulty_level}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleBookmark(lesson.id)}
                    className="h-8 w-8 p-0"
                  >
                    {lesson.is_bookmarked ? (
                      <BookmarkCheck className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Bookmark className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>

                <h3 className="font-semibold text-gray-900 mb-2 text-lg">
                  {lesson.title}
                </h3>

                <p className="text-gray-600 mb-4 text-sm leading-relaxed line-clamp-3">
                  {lesson.description}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{lesson.duration_minutes} min</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(lesson.progress?.status || 'not_started')}
                      <span>{getStatusText(lesson.progress?.status || 'not_started')}</span>
                    </div>
                  </div>
                </div>

                {lesson.progress?.status === 'in_progress' && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="text-gray-900 font-medium">
                        {lesson.progress.progress_percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${lesson.progress.progress_percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  {lesson.progress?.status === 'completed' ? (
                    <Button variant="outline" className="flex-1">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Review
                    </Button>
                  ) : (
                    <Button 
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      onClick={() => startLesson(lesson.id)}
                    >
                      <Play className="mr-2 h-4 w-4" />
                      {lesson.progress?.status === 'in_progress' ? 'Continue' : 'Start'}
                    </Button>
                  )}
                  
                  <Badge className={getStatusColor(lesson.progress?.status || 'not_started')}>
                    {getStatusText(lesson.progress?.status || 'not_started')}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No lessons found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search or filter criteria
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setSelectedSubject('all');
                setSelectedDifficulty('all');
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LessonsSection;