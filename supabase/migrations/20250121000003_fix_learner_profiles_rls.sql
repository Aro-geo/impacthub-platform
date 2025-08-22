-- Fix RLS policies for learner_profiles table

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own learner profile" ON public.learner_profiles;
DROP POLICY IF EXISTS "Users can create their own learner profile" ON public.learner_profiles;
DROP POLICY IF EXISTS "Users can update their own learner profile" ON public.learner_profiles;

-- Enable RLS
ALTER TABLE public.learner_profiles ENABLE ROW LEVEL SECURITY;

-- Create proper RLS policies
CREATE POLICY "Users can view their own learner profile" ON public.learner_profiles 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own learner profile" ON public.learner_profiles 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learner profile" ON public.learner_profiles 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert their own learner profile" ON public.learner_profiles 
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);