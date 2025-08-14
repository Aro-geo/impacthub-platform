import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  MessageSquare, 
  Flag, 
  Eye, 
  EyeOff, 
  Trash2, 
  Edit, 
  Star, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Filter,
  Search,
  MoreHorizontal,
  Pin,
  PinOff,
  ThumbsUp,
  ThumbsDown,
  User,
  Calendar,
  Hash
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Post {
  id: string;
  title: string;
  content: string;
  user_id: string;
  user_name?: string;
  created_at: string;
  updated_at?: string;
  upvotes: number;
  is_featured: boolean;
  post_type?: string;
  subject_id?: string;
  lesson_id?: string;
  status: 'published' | 'pending' | 'flagged' | 'hidden' | 'deleted';
  reports_count: number;
  moderator_notes?: string;
}

interface Comment {
  id: string;
  content: string;
  user_id: string;
  user_name?: string;
  post_id: string;
  created_at: string;
  upvotes: number;
  status: 'published' | 'pending' | 'flagged' | 'hidden' | 'deleted';
  reports_count: number;
}

interface ContentModerationProps {
  className?: string;
}

const ContentModeration: React.FC<ContentModerationProps> = ({ className }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [filteredComments, setFilteredComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [moderatorNotes, setModeratorNotes] = useState('');

  useEffect(() => {
    fetchContent();
  }, []);

  useEffect(() => {
    filterContent();
  }, [posts, comments, searchTerm, statusFilter, typeFilter]);

  const fetchContent = async () => {
    setLoading(true);
    try {
      // Fetch posts with user information
      const { data: postsData, error: postsError } = await supabase
        .from('community_posts')
        .select(`
          *,
          profiles:user_id (name)
        `)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      // Fetch comments with user information
      const { data: commentsData, error: commentsError } = await supabase
        .from('post_comments')
        .select(`
          *,
          profiles:user_id (name)
        `)
        .order('created_at', { ascending: false });

      if (commentsError) throw commentsError;

      // Transform posts data
      const transformedPosts: Post[] = (postsData || []).map(post => ({
        id: post.id,
        title: post.title,
        content: post.content,
        user_id: post.user_id,
        user_name: post.profiles?.name || 'Unknown User',
        created_at: post.created_at,
        updated_at: post.updated_at,
        upvotes: post.upvotes || 0,
        is_featured: post.is_featured || false,
        post_type: post.post_type,
        subject_id: post.subject_id,
        lesson_id: post.lesson_id,
        status: 'published', // Default status
        reports_count: 0, // Would need a reports table
        moderator_notes: ''
      }));

      // Transform comments data
      const transformedComments: Comment[] = (commentsData || []).map(comment => ({
        id: comment.id,
        content: comment.content,
        user_id: comment.user_id,
        user_name: comment.profiles?.name || 'Unknown User',
        post_id: comment.post_id,
        created_at: comment.created_at,
        upvotes: 0, // Would need upvotes tracking for comments
        status: 'published',
        reports_count: 0
      }));

      setPosts(transformedPosts);
      setComments(transformedComments);
    } catch (error) {
      console.error('Failed to fetch content:', error);
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const filterContent = () => {
    let filteredP = posts;
    let filteredC = comments;

    // Search filter
    if (searchTerm) {
      filteredP = filteredP.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      filteredC = filteredC.filter(comment => 
        comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comment.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filteredP = filteredP.filter(post => post.status === statusFilter);
      filteredC = filteredC.filter(comment => comment.status === statusFilter);
    }

    // Type filter for posts
    if (typeFilter !== 'all') {
      if (typeFilter === 'featured') {
        filteredP = filteredP.filter(post => post.is_featured);
      } else if (typeFilter === 'reported') {
        filteredP = filteredP.filter(post => post.reports_count > 0);
      }
    }

    setFilteredPosts(filteredP);
    setFilteredComments(filteredC);
  };

  const updatePostStatus = async (postId: string, status: string) => {
    try {
      // In a real implementation, you'd have a status field in the database
      // For now, we'll simulate the update
      setPosts(posts.map(post => 
        post.id === postId ? { ...post, status: status as any } : post
      ));
      
      toast.success(`Post ${status} successfully`);
    } catch (error) {
      console.error('Failed to update post status:', error);
      toast.error('Failed to update post status');
    }
  };

  const toggleFeaturedPost = async (postId: string) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      const { error } = await supabase
        .from('community_posts')
        .update({ is_featured: !post.is_featured })
        .eq('id', postId);

      if (error) throw error;

      setPosts(posts.map(p => 
        p.id === postId ? { ...p, is_featured: !p.is_featured } : p
      ));
      
      toast.success(post.is_featured ? 'Post unfeatured' : 'Post featured');
    } catch (error) {
      console.error('Failed to toggle featured status:', error);
      toast.error('Failed to update featured status');
    }
  };

  const deletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      setPosts(posts.filter(post => post.id !== postId));
      toast.success('Post deleted successfully');
    } catch (error) {
      console.error('Failed to delete post:', error);
      toast.error('Failed to delete post');
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('post_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      setComments(comments.filter(comment => comment.id !== commentId));
      toast.success('Comment deleted successfully');
    } catch (error) {
      console.error('Failed to delete comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'flagged': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'hidden': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'flagged': return <AlertTriangle className="h-4 w-4" />;
      case 'hidden': return <EyeOff className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Content Moderation</h2>
          <p className="text-muted-foreground">Review and moderate community posts and comments</p>
        </div>
        <Button onClick={fetchContent}>
          <MessageSquare className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Posts</p>
                <p className="text-2xl font-bold">{posts.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Flagged Content</p>
                <p className="text-2xl font-bold">{posts.filter(p => p.status === 'flagged').length}</p>
              </div>
              <Flag className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Featured Posts</p>
                <p className="text-2xl font-bold">{posts.filter(p => p.is_featured).length}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Comments</p>
                <p className="text-2xl font-bold">{comments.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search posts and comments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
                <SelectItem value="hidden">Hidden</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="reported">Reported</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="posts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="posts">Posts ({filteredPosts.length})</TabsTrigger>
          <TabsTrigger value="comments">Comments ({filteredComments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          {filteredPosts.map((post) => (
            <Card key={post.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-lg">{post.title}</h3>
                      {post.is_featured && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                      <Badge className={getStatusColor(post.status)}>
                        {getStatusIcon(post.status)}
                        <span className="ml-1">{post.status}</span>
                      </Badge>
                    </div>
                    
                    <p className="text-muted-foreground mb-3 line-clamp-3">
                      {post.content}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        {post.user_name}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        {post.upvotes} upvotes
                      </span>
                      {post.reports_count > 0 && (
                        <span className="flex items-center text-red-600">
                          <Flag className="h-3 w-3 mr-1" />
                          {post.reports_count} reports
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFeaturedPost(post.id)}
                    >
                      {post.is_featured ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                    </Button>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Moderate Post</DialogTitle>
                          <DialogDescription>
                            Review and take action on this post
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">{post.title}</h4>
                            <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                              {post.content}
                            </p>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              onClick={() => updatePostStatus(post.id, 'published')}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => updatePostStatus(post.id, 'hidden')}
                            >
                              <EyeOff className="h-4 w-4 mr-2" />
                              Hide
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => updatePostStatus(post.id, 'flagged')}
                            >
                              <Flag className="h-4 w-4 mr-2" />
                              Flag
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Post</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to permanently delete this post? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deletePost(post.id)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">Moderator Notes</label>
                            <Textarea
                              placeholder="Add notes about this moderation action..."
                              value={moderatorNotes}
                              onChange={(e) => setModeratorNotes(e.target.value)}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="comments" className="space-y-4">
          {filteredComments.map((comment) => (
            <Card key={comment.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className={getStatusColor(comment.status)}>
                        {getStatusIcon(comment.status)}
                        <span className="ml-1">{comment.status}</span>
                      </Badge>
                    </div>
                    
                    <p className="text-muted-foreground mb-3">
                      {comment.content}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        {comment.user_name}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <Hash className="h-3 w-3 mr-1" />
                        Post ID: {comment.post_id.substring(0, 8)}...
                      </span>
                      {comment.reports_count > 0 && (
                        <span className="flex items-center text-red-600">
                          <Flag className="h-3 w-3 mr-1" />
                          {comment.reports_count} reports
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to permanently delete this comment? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteComment(comment.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentModeration;