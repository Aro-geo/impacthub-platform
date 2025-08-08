-- ImpactLearn specific tables and enums

-- Create lesson-specific enums
CREATE TYPE public.lesson_difficulty AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE public.lesson_category AS ENUM ('english', 'health', 'financial', 'digital', 'agriculture', 'general');
CREATE TYPE public.group_type AS ENUM ('study', 'practice', 'mentor', 'local');

-- Create lessons table
CREATE TABLE public.lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category lesson_category NOT NULL DEFAULT 'general',
  difficulty lesson_difficulty NOT NULL DEFAULT 'beginner',
  content JSONB, -- Stores lesson slides and content
  media_url TEXT, -- URL for images/videos
  audio_url TEXT, -- URL for audio narration
  language TEXT DEFAULT 'en',
  duration_minutes INTEGER DEFAULT 5,
  is_published BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quizzes table (linked to lessons)
CREATE TABLE public.quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of answer options
  correct_answer INTEGER NOT NULL, -- Index of correct answer
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user progress tracking
CREATE TABLE public.user_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0, -- Quiz score (0-100)
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent_minutes INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Create learning groups
CREATE TABLE public.learning_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  group_type group_type NOT NULL DEFAULT 'study',
  language TEXT DEFAULT 'en',
  location TEXT, -- For local groups
  max_members INTEGER DEFAULT 50,
  current_members INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create group memberships
CREATE TABLE public.group_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.learning_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- member, moderator, admin
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Create group messages
CREATE TABLE public.group_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.learning_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text', -- text, audio, image
  media_url TEXT, -- For audio/image messages
  is_ai_moderated BOOLEAN DEFAULT false,
  sentiment_score DECIMAL(3,2), -- AI sentiment analysis (-1 to 1)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mentor matches (enhanced from existing table)
CREATE TABLE public.mentor_matches_enhanced (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mentee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status mentorship_status DEFAULT 'pending',
  skills_focus TEXT[] DEFAULT '{}',
  language TEXT DEFAULT 'en',
  meeting_frequency TEXT, -- weekly, biweekly, monthly
  preferred_time TEXT, -- morning, afternoon, evening
  timezone TEXT,
  ai_compatibility_score DECIMAL(3,2), -- AI-calculated compatibility (0-1)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user streaks and achievements
CREATE TABLE public.user_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  total_lessons_completed INTEGER DEFAULT 0,
  total_time_spent_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create achievements/badges
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT, -- Emoji or icon identifier
  criteria JSONB, -- Conditions to earn this achievement
  points_reward INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user achievements
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Enable Row Level Security
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_matches_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lessons
CREATE POLICY "Anyone can view published lessons" ON public.lessons FOR SELECT USING (is_published = true);
CREATE POLICY "Authenticated users can create lessons" ON public.lessons FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update their own lessons" ON public.lessons FOR UPDATE USING (auth.uid() = created_by);

-- RLS Policies for quizzes
CREATE POLICY "Anyone can view quizzes for published lessons" ON public.quizzes FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.lessons WHERE lessons.id = quizzes.lesson_id AND lessons.is_published = true)
);

-- RLS Policies for user progress
CREATE POLICY "Users can view their own progress" ON public.user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own progress" ON public.user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress" ON public.user_progress FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for learning groups
CREATE POLICY "Anyone can view active groups" ON public.learning_groups FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can create groups" ON public.learning_groups FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Group creators can update their groups" ON public.learning_groups FOR UPDATE USING (auth.uid() = created_by);

-- RLS Policies for group memberships
CREATE POLICY "Users can view memberships of groups they belong to" ON public.group_memberships FOR SELECT USING (
  auth.uid() = user_id OR 
  EXISTS (SELECT 1 FROM public.group_memberships gm WHERE gm.group_id = group_memberships.group_id AND gm.user_id = auth.uid())
);
CREATE POLICY "Users can join groups" ON public.group_memberships FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave groups" ON public.group_memberships FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for group messages
CREATE POLICY "Group members can view messages" ON public.group_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.group_memberships WHERE group_id = group_messages.group_id AND user_id = auth.uid())
);
CREATE POLICY "Group members can send messages" ON public.group_messages FOR INSERT WITH CHECK (
  auth.uid() = user_id AND 
  EXISTS (SELECT 1 FROM public.group_memberships WHERE group_id = group_messages.group_id AND user_id = auth.uid())
);

-- RLS Policies for mentor matches
CREATE POLICY "Users can view their own mentor matches" ON public.mentor_matches_enhanced FOR SELECT USING (
  auth.uid() = mentor_id OR auth.uid() = mentee_id
);
CREATE POLICY "Users can create mentor matches" ON public.mentor_matches_enhanced FOR INSERT WITH CHECK (
  auth.uid() = mentor_id OR auth.uid() = mentee_id
);
CREATE POLICY "Users can update their own mentor matches" ON public.mentor_matches_enhanced FOR UPDATE USING (
  auth.uid() = mentor_id OR auth.uid() = mentee_id
);

