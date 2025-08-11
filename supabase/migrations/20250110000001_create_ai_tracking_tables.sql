-- Create AI interaction tracking tables

-- Create AI interaction types enum
CREATE TYPE public.ai_interaction_type AS ENUM (
  'learning_path_generation',
  'quiz_creation',
  'homework_help',
  'alt_text_generation',
  'text_translation',
  'eco_advice',
  'sustainability_impact',
  'waste_classification',
  'mentorship_matching',
  'opportunity_recommendation',
  'idea_evaluation',
  'content_summarization',
  'grant_proposal_assistance',
  'sentiment_analysis'
);

-- Create AI interaction status enum
CREATE TYPE public.ai_interaction_status AS ENUM (
  'initiated',
  'processing',
  'completed',
  'failed'
);

-- Create ai_interactions table to track all AI tool usage
CREATE TABLE public.ai_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  interaction_type ai_interaction_type NOT NULL,
  status ai_interaction_status DEFAULT 'initiated',
  input_data JSONB,
  output_data JSONB,
  processing_time_ms INTEGER,
  tokens_used INTEGER,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create ai_recommendations table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.ai_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recommended_type TEXT,
  recommended_id UUID,
  reason TEXT,
  interaction_id UUID REFERENCES public.ai_interactions(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ai_usage_stats table for aggregated statistics
CREATE TABLE public.ai_usage_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_interactions INTEGER DEFAULT 0,
  successful_interactions INTEGER DEFAULT 0,
  failed_interactions INTEGER DEFAULT 0,
  total_tokens_used INTEGER DEFAULT 0,
  avg_processing_time_ms FLOAT DEFAULT 0,
  interaction_types JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create ai_learning_paths table to store generated learning paths
CREATE TABLE public.ai_learning_paths (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  interaction_id UUID REFERENCES public.ai_interactions(id),
  skills TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  level TEXT,
  generated_path TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ai_quizzes table to store generated quizzes
CREATE TABLE public.ai_quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  interaction_id UUID REFERENCES public.ai_interactions(id),
  source_content TEXT,
  difficulty TEXT,
  questions JSONB,
  attempts_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ai_homework_sessions table to track homework help sessions
CREATE TABLE public.ai_homework_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  interaction_id UUID REFERENCES public.ai_interactions(id),
  subject TEXT,
  question TEXT,
  explanation TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_homework_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for ai_interactions
CREATE POLICY "Users can view their own AI interactions" ON public.ai_interactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own AI interactions" ON public.ai_interactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own AI interactions" ON public.ai_interactions FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for ai_recommendations
CREATE POLICY "Users can view their own AI recommendations" ON public.ai_recommendations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own AI recommendations" ON public.ai_recommendations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for ai_usage_stats
CREATE POLICY "Users can view their own AI usage stats" ON public.ai_usage_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own AI usage stats" ON public.ai_usage_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own AI usage stats" ON public.ai_usage_stats FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for ai_learning_paths
CREATE POLICY "Users can view their own AI learning paths" ON public.ai_learning_paths FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own AI learning paths" ON public.ai_learning_paths FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own AI learning paths" ON public.ai_learning_paths FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for ai_quizzes
CREATE POLICY "Users can view their own AI quizzes" ON public.ai_quizzes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own AI quizzes" ON public.ai_quizzes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own AI quizzes" ON public.ai_quizzes FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for ai_homework_sessions
CREATE POLICY "Users can view their own AI homework sessions" ON public.ai_homework_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own AI homework sessions" ON public.ai_homework_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own AI homework sessions" ON public.ai_homework_sessions FOR UPDATE USING (auth.uid() = user_id);

-- Create function to update AI usage stats
CREATE OR REPLACE FUNCTION public.update_ai_usage_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Only update stats when interaction is completed
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    INSERT INTO public.ai_usage_stats (
      user_id,
      date,
      total_interactions,
      successful_interactions,
      total_tokens_used,
      avg_processing_time_ms,
      interaction_types
    )
    VALUES (
      NEW.user_id,
      CURRENT_DATE,
      1,
      1,
      COALESCE(NEW.tokens_used, 0),
      COALESCE(NEW.processing_time_ms, 0),
      jsonb_build_object(NEW.interaction_type::text, 1)
    )
    ON CONFLICT (user_id, date) DO UPDATE SET
      total_interactions = ai_usage_stats.total_interactions + 1,
      successful_interactions = ai_usage_stats.successful_interactions + 1,
      total_tokens_used = ai_usage_stats.total_tokens_used + COALESCE(NEW.tokens_used, 0),
      avg_processing_time_ms = (
        (ai_usage_stats.avg_processing_time_ms * ai_usage_stats.total_interactions + COALESCE(NEW.processing_time_ms, 0)) 
        / (ai_usage_stats.total_interactions + 1)
      ),
      interaction_types = ai_usage_stats.interaction_types || jsonb_build_object(
        NEW.interaction_type::text,
        COALESCE((ai_usage_stats.interaction_types ->> NEW.interaction_type::text)::integer, 0) + 1
      ),
      updated_at = NOW();
  ELSIF NEW.status = 'failed' AND (OLD.status IS NULL OR OLD.status != 'failed') THEN
    INSERT INTO public.ai_usage_stats (
      user_id,
      date,
      total_interactions,
      failed_interactions,
      interaction_types
    )
    VALUES (
      NEW.user_id,
      CURRENT_DATE,
      1,
      1,
      jsonb_build_object(NEW.interaction_type::text, 1)
    )
    ON CONFLICT (user_id, date) DO UPDATE SET
      total_interactions = ai_usage_stats.total_interactions + 1,
      failed_interactions = ai_usage_stats.failed_interactions + 1,
      interaction_types = ai_usage_stats.interaction_types || jsonb_build_object(
        NEW.interaction_type::text,
        COALESCE((ai_usage_stats.interaction_types ->> NEW.interaction_type::text)::integer, 0) + 1
      ),
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to update usage stats
CREATE OR REPLACE TRIGGER on_ai_interaction_status_change
  AFTER INSERT OR UPDATE ON public.ai_interactions
  FOR EACH ROW EXECUTE FUNCTION public.update_ai_usage_stats();

-- Create indexes for better performance
CREATE INDEX idx_ai_interactions_user_id ON public.ai_interactions(user_id);
CREATE INDEX idx_ai_interactions_type ON public.ai_interactions(interaction_type);
CREATE INDEX idx_ai_interactions_status ON public.ai_interactions(status);
CREATE INDEX idx_ai_interactions_created_at ON public.ai_interactions(created_at);
CREATE INDEX idx_ai_usage_stats_user_date ON public.ai_usage_stats(user_id, date);
CREATE INDEX idx_ai_learning_paths_user_id ON public.ai_learning_paths(user_id);
CREATE INDEX idx_ai_quizzes_user_id ON public.ai_quizzes(user_id);
CREATE INDEX idx_ai_homework_sessions_user_id ON public.ai_homework_sessions(user_id);