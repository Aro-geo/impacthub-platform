import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
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
  Filter,
  TrendingUp,
  Clock,
  Award
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
  post_type: 'question' | 'discussion' | 'resource' | 'announcement';
  upvotes: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
  lesson_id?: string;
  subject_id?: string;
  subject?: Subject;
  lesson?: {
    id: string;
    title: string;
  };
  profiles?: {
    name: string;
    avatar_url?: string;
  };
  replies_count?: number;
  user_has_upvoted?: boolean;
}

interface CommunityReply {
  id: string;
  content: string;
  upvotes: number;
  created_at: string;
  user_id: string;
  profiles?: {
    name: string;
    avatar_url?: string;
  };
}

const CommunitySection = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [showNewPostDialog, setShowNewPostDialog] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    post_type: 'discussion' as const,
    subject_id: ''
  });

  useEffect(() => {
    fetchSubjects();
    fetchPosts();
  }, [selectedSubject, selectedType, sortBy]);

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name');

      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('community_posts')
        .select(`
          *,
          subjects (
            id,
            name,
            color
          ),
          simple_lessons (
            id,
            title
          ),
          profiles (
            name,
            avatar_url
          )
        `);

      // Apply filters
      if (selectedSubject !== 'all') {
        query = query.eq('subject_id', selectedSubject);
      }

      if (selectedType !== 'all') {
        query = query.eq('post_type', selectedType);
      }

      // Apply sorting
      switch (sortBy) {
        case 'popular':
          query = query.order('upvotes', { ascending: false });
          break;
        case 'recent':
          query = query.order('created_at', { ascending: false });
          break;
        case 'featured':
          query = query.order('is_featured', { ascending: false });
          break;
      }

      const { data, error } = await query;
      if (error) throw error;

      // Get reply counts for each post
      const postsWithCounts = await Promise.all(
        (data || []).map(async (post) => {
          const { count } = await supabase
            .from('community_replies')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id);

          // Check if user has upvoted this post
          let userHasUpvoted = false;
          if (user) {
            const { data: upvoteData } = await supabase
              .from('post_upvotes')
              .select('id')
              .eq('post_id', post.id)
              .eq('user_id', user.id)
              .single();
            
            userHasUpvoted = !!upvoteData;
          }

          return {
            ...post,
            replies_count: count || 0,
            user_has_upvoted: userHasUpvoted
          };
        })
      );

      setPosts(postsWithCounts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async () => {
    if (!user || !newPost.title.trim() || !newPost.content.trim()) return;

    try {
      const { error } = await supabase
        .from('community_posts')
        .insert({
          title: newPost.title,
          content: newPost.content,
          post_type: newPost.post_type,
          subject_id: newPost.subject_id || null,
          user_id: user.id
        });

      if (error) throw error;

      setNewPost({
        title: '',
        content: '',
        post_type: 'discussion',
        subject_id: ''
      });
      setShowNewPostDialog(false);
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const toggleUpvote = async (postId: string) => {
    if (!user) return;

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.user_has_upvoted) {
        // Remove upvote
        await supabase
          .from('post_upvotes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        await supabase
          .from('community_posts')
          .update({ upvotes: post.upvotes - 1 })
          .eq('id', postId);
      } else {
        // Add upvote
        await supabase
          .from('post_upvotes')
          .insert({
            post_id: postId,
            user_id: user.id
          });

        await supabase
          .from('community_posts')
          .update({ upvotes: post.upvotes + 1 })
          .eq('id', postId);
      }

      fetchPosts();
    } catch (error) {
      console.error('Error toggling upvote:', error);
    }
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'question': return <HelpCircle className="h-4 w-4" />;
      case 'resource': return <BookOpen className="h-4 w-4" />;
      case 'announcement': return <Megaphone className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'question': return 'bg-blue-100 text-blue-800';
      case 'resource': return 'bg-green-100 text-green-800';
      case 'announcement': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
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
          <h2 className="text-2xl font-bold text-gray-900">Community Forum</h2>
          <p className="text-gray-600">Connect, discuss, and learn together</p>
        </div>
        <Dialog open={showNewPostDialog} onOpenChange={setShowNewPostDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
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
                    <SelectItem value="discussion">Discussion</SelectItem>
                    <SelectItem value="question">Question</SelectItem>
                    <SelectItem value="resource">Resource</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Subject (Optional)
                </label>
                <Select 
                  value={newPost.subject_id} 
                  onValueChange={(value) => setNewPost(prev => ({ ...prev, subject_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No specific subject</SelectItem>
                    {subjects.map(subject => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="discussion">Discussions</SelectItem>
                <SelectItem value="question">Questions</SelectItem>
                <SelectItem value="resource">Resources</SelectItem>
                <SelectItem value="announcement">Announcements</SelectItem>
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
              {posts.length}
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
              {new Set(posts.map(p => p.user_id)).size}
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
              {posts.reduce((sum, post) => sum + (post.replies_count || 0), 0)}
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
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className={getPostTypeColor(post.post_type)}>
                        {getPostTypeIcon(post.post_type)}
                        <span className="ml-1 capitalize">{post.post_type}</span>
                      </Badge>
                      
                      {post.subject && (
                        <Badge variant="secondary">
                          {post.subject.name}
                        </Badge>
                      )}
                      
                      {post.is_featured && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {post.title}
                    </h3>

                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.content}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{post.profiles?.name || 'Anonymous'}</span>
                        <span>•</span>
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                      </div>

                      <div className="flex items-center space-x-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleUpvote(post.id)}
                          className={`flex items-center space-x-1 ${
                            post.user_has_upvoted ? 'text-blue-600' : 'text-gray-500'
                          }`}
                        >
                          <ThumbsUp className="h-4 w-4" />
                          <span>{post.upvotes}</span>
                        </Button>

                        <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                          <MessageCircle className="h-4 w-4" />
                          <span>{post.replies_count || 0}</span>
                        </Button>

                        <Button variant="ghost" size="sm">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
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

export default CommunitySection;