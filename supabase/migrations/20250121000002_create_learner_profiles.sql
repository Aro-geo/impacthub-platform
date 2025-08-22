-- Create learner_profiles table for AI learning analytics

CREATE TABLE IF NOT EXISTS public.learner_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  interests TEXT[] DEFAULT '{}',
  strengths TEXT[] DEFAULT '{}',
  weaknesses TEXT[] DEFAULT '{}',
  preferred_difficulty TEXT DEFAULT 'medium' CHECK (preferred_difficulty IN ('easy', 'medium', 'hard')),
  learning_style TEXT DEFAULT 'mixed' CHECK (learning_style IN ('visual', 'auditory', 'kinesthetic', 'mixed')),
  recommended_topics TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create learning_activities table for tracking learning behavior
CREATE TABLE IF NOT EXISTS public.learning_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('quiz_attempt', 'lesson_view', 'lesson_complete', 'ai_interaction', 'forum_post')),
  subject TEXT,
  topic TEXT,
  score INTEGER,
  time_spent INTEGER,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.learner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_activities ENABLE ROW LEVEL SECURITY;

-- RLS policies for learner_profiles
CREATE POLICY "Users can view their own learner profile" ON public.learner_profiles 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own learner profile" ON public.learner_profiles 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learner profile" ON public.learner_profiles 
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for learning_activities
CREATE POLICY "Users can view their own learning activities" ON public.learning_activities 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own learning activities" ON public.learning_activities 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_learner_profiles_user_id ON public.learner_profiles(user_id);
CREATE INDEX idx_learning_activities_user_id ON public.learning_activities(user_id);
CREATE INDEX idx_learning_activities_type ON public.learning_activities(activity_type);
CREATE INDEX idx_learning_activities_created_at ON public.learning_activities(created_at);