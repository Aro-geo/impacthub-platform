-- Fix RLS policies for community tables

-- Drop existing policies
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON community_posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON community_posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON community_posts;

-- Create new policies
CREATE POLICY "Anyone can view posts" ON community_posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts" ON community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own posts" ON community_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own posts" ON community_posts FOR DELETE USING (auth.uid() = user_id);

-- Fix the query issue by ensuring proper foreign key references
ALTER TABLE community_posts DROP CONSTRAINT IF EXISTS community_posts_user_id_fkey;
ALTER TABLE community_posts ADD CONSTRAINT community_posts_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;