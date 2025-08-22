import { supabase } from '@/integrations/supabase/client';

export const debugQuizzes = async () => {
  console.log('🔍 Debugging Quiz Display Issues...');
  
  try {
    // Check if lesson_quizzes table exists and has data
    const { data: quizzes, error: quizzesError } = await supabase
      .from('lesson_quizzes')
      .select('*')
      .limit(5);
    
    console.log('📝 Lesson Quizzes:', {
      error: quizzesError,
      count: quizzes?.length || 0,
      sample: quizzes?.[0] || null
    });

    // Check if lesson_quiz_attempts table exists
    const { data: attempts, error: attemptsError } = await supabase
      .from('lesson_quiz_attempts')
      .select('*')
      .limit(5);
    
    console.log('🎯 Quiz Attempts:', {
      error: attemptsError,
      count: attempts?.length || 0,
      sample: attempts?.[0] || null
    });

    // Check lessons with quizzes
    const { data: lessonsWithQuizzes, error: lessonsError } = await supabase
      .from('lesson_quizzes')
      .select(`
        id,
        question,
        lesson_id,
        simple_lessons (
          id,
          title,
          subjects (
            id,
            name
          )
        )
      `)
      .limit(3);

    console.log('🔗 Lessons with Quizzes:', {
      error: lessonsError,
      count: lessonsWithQuizzes?.length || 0,
      sample: lessonsWithQuizzes?.[0] || null
    });

    // Check subjects
    const { data: subjects, error: subjectsError } = await supabase
      .from('subjects')
      .select('*');

    console.log('📚 Subjects:', {
      error: subjectsError,
      count: subjects?.length || 0,
      names: subjects?.map(s => s.name) || []
    });

    // Check simple lessons
    const { data: lessons, error: lessonsSimpleError } = await supabase
      .from('simple_lessons')
      .select('id, title, subject_id, is_published')
      .eq('is_published', true)
      .limit(5);

    console.log('📖 Simple Lessons:', {
      error: lessonsSimpleError,
      count: lessons?.length || 0,
      sample: lessons?.[0] || null
    });

    return {
      quizzes: quizzes?.length || 0,
      attempts: attempts?.length || 0,
      lessonsWithQuizzes: lessonsWithQuizzes?.length || 0,
      subjects: subjects?.length || 0,
      lessons: lessons?.length || 0,
      errors: {
        quizzes: quizzesError,
        attempts: attemptsError,
        lessonsWithQuizzes: lessonsError,
        subjects: subjectsError,
        lessons: lessonsSimpleError
      }
    };

  } catch (error) {
    console.error('❌ Debug Error:', error);
    return { error };
  }
};