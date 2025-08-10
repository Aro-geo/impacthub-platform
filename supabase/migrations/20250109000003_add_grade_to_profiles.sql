-- Add grade column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS grade INTEGER;

-- Add constraint to ensure grade is between 1 and 12 (allow NULL for existing users)
ALTER TABLE profiles ADD CONSTRAINT check_grade_range CHECK (grade IS NULL OR (grade >= 1 AND grade <= 12));

-- Add comment to document the column
COMMENT ON COLUMN profiles.grade IS 'Student grade level from 1 to 12';

-- Add grade column to simple_lessons table for grade-based filtering
ALTER TABLE simple_lessons ADD COLUMN IF NOT EXISTS grade INTEGER;

-- Add constraint to ensure lesson grade is between 1 and 12 (allow NULL)
ALTER TABLE simple_lessons ADD CONSTRAINT check_lesson_grade_range CHECK (grade IS NULL OR (grade >= 1 AND grade <= 12));

-- Add comment to document the column
COMMENT ON COLUMN simple_lessons.grade IS 'Target grade level for this lesson (1-12)';

-- Create index for better performance when filtering by grade
CREATE INDEX IF NOT EXISTS idx_simple_lessons_grade ON simple_lessons(grade);
CREATE INDEX IF NOT EXISTS idx_profiles_grade ON profiles(grade);

-- Update existing lessons with appropriate grade levels based on difficulty
UPDATE simple_lessons 
SET grade = CASE 
  WHEN difficulty_level = 'beginner' THEN 
    CASE 
      WHEN title ILIKE '%basic%' OR title ILIKE '%introduction%' THEN 3
      ELSE 5
    END
  WHEN difficulty_level = 'intermediate' THEN 8
  WHEN difficulty_level = 'advanced' THEN 11
  ELSE 6
END
WHERE grade IS NULL;

-- Ensure profiles table has proper RLS policies
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create comprehensive RLS policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Enable RLS on profiles table if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;