/**
 * This utility is designed to debug issues with the simple_lessons table
 * and help diagnose why lessons may not be displaying in the UI
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Runs a comprehensive check on the simple_lessons table and related tables
 */
export const debugSimpleLessons = async () => {
  console.log('======= SIMPLE LESSONS DEBUG UTILITY =======');

  try {
    // 1. Check if the simple_lessons table exists
    console.log('1. Checking simple_lessons table...');
    const { count: lessonCount, error: lessonCountError } = await supabase
      .from('simple_lessons')
      .select('*', { count: 'exact', head: true });

    if (lessonCountError) {
      console.error('Error accessing simple_lessons table:', lessonCountError);
      return;
    }

    console.log(`Found ${lessonCount} lessons in the database`);

    // 2. Check if subjects exist
    console.log('2. Checking subjects table...');
    const { count: subjectCount, error: subjectCountError } = await supabase
      .from('subjects')
      .select('*', { count: 'exact', head: true });

    if (subjectCountError) {
      console.error('Error accessing subjects table:', subjectCountError);
      return;
    }

    console.log(`Found ${subjectCount} subjects in the database`);

    // 3. Check a sample lesson to see its structure
    if (lessonCount > 0) {
      console.log('3. Examining a sample lesson...');
      const { data: sampleLesson, error: sampleError } = await supabase
        .from('simple_lessons')
        .select('*')
        .limit(1)
        .single();

      if (sampleError) {
        console.error('Error fetching sample lesson:', sampleError);
      } else {
        console.log('Sample lesson fields:', Object.keys(sampleLesson));
        console.log('Sample lesson subject_id:', sampleLesson.subject_id);
        console.log('Sample lesson data:', sampleLesson);
        
        // 4. Try to get the subject for this lesson
        if (sampleLesson.subject_id) {
          const { data: subjectData, error: subjectError } = await supabase
            .from('subjects')
            .select('*')
            .eq('id', sampleLesson.subject_id)
            .single();

          if (subjectError) {
            console.error('Error fetching subject for lesson:', subjectError);
          } else {
            console.log('Subject for this lesson:', subjectData);
          }
        } else {
          console.log('This lesson has no subject_id');
        }
      }
    }

    // 5. Test the actual query used by the UI
    console.log('4. Testing the query used by LessonsSection component...');
    const { data: uiLessons, error: uiError } = await supabase
      .from('simple_lessons')
      .select(`
        id,
        title,
        description,
        difficulty_level,
        duration_minutes,
        subject_id,
        order_index,
        subjects!fk_subject (
          id,
          name,
          color,
          icon
        )
      `)
      .eq('is_published', true)
      .limit(5);

    if (uiError) {
      console.error('Error with UI query:', uiError);
    } else {
      console.log(`UI query returned ${uiLessons.length} lessons`);
      if (uiLessons.length > 0) {
        console.log('First lesson from UI query:', uiLessons[0]);
        console.log('Subjects join result:', uiLessons[0].subjects);
      }
    }

    // 6. Test query without the join
    console.log('5. Testing query without join...');
    const { data: simpleQuery, error: simpleError } = await supabase
      .from('simple_lessons')
      .select('id, title, subject_id')
      .eq('is_published', true)
      .limit(5);

    if (simpleError) {
      console.error('Error with simple query:', simpleError);
    } else {
      console.log(`Simple query returned ${simpleQuery.length} lessons`);
      if (simpleQuery.length > 0) {
        const subjectIds = simpleQuery.map(l => l.subject_id).filter(Boolean);
        
        if (subjectIds.length > 0) {
          console.log('6. Fetching subjects directly...');
          const { data: directSubjects, error: directError } = await supabase
            .from('subjects')
            .select('*')
            .in('id', subjectIds);
            
          if (directError) {
            console.error('Error fetching subjects directly:', directError);
          } else {
            console.log(`Found ${directSubjects.length} subjects directly`);
            console.log('Direct subjects:', directSubjects);
          }
        }
      }
    }

  } catch (error) {
    console.error('Unhandled error in debug utility:', error);
  }

  console.log('======= DEBUG COMPLETE =======');
};

export default debugSimpleLessons;
