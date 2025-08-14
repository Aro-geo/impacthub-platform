-- ImpactHub Learning Platform Database Migration (Simplified)
-- Execute these commands in your Supabase SQL Editor in order
-- This version handles existing performance_metrics table

-- =====================================================
-- STEP 0: Diagnostic - Check existing table structure
-- =====================================================

-- Uncomment this to see what columns exist in your performance_metrics table:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'performance_metrics' 
-- ORDER BY ordinal_position;

-- =====================================================
-- STEP 1: Create New Tables (Skip existing ones)
-- =====================================================

-- Learning Activities Table
CREATE TABLE IF NOT EXISTS learning_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('quiz_attempt', 'lesson_view', 'lesson_complete', 'ai_interaction', 'forum_post')),
  subject TEXT,
  topic TEXT,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  time_spent INTEGER CHECK (time_spent >= 0),
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learner Profiles Table
CREATE TABLE IF NOT EXISTS learner_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  interests TEXT[] DEFAULT '{}',
  strengths TEXT[] DEFAULT '{}',
  weaknesses TEXT[] DEFAULT '{}',
  preferred_difficulty TEXT DEFAULT 'medium' CHECK (preferred_difficulty IN ('easy', 'medium', 'hard')),
  learning_style TEXT DEFAULT 'mixed' CHECK (learning_style IN ('visual', 'auditory', 'kinesthetic', 'mixed')),
  recommended_topics TEXT[] DEFAULT '{}',
  total_study_time INTEGER DEFAULT 0,
  lessons_completed INTEGER DEFAULT 0,
  quizzes_attempted INTEGER DEFAULT 0,
  average_score DECIMAL(5,2) DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post Comments Table (with emoji support)
CREATE TABLE IF NOT EXISTS post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 2000),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
  is_edited BOOLEAN DEFAULT FALSE,
  emoji_reactions JSONB DEFAULT '{}'
);

-- Comment Reactions Table
CREATE TABLE IF NOT EXISTS comment_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL CHECK (char_length(emoji) >= 1 AND char_length(emoji) <= 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id, emoji)
);

-- Note: performance_metrics table already exists, so we skip creating it
-- We'll just add policies and permissions for it below

-- =====================================================
-- STEP 2: Create Indexes for New Tables
-- =====================================================

-- Learning Activities Indexes
CREATE INDEX IF NOT EXISTS idx_learning_activities_user_id ON learning_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_activities_activity_type ON learning_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_learning_activities_created_at ON learning_activities(created_at);

-- Learner Profiles Indexes
CREATE INDEX IF NOT EXISTS idx_learner_profiles_updated_at ON learner_profiles(updated_at);

-- Post Comments Indexes
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON post_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_created_at ON post_comments(created_at);
CREATE INDEX IF NOT EXISTS idx_post_comments_parent_id ON post_comments(parent_comment_id);

-- Comment Reactions Indexes
CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment_id ON comment_reactions(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_reactions_user_id ON comment_reactions(user_id);

-- Performance Metrics Indexes (add if they don't exist and columns exist)
DO $$
BEGIN
  -- Always create these indexes if columns exist
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'performance_metrics' AND column_name = 'timestamp') THEN
    CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp);
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'performance_metrics' AND column_name = 'metric') THEN
    CREATE INDEX IF NOT EXISTS idx_performance_metrics_metric ON performance_metrics(metric);
  END IF;
  
  -- Only create user_id index if the column exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'performance_metrics' AND column_name = 'user_id') THEN
    CREATE INDEX IF NOT EXISTS idx_performance_metrics_user_id ON performance_metrics(user_id);
  END IF;
END $$;

-- =====================================================
-- STEP 3: Enable Row Level Security
-- =====================================================

ALTER TABLE learning_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE learner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_reactions ENABLE ROW LEVEL SECURITY;

-- Enable RLS on performance_metrics if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'performance_metrics' 
    AND n.nspname = 'public'
    AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- =====================================================
-- STEP 4: Create RLS Policies (Using auth.users directly)
-- =====================================================

