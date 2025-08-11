-- Add grade column to simple_lessons table to match UI expectations
ALTER TABLE simple_lessons ADD COLUMN IF NOT EXISTS grade VARCHAR(20);

-- Update existing lessons with appropriate grades
UPDATE simple_lessons SET grade = 
  CASE 
    WHEN difficulty_level = 'beginner' THEN 'adult-basic'
    WHEN difficulty_level = 'intermediate' THEN 'adult-intermediate' 
    WHEN difficulty_level = 'advanced' THEN 'adult-advanced'
    ELSE 'adult-basic'
  END
WHERE grade IS NULL;