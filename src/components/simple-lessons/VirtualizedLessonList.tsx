import React, { memo, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
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

interface VirtualizedLessonListProps {
  lessons: Lesson[];
  onToggleBookmark: (lessonId: string) => void;
  onStartLesson: (lessonId: string) => void;
  viewMode: 'grid' | 'list';
}

const VirtualizedLessonList = memo(({ 
  lessons, 
  onToggleBookmark, 
  onStartLesson, 
  viewMode 
}: VirtualizedLessonListProps) => {
  const itemHeight = viewMode === 'grid' ? 400 : 200;
  const containerHeight = Math.min(lessons.length * itemHeight, 800);

  const Row = memo(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const lesson = lessons[index];
    
    return (
      <div style={style}>
        <div className="p-3">
          <LessonCard
            lesson={lesson}
            onToggleBookmark={onToggleBookmark}
            onStartLesson={onStartLesson}
          />
        </div>
      </div>
    );
  });

  Row.displayName = 'VirtualizedRow';

  // Only use virtualization for large lists
  if (lessons.length < 20) {
    return (
      <div className={viewMode === 'grid' 
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        : "space-y-4"
      }>
        {lessons.map((lesson) => (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            onToggleBookmark={onToggleBookmark}
            onStartLesson={onStartLesson}
          />
        ))}
      </div>
    );
  }

  return (
    <List
      height={containerHeight}
      itemCount={lessons.length}
      itemSize={itemHeight}
      width="100%"
    >
      {Row}
    </List>
  );
});

VirtualizedLessonList.displayName = 'VirtualizedLessonList';

export default VirtualizedLessonList;