-- Learning Activities Policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'learning_activities' AND policyname = 'Users can view own learning activities') THEN
    CREATE POLICY "Users can view own learning activities" ON learning_activities
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'learning_activities' AND policyname = 'Users can insert own learning activities') THEN
    CREATE POLICY "Users can insert own learning activities" ON learning_activities
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'learning_activities' AND policyname = 'Users can update own learning activities') THEN
    CREATE POLICY "Users can update own learning activities" ON learning_activities
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'learning_activities' AND policyname = 'Admin can view all learning activities') THEN
    CREATE POLICY "Admin can view all learning activities" ON learning_activities
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM auth.users 
          WHERE auth.users.id = auth.uid() 
          AND auth.users.email = 'geokullo@gmail.com'
        )
      );
  END IF;
END $$;

-- Learner Profiles Policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'learner_profiles' AND policyname = 'Users can view own learner profile') THEN
    CREATE POLICY "Users can view own learner profile" ON learner_profiles
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'learner_profiles' AND policyname = 'Users can insert own learner profile') THEN
    CREATE POLICY "Users can insert own learner profile" ON learner_profiles
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'learner_profiles' AND policyname = 'Users can update own learner profile') THEN
    CREATE POLICY "Users can update own learner profile" ON learner_profiles
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'learner_profiles' AND policyname = 'Admin can view all learner profiles') THEN
    CREATE POLICY "Admin can view all learner profiles" ON learner_profiles
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM auth.users 
          WHERE auth.users.id = auth.uid() 
          AND auth.users.email = 'geokullo@gmail.com'
        )
      );
  END IF;
END $$;

-- Post Comments Policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'post_comments' AND policyname = 'Anyone can view comments') THEN
    CREATE POLICY "Anyone can view comments" ON post_comments
      FOR SELECT USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'post_comments' AND policyname = 'Authenticated users can insert comments') THEN
    CREATE POLICY "Authenticated users can insert comments" ON post_comments
      FOR INSERT WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'post_comments' AND policyname = 'Users can update own comments') THEN
    CREATE POLICY "Users can update own comments" ON post_comments
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'post_comments' AND policyname = 'Users can delete own comments or admin can delete any') THEN
    CREATE POLICY "Users can delete own comments or admin can delete any" ON post_comments
      FOR DELETE USING (
        auth.uid() = user_id 
        OR EXISTS (
          SELECT 1 FROM auth.users 
          WHERE auth.users.id = auth.uid() 
          AND auth.users.email = 'geokullo@gmail.com'
        )
      );
  END IF;
END $$;

-- Comment Reactions Policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'comment_reactions' AND policyname = 'Anyone can view comment reactions') THEN
    CREATE POLICY "Anyone can view comment reactions" ON comment_reactions
      FOR SELECT USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'comment_reactions' AND policyname = 'Authenticated users can add reactions') THEN
    CREATE POLICY "Authenticated users can add reactions" ON comment_reactions
      FOR INSERT WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'comment_reactions' AND policyname = 'Users can remove own reactions') THEN
    CREATE POLICY "Users can remove own reactions" ON comment_reactions
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Performance Metrics Policies (for existing table)
-- First, let's check what columns exist in the performance_metrics table
DO $$
DECLARE
  has_user_id BOOLEAN;
BEGIN
  -- Check if user_id column exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'performance_metrics' 
    AND column_name = 'user_id'
  ) INTO has_user_id;
  
  -- Create policies based on table structure
  IF has_user_id THEN
    -- Table has user_id column
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'performance_metrics' AND policyname = 'Users can view own performance metrics') THEN
      CREATE POLICY "Users can view own performance metrics" ON performance_metrics
        FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'performance_metrics' AND policyname = 'Admin can view all performance metrics') THEN
      CREATE POLICY "Admin can view all performance metrics" ON performance_metrics
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email = 'geokullo@gmail.com'
          )
        );
    END IF;
  ELSE
    -- Table doesn't have user_id column - create simpler policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'performance_metrics' AND policyname = 'Anyone can view performance metrics') THEN
      CREATE POLICY "Anyone can view performance metrics" ON performance_metrics
        FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'performance_metrics' AND policyname = 'Admin can view all performance metrics') THEN
      CREATE POLICY "Admin can view all performance metrics" ON performance_metrics
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email = 'geokullo@gmail.com'
          )
        );
    END IF;
  END IF;
  
  -- Always allow inserts (regardless of table structure)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'performance_metrics' AND policyname = 'Anyone can insert performance metrics') THEN
    CREATE POLICY "Anyone can insert performance metrics" ON performance_metrics
      FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- =====================================================
