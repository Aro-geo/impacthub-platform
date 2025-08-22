-- Add comment reactions functionality

-- Add parent_comment_id and is_edited columns to post_comments if they don't exist
ALTER TABLE post_comments 
ADD COLUMN IF NOT EXISTS parent_comment_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT false;

-- Create comment_reactions table
CREATE TABLE IF NOT EXISTS comment_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id, emoji)
);

-- Enable RLS
ALTER TABLE comment_reactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view all comment reactions" ON comment_reactions FOR SELECT USING (true);
CREATE POLICY "Users can manage their own reactions" ON comment_reactions FOR ALL USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment_id ON comment_reactions(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_reactions_user_id ON comment_reactions(user_id);

-- Function to get comment reactions
CREATE OR REPLACE FUNCTION get_comment_reactions(p_comment_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB := '{}';
  reaction_record RECORD;
BEGIN
  FOR reaction_record IN
    SELECT 
      emoji,
      COUNT(*) as count,
      ARRAY_AGG(
        JSON_BUILD_OBJECT(
          'user_id', user_id,
          'name', COALESCE(p.name, 'User')
        )
      ) as users
    FROM comment_reactions cr
    LEFT JOIN profiles p ON cr.user_id = p.id
    WHERE cr.comment_id = p_comment_id
    GROUP BY emoji
  LOOP
    result := result || jsonb_build_object(
      reaction_record.emoji,
      jsonb_build_object(
        'count', reaction_record.count,
        'users', reaction_record.users
      )
    );
  END LOOP;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to toggle comment reaction
CREATE OR REPLACE FUNCTION toggle_comment_reaction(p_comment_id UUID, p_emoji TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  existing_reaction UUID;
BEGIN
  -- Check if reaction exists
  SELECT id INTO existing_reaction
  FROM comment_reactions
  WHERE comment_id = p_comment_id 
    AND user_id = auth.uid() 
    AND emoji = p_emoji;
  
  IF existing_reaction IS NOT NULL THEN
    -- Remove reaction
    DELETE FROM comment_reactions WHERE id = existing_reaction;
    RETURN false;
  ELSE
    -- Add reaction
    INSERT INTO comment_reactions (comment_id, user_id, emoji)
    VALUES (p_comment_id, auth.uid(), p_emoji);
    RETURN true;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;