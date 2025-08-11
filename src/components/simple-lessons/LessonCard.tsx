import React, { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Play, 
  CheckCircle, 
  Clock, 
  Bookmark, 
  BookmarkCheck
} from 'lucide-react';

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

interface LessonCardProps {
  lesson: Lesson;
  onToggleBookmark: (lessonId: string) => void;
  onStartLesson: (lessonId: string) => void;
}

const LessonCard = memo(({ lesson, onToggleBookmark, onStartLesson }: LessonCardProps) => {
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

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs">
              {lesson.subject?.name || 'No Subject'}
            </Badge>
            <Badge className={getDifficultyColor(lesson.difficulty_level)}>
              {lesson.difficulty_level}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleBookmark(lesson.id)}
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
              />
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
              onClick={() => onStartLesson(lesson.id)}
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
  );
});

LessonCard.displayName = 'LessonCard';

export default LessonCard;