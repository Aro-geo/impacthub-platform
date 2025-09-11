import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { aiLearningObserver } from '@/services/aiLearningObserver';
import { 
  Search, 
  BookOpen, 
  Grid,
  List,
  CheckCircle
} from 'lucide-react';
import GradeExplanation from './GradeExplanation';
import LessonCard from './LessonCard';
import LessonViewer from './LessonViewer';

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
  order_index: number;
  progress?: {
    status: 'not_started' | 'in_progress' | 'completed';
    progress_percentage: number;
  };
  is_bookmarked: boolean;
  is_locked: boolean;
}

interface LessonsSectionProps {
  showSearch?: boolean;
  maxLessons?: number;
  className?: string;
}

const LessonsSection: React.FC<LessonsSectionProps> = ({ 
  showSearch = true, 
  maxLessons,
  className = ''
}) => {
  const { user, userProfile, isAdmin } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('title');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

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
    
    // Setup event listener for lesson completion to refresh lessons list
    const handleLessonCompleted = () => {
      fetchLessons();
    };
    
    window.addEventListener('lessonCompleted', handleLessonCompleted);
    
    return () => {
      window.removeEventListener('lessonCompleted', handleLessonCompleted);
    };
  }, []); // Only fetch subjects once

  useEffect(() => {
    fetchLessons();
    // Initialize AI Learning Observer when user opens lessons (removed duplicate initialization)
  }, [user, selectedSubject, selectedDifficulty, sortBy]);

  const fetchSubjects = useCallback(async () => {
    try {
      console.log('Fetching all subjects');
      const { data, error } = await supabase
        .from('subjects')
        .select('id, name, color, icon') // Only select needed fields
        .order('name');

      if (error) {
        console.error('Error fetching subjects:', error);
        throw error;
      }
      
      console.log('Subjects fetched:', data);
      
      // Ensure required fields have fallbacks
      const processedSubjects = (data || []).map(subject => ({
        ...subject,
        color: subject.color || '#3b82f6',
        icon: subject.icon || 'BookOpen'
      }));
      
      setSubjects(processedSubjects);
    } catch (error) {
      console.error('Error in fetchSubjects:', error);
      setSubjects([]);
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
          order_index,
          grade,
          subjects!fk_subject (
            id,
            name,
            color,
            icon
          )
        `)
        .eq('is_published', true)
        .not('subject_id', 'is', null)
        .limit(10); // Further reduced limit for faster loading

      // Apply filters
      if (selectedSubject !== 'all') {
        query = query.eq('subject_id', selectedSubject);
      }

      if (selectedDifficulty !== 'all') {
        query = query.eq('difficulty_level', selectedDifficulty);
      }

      // Filter by user grade for non-admin users only
      if (userProfile?.grade && !isAdmin) {
        query = query.eq('grade', userProfile.grade);
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

      // Execute main query first
      console.log('Fetching lessons for subject:', selectedSubject, 'difficulty:', selectedDifficulty);
      const { data: lessonsData, error: lessonsError } = await query;
      console.log('Lessons query result:', { lessonsData, lessonsError });
      
      // Always fetch subjects directly to avoid relying on join
      let subjectMap: Record<string, any> = {};
      try {
        // Get all subject IDs from lessons
        const subjectIds = lessonsData ? [...new Set(lessonsData.filter(l => l.subject_id).map(l => l.subject_id))] : [];
        console.log('Subject IDs from lessons:', subjectIds);
        
        if (subjectIds.length > 0) {
          // Fetch subjects directly
          const { data: subjectsData, error: subjectsError } = await supabase
            .from('subjects')
            .select('id, name, color, icon')
            .in('id', subjectIds);
            
          if (subjectsError) {
            console.warn('Error fetching subjects:', subjectsError);
          } else {
            console.log('Fetched subjects:', subjectsData);
            
            // Create a map for faster lookups
            subjectMap = (subjectsData || []).reduce((acc, subject) => {
              acc[subject.id] = subject;
              return acc;
            }, {} as Record<string, any>);
          }
        }
      } catch (subjectError) {
        console.error('Error in subject fetching process:', subjectError);
      }
      
      // Get progress and bookmarks separately (optional)
      let progressData = [];
      let bookmarksData = [];
      
      if (user) {
        try {
          const [progressResult, bookmarksResult] = await Promise.all([
            supabase.from('lesson_progress').select('lesson_id, status, progress_percentage').eq('user_id', user.id),
            supabase.from('user_bookmarks').select('lesson_id').eq('user_id', user.id)
          ]);
          progressData = progressResult.data || [];
          bookmarksData = bookmarksResult.data || [];
        } catch (error) {
          console.warn('Error fetching user data:', error);
        }
      }

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

      // Efficient data combination with unlock-after-first-completion logic
      const lessonsWithProgress = (lessonsData || [])
        .sort((a, b) => a.order_index - b.order_index) // Sort by order first
        .map((lesson, index, sortedLessons) => {
          const progress = progressMap.get(lesson.id);
          
          // Determine if lesson is locked - unlock all lessons if any lesson has been completed
          let isLocked = false;
          if (index > 0) {
            // Check if ANY lesson has been completed
            const hasAnyCompletedLesson = Array.from(progressMap.values()).some(
              p => p.status === 'completed'
            );
            // Lock only if no lessons have been completed yet
            isLocked = !hasAnyCompletedLesson;
          }
          
          // Get subject from our map or fallback
          const subject = lesson.subject_id && subjectMap[lesson.subject_id] 
            ? subjectMap[lesson.subject_id]
            : (lesson.subjects || { id: 'unknown', name: 'Unknown', color: '#cccccc', icon: 'book' });
            
          return {
            ...lesson,
            subject: subject,
            progress: progress ? {
              status: progress.status,
              progress_percentage: progress.progress_percentage
            } : { status: 'not_started' as const, progress_percentage: 0 },
            is_bookmarked: bookmarksSet.has(lesson.id),
            is_locked: isLocked
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

    // Check if lesson is locked
    const lesson = lessons.find(l => l.id === lessonId);
    if (lesson?.is_locked) {
      alert('Please complete any lesson first to unlock all other lessons.');
      return;
    }

    // Open the lesson viewer instead of just updating status
    setSelectedLessonId(lessonId);

    // Update lesson status to in_progress
    try {
      await supabase
        .from('lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          status: 'in_progress',
          started_at: new Date().toISOString(),
          last_accessed: new Date().toISOString()
        }, {
          onConflict: 'user_id,lesson_id',
          ignoreDuplicates: false
        });
      
      // Refresh lessons to update UI
      fetchLessons();
    } catch (error) {
      console.error('Error starting lesson:', error);
    }
  }, [user, lessons, fetchLessons]);

  // Memoized filtering for better performance
  const filteredLessons = useMemo(() => {
    let filtered = lessons;
    
    // Apply search filter if search term exists
    if (debouncedSearchTerm.trim()) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(lesson =>
        lesson.title.toLowerCase().includes(searchLower) ||
        lesson.description.toLowerCase().includes(searchLower) ||
        (lesson.subject?.name && lesson.subject.name.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply maxLessons limit if specified
    if (maxLessons && maxLessons > 0) {
      filtered = filtered.slice(0, maxLessons);
    }
    
    return filtered;
  }, [lessons, debouncedSearchTerm, maxLessons]);



  // Optimized loading skeleton
  const LoadingSkeleton = useMemo(() => (
    <div className="space-y-6">
      <div className="h-8 bg-muted rounded w-1/4 animate-pulse"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }, (_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-full mb-4"></div>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  ), []);

  if (loading) {
    return LoadingSkeleton;
  }

  // Show lesson viewer if a lesson is selected
  if (selectedLessonId) {
    return (
      <LessonViewer
        lessonId={selectedLessonId}
        onClose={() => setSelectedLessonId(null)}
        onLessonComplete={() => {
          // Refresh lessons when lesson is completed to unlock next lesson
          fetchLessons();
          // Close the lesson viewer after completion
          setSelectedLessonId(null);
        }}
      />
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>

      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Browse Lessons</h2>
          <p className="text-muted-foreground">
            {user && filteredLessons.some(l => !l.is_locked) && filteredLessons.some(l => l.is_locked)
              ? "Complete any lesson to unlock all others"
              : user && filteredLessons.every(l => !l.is_locked) && filteredLessons.length > 0
              ? "All lessons unlocked! Choose any lesson to continue learning"
              : "Explore and learn at your own pace"
            }
          </p>
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

      {/* Grade Explanation - show for admins or users with grade */}
      {(userProfile?.grade || isAdmin) && (
        <GradeExplanation userGrade={userProfile?.grade} />
      )}

      {/* Unlock Status Notification */}
      {user && filteredLessons.length > 0 && (
        <>
          {filteredLessons.every(l => !l.is_locked) && filteredLessons.some(l => l.progress?.status === 'completed') && (
            <Card className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 text-green-800 dark:text-green-300">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">🎉 Great job! All lessons are now unlocked. Choose any lesson to continue your learning journey!</span>
                </div>
              </CardContent>
            </Card>
          )}
          {filteredLessons.some(l => l.is_locked) && (
            <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 text-blue-800 dark:text-blue-300">
                  <BookOpen className="h-5 w-5" />
                  <span className="font-medium">Start with the first lesson to unlock all others and explore freely!</span>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Filters */}
      {showSearch && (
        <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
      )}

      {/* Lessons Grid/List - Only show when subject is selected */}
      {selectedSubject !== 'all' && filteredLessons.length > 0 ? (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          : "space-y-3 sm:space-y-4"
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
      ) : selectedSubject === 'all' ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Choose Your Learning Path</h3>
            <p className="text-muted-foreground mb-6">
              Master the fundamentals of Science, Technology, and Mathematics
            </p>
            <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <button
                onClick={() => {
                  const scienceSubject = subjects.find(s => s.name === 'Science');
                  if (scienceSubject) setSelectedSubject(scienceSubject.id);
                }}
                className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 rounded-lg transition-colors border border-green-200 dark:border-green-800"
              >
                <div className="text-3xl mb-3">🔬</div>
                <h4 className="font-semibold text-foreground mb-2">Science</h4>
                <p className="text-sm text-muted-foreground">The systematic study of the natural world</p>
              </button>
              <button
                onClick={() => {
                  const techSubject = subjects.find(s => s.name === 'Technology');
                  if (techSubject) setSelectedSubject(techSubject.id);
                }}
                className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 rounded-lg transition-colors border border-blue-200 dark:border-blue-800"
              >
                <div className="text-3xl mb-3">💻</div>
                <h4 className="font-semibold text-foreground mb-2">Technology</h4>
                <p className="text-sm text-muted-foreground">Tools, systems, and processes to solve problems</p>
              </button>
              <button
                onClick={() => {
                  const mathSubject = subjects.find(s => s.name === 'Mathematics');
                  if (mathSubject) setSelectedSubject(mathSubject.id);
                }}
                className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 rounded-lg transition-colors border border-purple-200 dark:border-purple-800"
              >
                <div className="text-3xl mb-3">📊</div>
                <h4 className="font-semibold text-foreground mb-2">Mathematics</h4>
                <p className="text-sm text-muted-foreground">Numbers, patterns, and algebraic reasoning</p>
              </button>
            </div>
          </CardContent>
        </Card>
      ) : selectedSubject !== 'all' ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No lessons found</h3>
            <p className="text-muted-foreground mb-6">
              No lessons available for the selected subject and filters
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setSelectedDifficulty('all');
              }}
            >
              Clear Search & Difficulty Filters
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

export default LessonsSection;