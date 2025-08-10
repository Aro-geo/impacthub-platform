-- Create post_upvotes table for tracking upvotes
CREATE TABLE IF NOT EXISTS post_upvotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Create reply_upvotes table for tracking reply upvotes
CREATE TABLE IF NOT EXISTS reply_upvotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reply_id UUID REFERENCES community_replies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(reply_id, user_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_post_upvotes_post_id ON post_upvotes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_upvotes_user_id ON post_upvotes(user_id);
CREATE INDEX IF NOT EXISTS idx_reply_upvotes_reply_id ON reply_upvotes(reply_id);
CREATE INDEX IF NOT EXISTS idx_reply_upvotes_user_id ON reply_upvotes(user_id);

-- Enable Row Level Security
ALTER TABLE post_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reply_upvotes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for post_upvotes
CREATE POLICY "Users can view all post upvotes" ON post_upvotes FOR SELECT USING (true);
CREATE POLICY "Users can manage their own post upvotes" ON post_upvotes FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for reply_upvotes
CREATE POLICY "Users can view all reply upvotes" ON reply_upvotes FOR SELECT USING (true);
CREATE POLICY "Users can manage their own reply upvotes" ON reply_upvotes FOR ALL USING (auth.uid() = user_id);

-- Insert sample data for testing
INSERT INTO simple_lessons (title, description, content, subject_id, difficulty_level, duration_minutes, order_index) 
SELECT 
  'Introduction to ' || s.name,
  'Learn the basics of ' || s.name || ' in this comprehensive introductory lesson.',
  '# Introduction to ' || s.name || '\n\nThis lesson covers the fundamental concepts and practical applications.\n\n## Learning Objectives\n- Understand basic concepts\n- Apply knowledge in real situations\n- Build confidence in the subject\n\n## Content\nDetailed lesson content would go here...',
  s.id,
  'beginner',
  20,
  1
FROM subjects s
WHERE NOT EXISTS (
  SELECT 1 FROM simple_lessons sl WHERE sl.subject_id = s.id
);

-- Insert sample quizzes for each lesson
INSERT INTO lesson_quizzes (lesson_id, question, options, correct_answer, explanation, order_index)
SELECT 
  sl.id,
  'What is the main focus of ' || s.name || '?',
  '["Basic understanding", "Advanced techniques", "Professional certification", "None of the above"]'::jsonb,
  0,
  'The main focus is building basic understanding as a foundation for further learning.',
  1
FROM simple_lessons sl
JOIN subjects s ON sl.subject_id = s.id
WHERE NOT EXISTS (
  SELECT 1 FROM lesson_quizzes lq WHERE lq.lesson_id = sl.id
);

-- Insert sample community posts
INSERT INTO community_posts (title, content, post_type, subject_id, user_id, upvotes, is_featured)
SELECT 
  'Welcome to ' || s.name || ' Learning!',
  'This is a great place to discuss ' || s.name || ' topics, ask questions, and share resources. Feel free to introduce yourself and let us know what you''re hoping to learn!',
  'announcement',
  s.id,
  (SELECT id FROM auth.users LIMIT 1),
  5,
  true
FROM subjects s
WHERE EXISTS (SELECT 1 FROM auth.users)
AND NOT EXISTS (
  SELECT 1 FROM community_posts cp WHERE cp.subject_id = s.id AND cp.post_type = 'announcement'
);

-- Function to update lesson progress streak
CREATE OR REPLACE FUNCTION update_learning_streak()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or insert learning streak when a lesson is completed
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    INSERT INTO learning_streaks (user_id, current_streak, longest_streak, last_activity_date, updated_at)
    VALUES (NEW.user_id, 1, 1, CURRENT_DATE, NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      current_streak = CASE 
        WHEN learning_streaks.last_activity_date = CURRENT_DATE - INTERVAL '1 day' THEN learning_streaks.current_streak + 1
        WHEN learning_streaks.last_activity_date = CURRENT_DATE THEN learning_streaks.current_streak
        ELSE 1
      END,
      longest_streak = GREATEST(
        learning_streaks.longest_streak,
        CASE 
          WHEN learning_streaks.last_activity_date = CURRENT_DATE - INTERVAL '1 day' THEN learning_streaks.current_streak + 1
          WHEN learning_streaks.last_activity_date = CURRENT_DATE THEN learning_streaks.current_streak
          ELSE 1
        END
      ),
      last_activity_date = CURRENT_DATE,
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating learning streaks
DROP TRIGGER IF EXISTS trigger_update_learning_streak ON lesson_progress;
CREATE TRIGGER trigger_update_learning_streak
  AFTER INSERT OR UPDATE ON lesson_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_learning_streak();