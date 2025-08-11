import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, 
  BookOpen, 
  Grid,
  List
} from 'lucide-react';
import GradeExplanation from './GradeExplanation';
import LessonCard from './LessonCard';

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

  // Debounced search to prevent excessive API calls
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchSubjects();
  }, []); // Only fetch subjects once

  useEffect(() => {
    fetchLessons();
  }, [user, selectedSubject, selectedDifficulty, sortBy]); // Removed userProfile dependency

  const fetchSubjects = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('id, name, color, icon') // Only select needed fields
        .order('name');

      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  }, []);

  const fetchLessons = useCallback(async () => {
    try {
      setLoading(true);
      
      // Optimized query with minimal data selection
      let query = supabase
        .from('simple_lessons')
        .select(`
          id,
          title,
          description,
          difficulty_level,
          duration_minutes,
          subject_id,
          subjects!inner (
            id,
            name,
            color,
            icon
          )
        `)
        .eq('is_published', true)
        .not('subject_id', 'is', null)
        .limit(20); // Reduced limit for faster loading

      // Apply filters
      if (selectedSubject !== 'all') {
        query = query.eq('subject_id', selectedSubject);
      }

      if (selectedDifficulty !== 'all') {
        query = query.eq('difficulty_level', selectedDifficulty);
      }

      // Apply sorting with index optimization
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
          query = query.order('order_index', { ascending: true }); // Use indexed column
      }

      // Batch queries with timeout protection
      const queryPromises = [
        query,
        user ? supabase
          .from('lesson_progress')
          .select('lesson_id, status, progress_percentage')
          .eq('user_id', user.id)
          .limit(100) : Promise.resolve({ data: [] }),
        user ? supabase
          .from('user_bookmarks')
          .select('lesson_id')
          .eq('user_id', user.id)
          .limit(100) : Promise.resolve({ data: [] })
      ];

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), 10000)
      );

      const [
        { data: lessonsData, error: lessonsError },
        { data: progressData },
        { data: bookmarksData }
      ] = await Promise.race([
        Promise.all(queryPromises),
        timeoutPromise
      ]) as any;

      if (lessonsError) {
        console.error('Lessons query error:', lessonsError);
        throw lessonsError;
      }

      // Optimized data processing
      const progressMap = new Map(
        (progressData || []).map(p => [p.lesson_id, p])
      );
      const bookmarksSet = new Set(
        (bookmarksData || []).map(b => b.lesson_id)
      );

      // Efficient data combination
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
  }, [selectedSubject, selectedDifficulty, sortBy, user]);

  const toggleBookmark = useCallback(async (lessonId: string) => {
    if (!user) return;

    // Optimistic update for better UX
    setLessons(prev => prev.map(l => 
      l.id === lessonId 
        ? { ...l, is_bookmarked: !l.is_bookmarked }
        : l
    ));

    try {
      const lesson = lessons.find(l => l.id === lessonId);
      if (!lesson) return;

      if (!lesson.is_bookmarked) { // Note: inverted because we already updated optimistically
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
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      // Revert optimistic update on error
      setLessons(prev => prev.map(l => 
        l.id === lessonId 
          ? { ...l, is_bookmarked: !l.is_bookmarked }
          : l
      ));
    }
  }, [user, lessons]);

  const startLesson = useCallback(async (lessonId: string) => {
    if (!user) return;

    // Optimistic update
    setLessons(prev => prev.map(l => 
      l.id === lessonId 
        ? { 
            ...l, 
            progress: { 
              status: 'in_progress' as const, 
              progress_percentage: l.progress?.progress_percentage || 0 
            }
          }
        : l
    ));

    try {
      await supabase
        .from('lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          status: 'in_progress',
          started_at: new Date().toISOString(),
          last_accessed: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error starting lesson:', error);
      // Revert optimistic update on error
      setLessons(prev => prev.map(l => 
        l.id === lessonId 
          ? { 
              ...l, 
              progress: { 
                status: 'not_started' as const, 
                progress_percentage: 0 
              }
            }
          : l
      ));
    }
  }, [user]);

  // Memoized filtering for better performance
  const filteredLessons = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return lessons;
    
    const searchLower = debouncedSearchTerm.toLowerCase();
    return lessons.filter(lesson =>
      lesson.title.toLowerCase().includes(searchLower) ||
      lesson.description.toLowerCase().includes(searchLower) ||
      (lesson.subject?.name && lesson.subject.name.toLowerCase().includes(searchLower))
    );
  }, [lessons, debouncedSearchTerm]);



  // Optimized loading skeleton
  const LoadingSkeleton = useMemo(() => (
    <div className="space-y-6">
      <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }, (_, i) => (
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
  ), []);

  if (loading) {
    return LoadingSkeleton;
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
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              onToggleBookmark={toggleBookmark}
              onStartLesson={startLesson}
            />
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