-- STEP 5: Create Functions
-- =====================================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Emoji reaction toggle function
CREATE OR REPLACE FUNCTION toggle_comment_reaction(
  p_comment_id UUID,
  p_emoji TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_existing_reaction UUID;
  v_result JSONB;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;
  
  SELECT id INTO v_existing_reaction
  FROM comment_reactions
  WHERE comment_id = p_comment_id 
    AND user_id = v_user_id 
    AND emoji = p_emoji;
  
  IF v_existing_reaction IS NOT NULL THEN
    DELETE FROM comment_reactions WHERE id = v_existing_reaction;
    v_result := jsonb_build_object('action', 'removed', 'emoji', p_emoji);
  ELSE
    INSERT INTO comment_reactions (comment_id, user_id, emoji)
    VALUES (p_comment_id, v_user_id, p_emoji);
    v_result := jsonb_build_object('action', 'added', 'emoji', p_emoji);
  END IF;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get comment reactions function
CREATE OR REPLACE FUNCTION get_comment_reactions(p_comment_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_reactions JSONB;
BEGIN
  SELECT jsonb_object_agg(
    emoji, 
    jsonb_build_object(
      'count', count,
      'users', users
    )
  ) INTO v_reactions
  FROM (
    SELECT 
      emoji,
      COUNT(*) as count,
      jsonb_agg(
        jsonb_build_object(
          'user_id', user_id,
          'name', COALESCE(u.raw_user_meta_data->>'name', 'Anonymous')
        )
      ) as users
    FROM comment_reactions cr
    LEFT JOIN auth.users u ON u.id = cr.user_id
    WHERE cr.comment_id = p_comment_id
    GROUP BY emoji
  ) reactions;
  
  RETURN COALESCE(v_reactions, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 6: Create Triggers
-- =====================================================

-- Create triggers only if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_learner_profiles_updated_at'
  ) THEN
    CREATE TRIGGER update_learner_profiles_updated_at 
      BEFORE UPDATE ON learner_profiles 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_post_comments_updated_at'
  ) THEN
    CREATE TRIGGER update_post_comments_updated_at 
      BEFORE UPDATE ON post_comments 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- =====================================================
-- STEP 7: Grant Permissions
-- =====================================================

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Grant permissions on new tables
GRANT ALL ON learning_activities TO authenticated;
GRANT ALL ON learner_profiles TO authenticated;
GRANT ALL ON post_comments TO authenticated;
GRANT ALL ON comment_reactions TO authenticated;

-- Grant permissions on existing performance_metrics table
GRANT ALL ON performance_metrics TO authenticated;

-- Grant read permissions to anonymous users
GRANT SELECT ON learning_activities TO anon;
GRANT SELECT ON post_comments TO anon;
GRANT SELECT ON comment_reactions TO anon;
GRANT INSERT ON performance_metrics TO anon;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION toggle_comment_reaction(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_comment_reactions(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_comment_reactions(UUID) TO anon;

-- =====================================================
-- STEP 8: Verification (Optional)
-- =====================================================

-- Uncomment these to verify the setup:

-- Check if all tables exist
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('learning_activities', 'learner_profiles', 'post_comments', 'comment_reactions', 'performance_metrics');

-- Check if policies were created
-- SELECT schemaname, tablename, policyname 
-- FROM pg_policies 
-- WHERE tablename IN ('learning_activities', 'learner_profiles', 'post_comments', 'comment_reactions', 'performance_metrics');

-- Test emoji reactions function
-- SELECT get_comment_reactions('00000000-0000-0000-0000-000000000000'::UUID);

-- =====================================================
-- MIGRATION COMPLETE ✅
-- =====================================================

-- Your database now has:
-- ✅ AI Learning Activity Tracking (learning_activities table)
-- ✅ Personalized Learning Profiles (learner_profiles table)  
-- ✅ Emoji Comment System (post_comments + comment_reactions tables)
-- ✅ Admin Access for George Okullo (geokullo@gmail.com)
-- ✅ Row Level Security on all tables
-- ✅ Proper handling of existing performance_metrics table
-- ✅ Emoji reaction functions (toggle_comment_reaction, get_comment_reactions)
-- ✅ All necessary indexes for optimal performance

-- The emoji comment system is now ready to use! 🎉
-- Users can react with: 👍 ❤️ 😂 😢 😠 👎