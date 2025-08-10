-- Create subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create simple_lessons table
CREATE TABLE IF NOT EXISTS simple_lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  content TEXT,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
  duration_minutes INTEGER DEFAULT 15,
  order_index INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lesson_progress table
CREATE TABLE IF NOT EXISTS lesson_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES simple_lessons(id) ON DELETE CASCADE,
  status VARCHAR(20) CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Create lesson_quizzes table
CREATE TABLE IF NOT EXISTS lesson_quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID REFERENCES simple_lessons(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of answer options
  correct_answer INTEGER NOT NULL, -- Index of correct answer
  explanation TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quiz_attempts table
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id UUID REFERENCES lesson_quizzes(id) ON DELETE CASCADE,
  selected_answer INTEGER,
  is_correct BOOLEAN,
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create community_posts table for discussions
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES simple_lessons(id) ON DELETE SET NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  post_type VARCHAR(20) CHECK (post_type IN ('question', 'discussion', 'resource', 'announcement')) DEFAULT 'discussion',
  upvotes INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create community_replies table
CREATE TABLE IF NOT EXISTS community_replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_bookmarks table
CREATE TABLE IF NOT EXISTS user_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES simple_lessons(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Create learning_streaks table
CREATE TABLE IF NOT EXISTS learning_streaks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample subjects
INSERT INTO subjects (name, description, icon, color) VALUES
('English Language', 'Learn English speaking, reading, and writing skills', 'BookOpen', 'blue'),
('Digital Literacy', 'Basic computer and internet skills', 'Monitor', 'green'),
('Financial Literacy', 'Money management and financial planning', 'DollarSign', 'purple'),
('Health & Wellness', 'Basic health knowledge and wellness practices', 'Heart', 'red'),
('Life Skills', 'Essential skills for daily living', 'Users', 'orange')
ON CONFLICT (name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_simple_lessons_subject_id ON simple_lessons(subject_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_id ON lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson_id ON lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_quizzes_lesson_id ON lesson_quizzes(lesson_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_subject_id ON community_posts(subject_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_lesson_id ON community_posts(lesson_id);
CREATE INDEX IF NOT EXISTS idx_community_replies_post_id ON community_replies(post_id);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user_id ON user_bookmarks(user_id);

-- Enable Row Level Security
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE simple_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_streaks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Subjects: Public read access
CREATE POLICY "Subjects are viewable by everyone" ON subjects FOR SELECT USING (true);

-- Simple lessons: Public read access
CREATE POLICY "Lessons are viewable by everyone" ON simple_lessons FOR SELECT USING (is_published = true);

-- Lesson progress: Users can only see their own progress
CREATE POLICY "Users can view their own progress" ON lesson_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own progress" ON lesson_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress" ON lesson_progress FOR UPDATE USING (auth.uid() = user_id);

-- Lesson quizzes: Public read access
CREATE POLICY "Quizzes are viewable by everyone" ON lesson_quizzes FOR SELECT USING (true);

-- Quiz attempts: Users can only see their own attempts
CREATE POLICY "Users can view their own quiz attempts" ON quiz_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own quiz attempts" ON quiz_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Community posts: Public read, authenticated users can create
CREATE POLICY "Posts are viewable by everyone" ON community_posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts" ON community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own posts" ON community_posts FOR UPDATE USING (auth.uid() = user_id);

-- Community replies: Public read, authenticated users can create
CREATE POLICY "Replies are viewable by everyone" ON community_replies FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create replies" ON community_replies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own replies" ON community_replies FOR UPDATE USING (auth.uid() = user_id);

-- User bookmarks: Users can only see their own bookmarks
CREATE POLICY "Users can view their own bookmarks" ON user_bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own bookmarks" ON user_bookmarks FOR ALL USING (auth.uid() = user_id);

-- Learning streaks: Users can only see their own streaks
CREATE POLICY "Users can view their own streaks" ON learning_streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own streaks" ON learning_streaks FOR ALL USING (auth.uid() = user_id);