/**
 * CommunityService Module
 * 
 * Provides optimized functions for interacting with community data.
 * Implements caching, batching, and efficient database operations.
 */

import { supabase } from '@/integrations/supabase/client';
import { cachedQuery, queryCache, selectMinimal, batchInsert } from '@/utils/dbOptimization';

export interface Post {
  id: string;
  title: string;
  content: string;
  post_type: 'question' | 'discussion' | 'resource' | 'announcement' | 'ai_help' | 'sustainability';
  upvotes: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
  lesson_id?: string;
  subject_id?: string;
  category?: string;
  profiles?: {
    name: string;
    avatar_url?: string;
    email?: string;
  };
  replies_count?: number;
}

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  post_id: string;
  profiles?: {
    name: string;
    avatar_url?: string;
    email?: string;
  };
}

/**
 * Fetch recent posts with efficient caching
 */
export const getRecentPosts = async (
  limit: number = 10,
  postType?: string,
  subjectId?: string
): Promise<Post[]> => {
  // Create a cache key based on parameters
  const cacheKey = `posts:recent:${limit}:${postType || 'all'}:${subjectId || 'all'}`;
  
  return await cachedQuery<Post[]>('posts', () => {
    let query = supabase
      .from('posts')
      .select(`
        id, 
        title, 
        content,
        post_type,
        upvotes,
        is_featured,
        created_at,
        updated_at,
        user_id,
        lesson_id,
        subject_id,
        category,
        profiles (
          name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    // Apply filters if provided
    if (postType) {
      query = query.eq('post_type', postType);
    }
    
    if (subjectId) {
      query = query.eq('subject_id', subjectId);
    }
    
    return query;
  }, cacheKey, 300); // Cache for 5 minutes
};

/**
 * Get a single post with full details
 */
export const getPostWithComments = async (postId: string): Promise<{post: Post, comments: Comment[]}> => {
  const cacheKey = `post:${postId}:with_comments`;
  
  return await cachedQuery('posts', async () => {
    // Fetch the post
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select(`
        id, 
        title, 
        content,
        post_type,
        upvotes,
        is_featured,
        created_at,
        updated_at,
        user_id,
        lesson_id,
        subject_id,
        category,
        profiles (
          name,
          avatar_url
        )
      `)
      .eq('id', postId)
      .single();
    
    if (postError) {
      console.error('Error fetching post:', postError);
      return { data: { post: null, comments: [] }, error: postError };
    }
    
    // Fetch comments for the post
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select(`
        id,
        content,
        created_at,
        updated_at,
        user_id,
        post_id,
        profiles (
          name,
          avatar_url
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    
    if (commentsError) {
      console.error('Error fetching comments:', commentsError);
      return { data: { post, comments: [] }, error: commentsError };
    }
    
    return { data: { post, comments: comments || [] }, error: null };
  }, cacheKey, 300); // Cache for 5 minutes
};

/**
 * Create a new post with cache invalidation
 */
export const createPost = async (postData: Omit<Post, 'id' | 'created_at' | 'updated_at' | 'profiles' | 'replies_count'>): Promise<{ success: boolean; post?: Post; error?: any }> => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .insert(postData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating post:', error);
      return { success: false, error };
    }
    
    // Invalidate the posts cache
    queryCache.clearByPrefix('posts:');
    
    return { success: true, post: data };
  } catch (error) {
    console.error('Exception creating post:', error);
    return { success: false, error };
  }
};

/**
 * Add a comment with optimistic updates
 */
export const addComment = async (
  postId: string, 
  userId: string, 
  content: string
): Promise<{ success: boolean; comment?: Comment; error?: any }> => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        user_id: userId,
        content
      })
      .select(`
        id, 
        content,
        created_at,
        updated_at,
        user_id,
        post_id,
        profiles (
          name,
          avatar_url
        )
      `)
      .single();
    
    if (error) {
      console.error('Error adding comment:', error);
      return { success: false, error };
    }
    
    // Invalidate relevant cache entries
    queryCache.clear(`post:${postId}:with_comments`);
    
    return { success: true, comment: data };
  } catch (error) {
    console.error('Exception adding comment:', error);
    return { success: false, error };
  }
};

/**
 * Toggle upvote on a post
 */
export const togglePostUpvote = async (
  postId: string, 
  userId: string
): Promise<{ success: boolean; upvoted: boolean; error?: any }> => {
  try {
    // Check if user has already upvoted
    const { data: existingUpvote, error: checkError } = await supabase
      .from('post_upvotes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Error checking upvote:', checkError);
      return { success: false, upvoted: false, error: checkError };
    }
    
    if (existingUpvote) {
      // Remove upvote
      const { error: removeError } = await supabase
        .from('post_upvotes')
        .delete()
        .eq('id', existingUpvote.id);
      
      if (removeError) {
        return { success: false, upvoted: true, error: removeError };
      }
      
      // Update the upvote count in the posts table
      await supabase.rpc('decrement_post_upvotes', { post_id: postId });
      
      // Invalidate cache
      queryCache.clearByPrefix(`posts:`);
      queryCache.clear(`post:${postId}:with_comments`);
      
      return { success: true, upvoted: false };
    } else {
      // Add upvote
      const { error: addError } = await supabase
        .from('post_upvotes')
        .insert({
          post_id: postId,
          user_id: userId
        });
      
      if (addError) {
        return { success: false, upvoted: false, error: addError };
      }
      
      // Update the upvote count in the posts table
      await supabase.rpc('increment_post_upvotes', { post_id: postId });
      
      // Invalidate cache
      queryCache.clearByPrefix(`posts:`);
      queryCache.clear(`post:${postId}:with_comments`);
      
      return { success: true, upvoted: true };
    }
  } catch (error) {
    console.error('Exception toggling upvote:', error);
    return { success: false, upvoted: false, error };
  }
};

/**
 * Get trending posts based on recent upvotes and comments
 */
export const getTrendingPosts = async (limit: number = 5): Promise<Post[]> => {
  const cacheKey = `posts:trending:${limit}`;
  
  return await cachedQuery<Post[]>('posts', () => {
    return supabase.rpc('get_trending_posts', { limit_count: limit });
  }, cacheKey, 600); // Cache for 10 minutes
};

/**
 * Search posts with full-text search
 */
export const searchPosts = async (query: string, limit: number = 20): Promise<Post[]> => {
  // Don't cache search results as they're likely to be unique per query
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        id, 
        title, 
        content,
        post_type,
        upvotes,
        is_featured,
        created_at,
        updated_at,
        user_id,
        lesson_id,
        subject_id,
        category,
        profiles (
          name,
          avatar_url
        )
      `)
      .textSearch('fts', query, {
        type: 'websearch',
        config: 'english'
      })
      .limit(limit);
    
    if (error) {
      console.error('Error searching posts:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Exception searching posts:', error);
    return [];
  }
};

export default {
  getRecentPosts,
  getPostWithComments,
  createPost,
  addComment,
  togglePostUpvote,
  getTrendingPosts,
  searchPosts
};
