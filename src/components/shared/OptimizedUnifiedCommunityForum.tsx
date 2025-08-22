import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import EmojiCommentSystem from './EmojiCommentSystem';
import {
  MessageSquare,
  Users,
  Plus,
  ThumbsUp,
  MessageCircle,
  Star,
  HelpCircle,
  BookOpen,
  Megaphone,
  Share2,
  Search,
  TrendingUp,
  Brain,
  Leaf,
  MoreVertical,
  Edit,
  Trash2,
  Reply,
  Send,
  Shield,
  BarChart3,
  Settings
} from 'lucide-react';

interface Subject {
  id: string;
  name: string;
  color: string;
}

interface CommunityPost {
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
  subject?: Subject;
  lesson?: {
    id: string;
    title: string;
  };
  profiles?: {
    name: string;
    avatar_url?: string;
    email?: string;
  };
  replies_count?: number;
  user_has_upvoted?: boolean;
  comments?: Comment[];
}

interface Comment {
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

interface UnifiedCommunityForumProps {
  context?: 'simple-lessons' | 'ai-tools' | 'general';
  title?: string;
  description?: string;
}

const OptimizedUnifiedCommunityForum = ({
  context = 'general',
  title = "Community Forum",
  description = "Connect, discuss, and learn together"
}: UnifiedCommunityForumProps) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [showNewPostDialog, setShowNewPostDialog] = useState(false);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    post_type: 'discussion' as const,
    subject_id: 'none',
    category: ''
  });
  const [editPost, setEditPost] = useState({
    id: '',
    title: '',
    content: '',
    post_type: 'discussion' as const
  });

  // Check if user is admin
  const isAdmin = user?.email === 'geokullo@gmail.com';
  const isPostOwner = (postUserId: string) => user?.id === postUserId;
  const isCommentOwner = (commentUserId: string) => user?.id === commentUserId;

  // Memoize post types to avoid recalculation
  const postTypes = useMemo(() => {
    const baseTypes = [
      { value: 'discussion', label: 'Discussion', icon: MessageSquare },
      { value: 'question', label: 'Question', icon: HelpCircle },
      { value: 'resource', label: 'Resource', icon: BookOpen }
    ];

    if (context === 'ai-tools') {
      return [
        ...baseTypes,
        { value: 'ai_help', label: 'AI Help', icon: Brain },
        { value: 'sustainability', label: 'Sustainability', icon: Leaf }
      ];
    }

    if (context === 'simple-lessons') {
      return [
        ...baseTypes,
        { value: 'announcement', label: 'Announcement', icon: Megaphone }
      ];
    }

    return baseTypes;
  }, [context]);

  // Optimized fetch functions with better error handling and caching
  const fetchSubjects = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('id, name, color')
        .order('name')
        .limit(50); // Limit to prevent excessive data

      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setSubjects([]);
    }
  }, []);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch posts with proper joins
      let query = supabase
        .from('community_posts')
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
          subject_id,
          replies_count,
          subjects:subject_id(id, name, color),
          profiles!community_posts_user_id_fkey(name, avatar_url, email)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      // Apply filters
      if (selectedSubject !== 'all') {
        query = query.eq('subject_id', selectedSubject);
      }
      if (selectedType !== 'all') {
        query = query.eq('post_type', selectedType);
      }

      const { data, error } = await query;

      if (error) {
        console.warn('Error fetching posts:', error);
        setPosts([]);
        return;
      }

      // Get user upvotes if user is logged in
      let userUpvotes = [];
      if (user && data && data.length > 0) {
        try {
          const { data: upvoteData } = await supabase
            .from('post_upvotes')
            .select('post_id')
            .eq('user_id', user.id)
            .in('post_id', data.map(p => p.id));
          userUpvotes = upvoteData?.map(u => u.post_id) || [];
        } catch (upvoteError) {
          console.warn('Could not fetch user upvotes:', upvoteError);
        }
      }

      // Process posts with real data
      const postsWithUpvotes = (data || []).map(post => ({
        ...post,
        subject: post.subjects,
        user_has_upvoted: userUpvotes.includes(post.id),
        replies_count: post.replies_count || 0
      }));

      setPosts(postsWithUpvotes);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [selectedSubject, selectedType, sortBy, context, user]);

  // Debounced effect for filters to prevent excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPosts();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchPosts]);

  // Fetch subjects only once
  useEffect(() => {
    if (context !== 'ai-tools') {
      fetchSubjects();
    }
  }, [fetchSubjects, context]);

  const createPost = useCallback(async () => {
    if (!user || !newPost.title.trim() || !newPost.content.trim()) return;

    try {
      const { error } = await supabase
        .from('community_posts')
        .insert({
          title: newPost.title,
          content: newPost.content,
          post_type: newPost.post_type,
          subject_id: newPost.subject_id === 'none' ? null : newPost.subject_id,
          user_id: user.id
        });

      if (error) throw error;

      setNewPost({
        title: '',
        content: '',
        post_type: 'discussion',
        subject_id: 'none',
        category: ''
      });
      setShowNewPostDialog(false);
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
    }
  }, [user, newPost, fetchPosts]);

  const updatePost = useCallback(async () => {
    if (!user || !editPost.title.trim() || !editPost.content.trim()) return;

    try {
      const { error } = await supabase
        .from('community_posts')
        .update({
          title: editPost.title,
          content: editPost.content,
          post_type: editPost.post_type,
          updated_at: new Date().toISOString()
        })
        .eq('id', editPost.id);

      if (error) throw error;

      setEditingPost(null);
      setEditPost({ id: '', title: '', content: '', post_type: 'discussion' });
      fetchPosts();
    } catch (error) {
      console.error('Error updating post:', error);
    }
  }, [user, editPost, fetchPosts]);

  const deletePost = useCallback(async (postId: string) => {
    if (!user) return;

    try {
      // Delete comments first
      await supabase
        .from('post_comments')
        .delete()
        .eq('post_id', postId);

      // Delete upvotes
      await supabase
        .from('post_upvotes')
        .delete()
        .eq('post_id', postId);

      // Delete the post
      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  }, [user, fetchPosts]);

  const fetchComments = useCallback(async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .select(`
          id,
          content,
          created_at,
          updated_at,
          user_id,
          post_id,
          profiles:user_id (
            name,
            avatar_url,
            email
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) {
        console.warn('Comments table not available:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  }, []);

  const addComment = useCallback(async (postId: string) => {
    if (!user || !newComment[postId]?.trim()) return;

    try {
      const { error } = await supabase
        .from('post_comments')
        .insert({
          content: newComment[postId],
          post_id: postId,
          user_id: user.id
        });

      if (error) throw error;

      // Update comment count
      const post = posts.find(p => p.id === postId);
      if (post) {
        await supabase
          .from('community_posts')
          .update({ replies_count: (post.replies_count || 0) + 1 })
          .eq('id', postId);
      }

      setNewComment(prev => ({ ...prev, [postId]: '' }));

      // Refresh comments for this post
      const comments = await fetchComments(postId);
      setPosts(prev => prev.map(p =>
        p.id === postId ? { ...p, comments, replies_count: (p.replies_count || 0) + 1 } : p
      ));
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  }, [user, newComment, posts, fetchComments]);

  const updateComment = useCallback(async (commentId: string, content: string, postId: string) => {
    if (!user || !content.trim()) return;

    try {
      const { error } = await supabase
        .from('post_comments')
        .update({
          content,
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId);

      if (error) throw error;

      setEditingComment(null);

      // Refresh comments for this post
      const comments = await fetchComments(postId);
      setPosts(prev => prev.map(p =>
        p.id === postId ? { ...p, comments } : p
      ));
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  }, [user, fetchComments]);

  const deleteComment = useCallback(async (commentId: string, postId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('post_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      // Update comment count
      const post = posts.find(p => p.id === postId);
      if (post) {
        await supabase
          .from('community_posts')
          .update({ replies_count: Math.max(0, (post.replies_count || 0) - 1) })
          .eq('id', postId);
      }

      // Refresh comments for this post
      const comments = await fetchComments(postId);
      setPosts(prev => prev.map(p =>
        p.id === postId ? { ...p, comments, replies_count: Math.max(0, (p.replies_count || 0) - 1) } : p
      ));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  }, [user, posts, fetchComments]);

  const toggleComments = useCallback(async (postId: string) => {
    setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }));

    if (!showComments[postId]) {
      const comments = await fetchComments(postId);
      setPosts(prev => prev.map(p =>
        p.id === postId ? { ...p, comments } : p
      ));
    }
  }, [showComments, fetchComments]);

  const toggleUpvote = useCallback(async (postId: string) => {
    if (!user) return;

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      // Optimistic update
      setPosts(prev => prev.map(p =>
        p.id === postId
          ? {
            ...p,
            upvotes: p.user_has_upvoted ? p.upvotes - 1 : p.upvotes + 1,
            user_has_upvoted: !p.user_has_upvoted
          }
          : p
      ));

      if (post.user_has_upvoted) {
        // Remove upvote - with error handling for missing tables
        try {
          await Promise.all([
            supabase
              .from('post_upvotes')
              .delete()
              .eq('post_id', postId)
              .eq('user_id', user.id)
              .then(result => {
                if (result.error) throw result.error;
                return result;
              }),
            supabase
              .from('community_posts')
              .update({ upvotes: post.upvotes - 1 })
              .eq('id', postId)
          ]);
        } catch (tableError) {
          console.warn('Error with upvote tables, updating post only:', tableError);
          // Fallback: just update the post upvotes count
          await supabase
            .from('community_posts')
            .update({ upvotes: Math.max(0, post.upvotes - 1) })
            .eq('id', postId);
        }
      } else {
        // Add upvote - with error handling for missing tables
        try {
          await Promise.all([
            supabase
              .from('post_upvotes')
              .insert({
                post_id: postId,
                user_id: user.id
              })
              .then(result => {
                if (result.error) throw result.error;
                return result;
              }),
            supabase
              .from('community_posts')
              .update({ upvotes: post.upvotes + 1 })
              .eq('id', postId)
          ]);
        } catch (tableError) {
          console.warn('Error with upvote tables, updating post only:', tableError);
          // Fallback: just update the post upvotes count
          await supabase
            .from('community_posts')
            .update({ upvotes: post.upvotes + 1 })
            .eq('id', postId);
        }
      }
    } catch (error) {
      console.error('Error toggling upvote:', error);
      // Revert optimistic update on error
      fetchPosts();
    }
  }, [user, posts, fetchPosts]);

  // Memoize filtered posts to avoid recalculation
  const filteredPosts = useMemo(() => {
    if (!searchTerm) return posts;

    const lowerSearchTerm = searchTerm.toLowerCase();
    return posts.filter(post =>
      post.title.toLowerCase().includes(lowerSearchTerm) ||
      post.content.toLowerCase().includes(lowerSearchTerm)
    );
  }, [posts, searchTerm]);

  // Memoize utility functions
  const getPostTypeIcon = useCallback((type: string) => {
    switch (type) {
      case 'question': return <HelpCircle className="h-4 w-4" />;
      case 'resource': return <BookOpen className="h-4 w-4" />;
      case 'announcement': return <Megaphone className="h-4 w-4" />;
      case 'ai_help': return <Brain className="h-4 w-4" />;
      case 'sustainability': return <Leaf className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  }, []);

  const getPostTypeColor = useCallback((type: string) => {
    switch (type) {
      case 'question': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'resource': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'announcement': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'ai_help': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300';
      case 'sustainability': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300';
      default: return 'bg-muted text-muted-foreground';
    }
  }, []);

  // Memoize stats to avoid recalculation
  const stats = useMemo(() => ({
    totalPosts: posts.length,
    activeMembers: new Set(posts.map(p => p.user_id)).size,
    totalReplies: posts.reduce((sum, post) => sum + (post.replies_count || 0), 0)
  }), [posts]);

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-full mb-4"></div>
              <div className="h-8 bg-muted rounded w-1/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
          {isAdmin && (
            <div className="mt-2 flex items-center space-x-2">
              <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
                <Shield className="h-3 w-3 mr-1" />
                Admin Access
              </Badge>
              <Button variant="outline" size="sm" className="text-xs">
                <BarChart3 className="h-3 w-3 mr-1" />
                Platform Analytics
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <Settings className="h-3 w-3 mr-1" />
                Admin Settings
              </Button>
            </div>
          )}

        </div>
        <div className="flex space-x-2">
          <Dialog open={showNewPostDialog} onOpenChange={setShowNewPostDialog}>
            <DialogTrigger asChild>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Post
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Create New Post</DialogTitle>
                <DialogDescription>
                  Share a question, discussion, or resource with the community
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Post Type
                  </label>
                  <Select
                    value={newPost.post_type}
                    onValueChange={(value: any) => setNewPost(prev => ({ ...prev, post_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {postTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center space-x-2">
                            <type.icon className="h-4 w-4" />
                            <span>{type.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {context !== 'ai-tools' && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Subject (Optional)
                    </label>
                    <Select
                      value={newPost.subject_id}
                      onValueChange={(value) => setNewPost(prev => ({ ...prev, subject_id: value === "none" ? "" : value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No specific subject</SelectItem>
                        {subjects.map(subject => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Title
                  </label>
                  <Input
                    placeholder="Enter post title..."
                    value={newPost.title}
                    onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Content
                  </label>
                  <Textarea
                    placeholder="Write your post content..."
                    value={newPost.content}
                    onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                    rows={4}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowNewPostDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createPost}>
                    Create Post
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Post Dialog */}
          <Dialog open={editingPost !== null} onOpenChange={(open) => !open && setEditingPost(null)}>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Edit Post</DialogTitle>
                <DialogDescription>
                  Update your post content
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Post Type
                  </label>
                  <Select
                    value={editPost.post_type}
                    onValueChange={(value: any) => setEditPost(prev => ({ ...prev, post_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {postTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center space-x-2">
                            <type.icon className="h-4 w-4" />
                            <span>{type.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Title
                  </label>
                  <Input
                    placeholder="Enter post title..."
                    value={editPost.title}
                    onChange={(e) => setEditPost(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Content
                  </label>
                  <Textarea
                    placeholder="Write your post content..."
                    value={editPost.content}
                    onChange={(e) => setEditPost(prev => ({ ...prev, content: e.target.value }))}
                    rows={4}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setEditingPost(null)}>
                    Cancel
                  </Button>
                  <Button onClick={updatePost}>
                    Update Post
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {context !== 'ai-tools' && (
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map(subject => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {postTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Community Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stats.totalPosts}
            </div>
            <div className="text-sm text-gray-600">Total Posts</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stats.activeMembers}
            </div>
            <div className="text-sm text-gray-600">Active Members</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stats.totalReplies}
            </div>
            <div className="text-sm text-gray-600">Total Replies</div>
          </CardContent>
        </Card>
      </div>

      {/* Posts List */}
      {filteredPosts.length > 0 ? (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={post.profiles?.avatar_url} />
                    <AvatarFallback>
                      {post.profiles?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge className={getPostTypeColor(post.post_type)}>
                          {getPostTypeIcon(post.post_type)}
                          <span className="ml-1 capitalize">{post.post_type.replace('_', ' ')}</span>
                        </Badge>

                        {post.subject && (
                          <Badge variant="secondary">
                            {post.subject.name}
                          </Badge>
                        )}

                        {post.is_featured && (
                          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                      </div>

                      {/* Post Actions Menu */}
                      {(isPostOwner(post.user_id) || isAdmin) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {isPostOwner(post.user_id) && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditPost({
                                    id: post.id,
                                    title: post.title,
                                    content: post.content,
                                    post_type: post.post_type
                                  });
                                  setEditingPost(post.id);
                                }}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Post
                              </DropdownMenuItem>
                            )}
                            {(isPostOwner(post.user_id) || isAdmin) && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Post
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Post</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this post? This action cannot be undone and will also delete all comments.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deletePost(post.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {post.title}
                    </h3>

                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {post.content}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{post.profiles?.name || 'Anonymous'}</span>
                        <span>•</span>
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        {post.updated_at !== post.created_at && (
                          <>
                            <span>•</span>
                            <span className="text-xs">edited</span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center space-x-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleUpvote(post.id)}
                          className={`flex items-center space-x-1 ${post.user_has_upvoted ? 'text-blue-600' : 'text-muted-foreground'
                            }`}
                        >
                          <ThumbsUp className="h-4 w-4" />
                          <span>{post.upvotes}</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center space-x-1"
                          onClick={() => toggleComments(post.id)}
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span>{post.replies_count || 0}</span>
                        </Button>

                        <Button variant="ghost" size="sm">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Comments Section */}
                    {showComments[post.id] && (
                      <div className="border-t pt-4">
                        <EmojiCommentSystem 
                          postId={post.id}
                          onCommentAdded={() => {
                            // Refresh post to update comment count
                            fetchPosts();
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts found</h3>
            <p className="text-gray-600 mb-6">
              Be the first to start a discussion in the community!
            </p>
            <Button onClick={() => setShowNewPostDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create First Post
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OptimizedUnifiedCommunityForum;