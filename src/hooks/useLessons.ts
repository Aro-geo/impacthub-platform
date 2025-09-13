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
  const requestCounterRef = useRef(0);
  const mountedRef = useRef(false);

  // Initial mount log
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      console.debug('[useLessons] mount', { params: { subject, difficulty, grade, isAdmin, sortBy, limit, enabled }, userId });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buildKey = () => `${subject}|${difficulty}|${grade ?? 'nograde'}|${sortBy}|${limit}`;

  const fetchLessons = useCallback(async () => {
    const reqId = ++requestCounterRef.current;
    const t0 = performance.now();
    const log = (phase: string, extra?: any) => {
      // Consolidated structured debug log
      console.debug('[useLessons]', phase, { reqId, key: buildKey(), userId, enabled, subject, difficulty, grade, sortBy, limit, ...extra });
    };

    if (!enabled) { log('skip:disabled'); return; }
    if (userId === undefined) { log('skip:auth-resolving'); return; }

    const key = buildKey();
    if (inFlightRef.current?.key === key) { log('skip:dedupe-inflight'); return; }

    // Abort previous (different key)
    if (inFlightRef.current) {
      inFlightRef.current.abort.abort();
      log('abort:previous', { prevKey: inFlightRef.current.key });
    }
    const abort = new AbortController();
    inFlightRef.current = { key, abort };

    setLoading(true);
    setError(null);
    log('start');

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
      if (abort.signal.aborted) { log('aborted:after-lessons-query'); return; }
      if (lessonsError) throw lessonsError;
      log('lessons-query:success', { count: lessonsData?.length, ms: +(performance.now() - t0).toFixed(1) });

      // Subjects: normalize (already partially joined)
      const subjectIds = lessonsData ? [...new Set(lessonsData.filter(l => l.subject_id).map(l => l.subject_id))] : [];
      let subjectMap: Record<string, SubjectMeta> = {};
      if (subjectIds.length > 0) {
        const { data: subjectsData } = await supabase
          .from('subjects')
          .select('id, name, color, icon')
          .in('id', subjectIds);
        subjectMap = (subjectsData || []).reduce((acc, s) => { acc[s.id] = s; return acc; }, {} as Record<string, SubjectMeta>);
        if (abort.signal.aborted) { log('aborted:after-subjects'); return; }
        log('subjects:loaded', { count: subjectsData?.length });
      } else {
        log('subjects:skip:none-needed');
      }

      // User-specific progress + bookmarks
      let progressMap = new Map<string, any>();
      let bookmarkSet = new Set<string>();
      if (userId) {
        const tUser = performance.now();
        const [progressRes, bookmarksRes] = await Promise.all([
          supabase.from('lesson_progress').select('lesson_id, status, progress_percentage').eq('user_id', userId),
          supabase.from('user_bookmarks').select('lesson_id').eq('user_id', userId)
        ]);
        if (abort.signal.aborted) { log('aborted:after-user-queries'); return; }
        progressMap = new Map((progressRes.data || []).map(p => [p.lesson_id, p]));
        bookmarkSet = new Set((bookmarksRes.data || []).map(b => b.lesson_id));
        log('user-meta:loaded', { progress: progressMap.size, bookmarks: bookmarkSet.size, ms: +(performance.now() - tUser).toFixed(1) });
      } else {
        log('user-meta:skip:no-user');
      }

      const enrichStart = performance.now();
      const enriched: LessonRecord[] = (lessonsData || []).map((l: any) => {
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
          is_locked: false
        };
      });
      const finalList = computeLockFlags(enriched, progressMap);
      previousDataRef.current = finalList;
      setData(finalList);
      log('complete:success', { final: finalList.length, enrichMs: +(performance.now() - enrichStart).toFixed(1), totalMs: +(performance.now() - t0).toFixed(1) });
    } catch (e: any) {
      if (abort.signal.aborted) { log('aborted:error-stage'); return; }
      setError(e.message || 'Failed to load lessons');
      if (previousDataRef.current) {
        setData(previousDataRef.current);
        log('error:showing-stale', { message: e.message });
      } else {
        log('error:no-stale', { message: e.message });
      }
    } finally {
      if (!abort.signal.aborted) {
        setLoading(false);
        if (inFlightRef.current?.abort === abort) inFlightRef.current = null;
        log('finalize', { loading: false });
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
      console.debug('[useLessons] visibility:revalidate');
      setTimeout(() => { fetchLessons(); }, 300); // allow auth refresh to settle
    };
    document.addEventListener('visibilitychange', handler);
    visibilityHandlerAttached.current = true;
    return () => {
      document.removeEventListener('visibilitychange', handler);
      console.debug('[useLessons] visibility handler removed');
    };
  }, [fetchLessons]);

  const stale = data === null && previousDataRef.current !== null;
  if (stale) {
    // Log once per stale exposure
    console.debug('[useLessons] state:stale-presenting', { previousCount: previousDataRef.current?.length });
  }

  return {
    lessons: data ?? previousDataRef.current,
    loading,
    error,
    stale,
    refetch: fetchLessons
  };
}
