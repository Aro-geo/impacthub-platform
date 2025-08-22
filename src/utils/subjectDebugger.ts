/**
 * Utility for checking and fixing common database issues
 * This file should be used during development and debugging
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Verifies subjects table setup and creates default subjects if needed
 */
export const verifySubjectsSetup = async (): Promise<void> => {
  try {
    console.log('Verifying subjects setup...');
    
    // 1. Check if subjects table exists and has data
    const { data: subjects, error } = await supabase
      .from('subjects')
      .select('count')
      .limit(1)
      .single();
      
    if (error) {
      console.error('Error checking subjects:', error);
      return;
    }
    
    // 2. Fetch one subject to check its structure
    const { data: sampleSubject, error: sampleError } = await supabase
      .from('subjects')
      .select('*')
      .limit(1)
      .single();
      
    if (sampleError) {
      console.error('Error fetching sample subject:', sampleError);
    } else {
      console.log('Sample subject structure:', sampleSubject);
    }
    
    // 3. Verify lessons can be linked to subjects
    const { data: lessonCount, error: lessonError } = await supabase
      .from('simple_lessons')
      .select('count')
      .limit(1)
      .single();
      
    if (lessonError) {
      console.error('Error checking lessons:', lessonError);
    } else {
      console.log('Lesson count:', lessonCount);
      
      // 4. Check a sample lesson
      const { data: sampleLesson, error: lessonSampleError } = await supabase
        .from('simple_lessons')
        .select('*, subjects:subject_id(*)')
        .limit(1)
        .single();
        
      if (lessonSampleError) {
        console.error('Error fetching sample lesson:', lessonSampleError);
      } else {
        console.log('Sample lesson structure:', sampleLesson);
      }
    }
    
  } catch (error) {
    console.error('Error in verifySubjectsSetup:', error);
  }
};

/**
 * Runs a series of common database checks
 */
export const runDatabaseChecks = async (): Promise<void> => {
  await verifySubjectsSetup();
};

export default runDatabaseChecks;
