import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SubjectMeta {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface LessonRecord {
  id: string;
  title: string;
  description: string;
  difficulty_level: string;
  duration_minutes: number;
  subject_id: string;
  order_index: number;
  grade: number | null;
  subjects?: SubjectMeta; // joined alias
  subject?: SubjectMeta;  // normalized final
  progress?: {
    status: 'not_started' | 'in_progress' | 'completed';
    progress_percentage: number;
  };
  is_bookmarked: boolean;
  is_locked: boolean;
}

interface UseLessonsParams {
  subject: string;          // 'all' or id
  difficulty: string;       // 'all' or difficulty_level
  userId?: string | null;   // undefined means still resolving auth
  grade?: number | null;
  isAdmin?: boolean;
  sortBy: string;
  limit?: number;
  enabled?: boolean;
}

interface UseLessonsResult {
  lessons: LessonRecord[] | null; // null means never loaded, keep consumer skeleton
  loading: boolean;
  error: string | null;
  stale: boolean; // true when showing cached while refreshing
  refetch: () => void;
}

// Helper to compute lock status once instead of per render later
function computeLockFlags(list: LessonRecord[], progressMap: Map<string, any>): LessonRecord[] {
  const hasAnyCompleted = Array.from(progressMap.values()).some(p => p.status === 'completed');
  return list
    .sort((a, b) => a.order_index - b.order_index)
    .map((l, idx) => {
      let isLocked = false;
      if (idx > 0) {
        isLocked = !hasAnyCompleted; // unlock all after any completion
      }
      return { ...l, is_locked: isLocked };
    });
}

export function useLessons(params: UseLessonsParams): UseLessonsResult {
  const { subject, difficulty, userId, grade, isAdmin, sortBy, limit = 10, enabled = true } = params;

  const [data, setData] = useState<LessonRecord[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previousDataRef = useRef<LessonRecord[] | null>(null);
  const inFlightRef = useRef<{ key: string; abort: AbortController } | null>(null);
  const visibilityHandlerAttached = useRef(false);

  const buildKey = () => `${subject}|${difficulty}|${grade ?? 'nograde'}|${sortBy}|${limit}`;

  const fetchLessons = useCallback(async () => {
    if (!enabled) return;
    if (userId === undefined) return; // still resolving auth

    const key = buildKey();
    if (inFlightRef.current?.key === key) return; // duplicate

    // Abort previous
    if (inFlightRef.current) {
      inFlightRef.current.abort.abort();
    }
    const abort = new AbortController();
    inFlightRef.current = { key, abort };

    setLoading(true);
    setError(null);

    try {
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
        .limit(limit);

      if (subject !== 'all') query = query.eq('subject_id', subject);
      if (difficulty !== 'all') query = query.eq('difficulty_level', difficulty);
      if (grade && !isAdmin) query = query.eq('grade', grade);

      switch (sortBy) {
        case 'title': query = query.order('title'); break;
        case 'difficulty': query = query.order('difficulty_level'); break;
        case 'duration': query = query.order('duration_minutes'); break;
        default: query = query.order('order_index', { ascending: true });
      }

      const { data: lessonsData, error: lessonsError } = await query;
      if (abort.signal.aborted) return;
      if (lessonsError) throw lessonsError;

      // Subjects: normalize (already partially joined)
      const subjectIds = lessonsData ? [...new Set(lessonsData.filter(l => l.subject_id).map(l => l.subject_id))] : [];
      let subjectMap: Record<string, SubjectMeta> = {};
      if (subjectIds.length > 0) {
        const { data: subjectsData } = await supabase
          .from('subjects')
          .select('id, name, color, icon')
          .in('id', subjectIds);
        subjectMap = (subjectsData || []).reduce((acc, s) => { acc[s.id] = s; return acc; }, {} as Record<string, SubjectMeta>);
      }

      // User-specific progress + bookmarks
      let progressMap = new Map<string, any>();
      let bookmarkSet = new Set<string>();
      if (userId) {
        const [progressRes, bookmarksRes] = await Promise.all([
          supabase.from('lesson_progress').select('lesson_id, status, progress_percentage').eq('user_id', userId),
          supabase.from('user_bookmarks').select('lesson_id').eq('user_id', userId)
        ]);
        progressMap = new Map((progressRes.data || []).map(p => [p.lesson_id, p]));
        bookmarkSet = new Set((bookmarksRes.data || []).map(b => b.lesson_id));
      }

      const enriched: LessonRecord[] = (lessonsData || []).map((l: any) => {
        // l.subjects may be an object or an array depending on join shape; normalize
        let joinedSubject: any = l.subjects as any;
        if (Array.isArray(joinedSubject)) {
          joinedSubject = joinedSubject[0];
        }
        const subj: SubjectMeta = (l.subject_id && subjectMap[l.subject_id]) || joinedSubject || { id: 'unknown', name: 'Unknown', color: '#ccc', icon: 'book' };
        const progress = progressMap.get(l.id);
        return {
          ...l,
          subject: subj,
          progress: progress ? { status: progress.status, progress_percentage: progress.progress_percentage } : { status: 'not_started', progress_percentage: 0 },
          is_bookmarked: bookmarkSet.has(l.id),
          is_locked: false // compute later
        };
      });

      const finalList = computeLockFlags(enriched, progressMap);
      previousDataRef.current = finalList;
      setData(finalList);
    } catch (e: any) {
      if (abort.signal.aborted) return;
      setError(e.message || 'Failed to load lessons');
      // Preserve previous
      if (previousDataRef.current) {
        setData(previousDataRef.current);
      }
    } finally {
      if (!abort.signal.aborted) {
        setLoading(false);
        if (inFlightRef.current?.abort === abort) inFlightRef.current = null;
      }
    }
  }, [subject, difficulty, userId, grade, isAdmin, sortBy, limit, enabled]);

  // Fetch on param change
  useEffect(() => { fetchLessons(); }, [fetchLessons]);

  // Visibility-based silent revalidate (attach once)
  useEffect(() => {
    if (visibilityHandlerAttached.current) return;
    const handler = () => {
      if (document.hidden) return;
      setTimeout(() => { fetchLessons(); }, 300); // allow auth refresh to settle
    };
    document.addEventListener('visibilitychange', handler);
    visibilityHandlerAttached.current = true;
    return () => document.removeEventListener('visibilitychange', handler);
  }, [fetchLessons]);

  return {
    lessons: data ?? previousDataRef.current,
    loading,
    error,
    stale: data === null && previousDataRef.current !== null,
    refetch: fetchLessons
  };
}