-- RLS Policies for user streaks
CREATE POLICY "Users can view their own streaks" ON public.user_streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own streaks" ON public.user_streaks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own streaks" ON public.user_streaks FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for achievements
CREATE POLICY "Anyone can view achievements" ON public.achievements FOR SELECT USING (true);

-- RLS Policies for user achievements
CREATE POLICY "Users can view their own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can award achievements" ON public.user_achievements FOR INSERT WITH CHECK (true);

-- Create functions for updating streaks
CREATE OR REPLACE FUNCTION public.update_user_streak(user_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $
BEGIN
  INSERT INTO public.user_streaks (user_id, current_streak, longest_streak, last_activity_date, total_lessons_completed)
  VALUES (user_uuid, 1, 1, CURRENT_DATE, 1)
  ON CONFLICT (user_id) DO UPDATE SET
    current_streak = CASE 
      WHEN user_streaks.last_activity_date = CURRENT_DATE - INTERVAL '1 day' THEN user_streaks.current_streak + 1
      WHEN user_streaks.last_activity_date = CURRENT_DATE THEN user_streaks.current_streak
      ELSE 1
    END,
    longest_streak = GREATEST(user_streaks.longest_streak, 
      CASE 
        WHEN user_streaks.last_activity_date = CURRENT_DATE - INTERVAL '1 day' THEN user_streaks.current_streak + 1
        WHEN user_streaks.last_activity_date = CURRENT_DATE THEN user_streaks.current_streak
        ELSE 1
      END
    ),
    last_activity_date = CURRENT_DATE,
    total_lessons_completed = user_streaks.total_lessons_completed + 1,
    updated_at = NOW();
END;
$;

-- Create trigger to update streaks when lessons are completed
CREATE OR REPLACE FUNCTION public.handle_lesson_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $
BEGIN
  IF NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL THEN
    PERFORM public.update_user_streak(NEW.user_id);
  END IF;
  RETURN NEW;
END;
$;

CREATE OR REPLACE TRIGGER on_lesson_completed
  AFTER UPDATE ON public.user_progress
  FOR EACH ROW EXECUTE FUNCTION public.handle_lesson_completion();

-- Insert sample lessons
INSERT INTO public.lessons (title, description, category, difficulty, content, duration_minutes, is_published) VALUES
('Basic English Greetings', 'Learn how to greet people in English', 'english', 'beginner', 
 '{"slides": [
   {"title": "Welcome!", "content": "Today we learn greetings", "image": "👋"},
   {"title": "Hello", "content": "Say Hello to greet people", "image": "😊"},
   {"title": "My name is...", "content": "Introduce yourself", "image": "🙋‍♀️"}
 ]}', 5, true),

('Healthy Eating Basics', 'Learn about nutritious foods for your family', 'health', 'beginner',
 '{"slides": [
   {"title": "Healthy Foods", "content": "Eat fruits and vegetables daily", "image": "🥗"},
   {"title": "Clean Water", "content": "Drink clean water every day", "image": "💧"},
   {"title": "Balanced Meals", "content": "Include protein, vegetables, and grains", "image": "🍽️"}
 ]}', 7, true),

('Mobile Money Safety', 'Learn to use digital payments safely', 'financial', 'beginner',
 '{"slides": [
   {"title": "Mobile Money", "content": "Safe way to send and receive money", "image": "📱"},
   {"title": "PIN Security", "content": "Keep your PIN secret and safe", "image": "🔒"},
   {"title": "Check Balance", "content": "Always check your balance", "image": "💰"}
 ]}', 8, true);

-- Insert sample achievements
INSERT INTO public.achievements (name, description, icon, criteria, points_reward) VALUES
('First Lesson', 'Complete your first lesson', '🎯', '{"lessons_completed": 1}', 50),
('Week Streak', 'Learn for 7 days in a row', '🔥', '{"streak_days": 7}', 100),
('English Basics', 'Complete all basic English lessons', '🇬🇧', '{"category": "english", "difficulty": "beginner"}', 200),
('Health Champion', 'Complete all health lessons', '🏥', '{"category": "health"}', 150),
('Money Smart', 'Complete all financial lessons', '💰', '{"category": "financial"}', 150);

-- Create indexes for better performance
CREATE INDEX idx_lessons_category ON public.lessons(category);
CREATE INDEX idx_lessons_difficulty ON public.lessons(difficulty);
CREATE INDEX idx_lessons_published ON public.lessons(is_published);
CREATE INDEX idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX idx_user_progress_lesson_id ON public.user_progress(lesson_id);
CREATE INDEX idx_group_messages_group_id ON public.group_messages(group_id);
CREATE INDEX idx_group_messages_created_at ON public.group_messages(created_at);
CREATE INDEX idx_user_streaks_user_id ON public.user_streaks(user_id);