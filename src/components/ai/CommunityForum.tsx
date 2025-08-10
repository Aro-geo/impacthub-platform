import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAI } from '@/hooks/useAI';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, Heart, MessageCircle, Loader2, TrendingUp, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  user_id: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  profiles: {
    name: string;
    avatar_url: string;
  };
  sentiment?: {
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
  };
}

interface Comment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  profiles: {
    name: string;
    avatar_url: string;
  };
}

const CommunityForum = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('');
  const [newComment, setNewComment] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const { analyzeSentiment } = useAI();

  const categories = [
    'education',
    'accessibility', 
    'sustainability',
    'community',
    'general'
  ];

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      console.log('Fetching posts...');
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (name, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error fetching posts:', error);
        throw error;
      }

      console.log('Posts fetched:', data);

      // Analyze sentiment for each post
      const postsWithSentiment = await Promise.all(
        (data || []).map(async (post) => {
          try {
            const sentiment = await analyzeSentiment(post.content);
            return { ...post, sentiment };
          } catch {
            return post;
          }
        })
      );

      setPosts(postsWithSentiment);
    } catch (error) {
      console.error('Error fetching posts:', error);
      // Set empty posts array on error so UI doesn't break
      setPosts([]);
    }
  };

  const fetchComments = async (postId: string) => {
    try {
      console.log('Fetching comments for post:', postId);
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles (name, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Supabase error fetching comments:', error);
        throw error;
      }

      console.log('Comments fetched:', data);
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
    }
  };

  const createPost = async () => {
    if (!user || !newPostTitle.trim() || !newPostContent.trim() || !newPostCategory) {
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          title: newPostTitle,
          content: newPostContent,
          category: newPostCategory,
          user_id: user.id
        })
        .select(`
          *,
          profiles (name, avatar_url)
        `)
        .single();

      if (error) throw error;

      // Analyze sentiment for the new post
      const sentiment = await analyzeSentiment(newPostContent);
      const postWithSentiment = { ...data, sentiment };

      setPosts([postWithSentiment, ...posts]);
      setNewPostTitle('');
      setNewPostContent('');
      setNewPostCategory('');
      setShowCreatePost(false);

      toast({
        title: "Post Created",
        description: "Your post has been shared with the community!",
      });
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addComment = async () => {
    if (!user || !selectedPost || !newComment.trim()) return;

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          content: newComment,
          post_id: selectedPost.id,
          user_id: user.id
        })
        .select(`
          *,
          profiles (name, avatar_url)
        `)
        .single();

      if (error) throw error;

      setComments([...comments, data]);
      setNewComment('');

      toast({
        title: "Comment Added",
        description: "Your comment has been posted!",
      });
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const likePost = async (postId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('post_likes')
        .insert({
          post_id: postId,
          user_id: user.id
        });

      if (error && error.code !== '23505') { // Ignore duplicate key error
        throw error;
      }

      // Refresh posts to update like count
      fetchPosts();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const getSentimentColor = (sentiment?: { sentiment: string; confidence: number }) => {
    if (!sentiment) return 'bg-gray-100 text-gray-600';
    
    switch (sentiment.sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-700';
      case 'negative':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  const getSentimentIcon = (sentiment?: { sentiment: string; confidence: number }) => {
    if (!sentiment) return null;
    
    switch (sentiment.sentiment) {
      case 'positive':
        return <TrendingUp className="h-3 w-3" />;
      case 'negative':
        return <AlertTriangle className="h-3 w-3" />;
      default:
        return <MessageSquare className="h-3 w-3" />;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-blue-600" />
            AI-Powered Community Forum
          </CardTitle>
          <CardDescription>
            Connect with the community. AI analyzes sentiment to promote positive discussions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Button onClick={() => setShowCreatePost(!showCreatePost)}>
              {showCreatePost ? 'Cancel' : 'Create New Post'}
            </Button>
            <Select value="" onValueChange={(category) => {
              if (category === 'all') {
                fetchPosts();
              } else {
                const filtered = posts.filter(post => post.category === category);
                setPosts(filtered);
              }
            }}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Create Post Form */}
          {showCreatePost && (
            <Card className="mb-6">
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    placeholder="What's your post about?"
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={newPostCategory} onValueChange={setNewPostCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Content</Label>
                  <Textarea
                    placeholder="Share your thoughts, questions, or ideas..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button 
                  onClick={createPost}
                  disabled={loading || !newPostTitle.trim() || !newPostContent.trim() || !newPostCategory}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Post...
                    </>
                  ) : (
                    'Create Post'
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Posts List */}
          <div className="space-y-4">
            {posts.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts yet</h3>
                  <p className="text-gray-600 mb-6">Be the first to start a conversation in the community!</p>
                  <Button onClick={() => setShowCreatePost(true)}>
                    Create First Post
                  </Button>
                </CardContent>
              </Card>
            ) : (
              posts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarImage src={post.profiles?.avatar_url} />
                      <AvatarFallback>
                        {post.profiles?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{post.title}</h3>
                        <Badge variant="outline">{post.category}</Badge>
                        {post.sentiment && (
                          <Badge className={`${getSentimentColor(post.sentiment)} flex items-center gap-1`}>
                            {getSentimentIcon(post.sentiment)}
                            {post.sentiment.sentiment}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        by {post.profiles?.name} • {new Date(post.created_at).toLocaleDateString()}
                      </p>
                      
                      <p className="text-gray-800 mb-4">{post.content}</p>
                      
                      <div className="flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => likePost(post.id)}
                          className="flex items-center gap-1"
                        >
                          <Heart className="h-4 w-4" />
                          {post.likes_count}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedPost(post);
                            fetchComments(post.id);
                          }}
                          className="flex items-center gap-1"
                        >
                          <MessageCircle className="h-4 w-4" />
                          {post.comments_count} Comments
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Comments Modal/Section */}
      {selectedPost && (
        <Card>
          <CardHeader>
            <CardTitle>Comments on "{selectedPost.title}"</CardTitle>
            <Button 
              variant="outline" 
              onClick={() => setSelectedPost(null)}
              className="w-fit"
            >
              Back to Posts
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Comment */}
            <div className="flex gap-2">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={2}
                className="flex-1"
              />
              <Button onClick={addComment} disabled={!newComment.trim()}>
                Comment
              </Button>
            </div>

            {/* Comments List */}
            <div className="space-y-3">
              {comments.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No comments yet</p>
                  <p className="text-gray-400 text-xs">Be the first to comment on this post</p>
                </div>
              ) : (
                comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.profiles?.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {comment.profiles?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{comment.profiles?.name}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CommunityForum;