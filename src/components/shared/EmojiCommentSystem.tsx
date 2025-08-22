import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  MoreVertical,
  Edit,
  Trash2,
  Reply,
  Send,
  Smile,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Frown,
  MessageCircle
} from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  post_id: string;
  parent_comment_id?: string;
  is_edited: boolean;
  profiles?: {
    name: string;
    avatar_url?: string;
    email?: string;
  };
  reactions?: {
    [emoji: string]: {
      count: number;
      users: Array<{
        user_id: string;
        name: string;
      }>;
    };
  };
  replies?: Comment[];
}

interface EmojiCommentSystemProps {
  postId: string;
  onCommentAdded?: () => void;
}

const EMOJI_OPTIONS = [
  { emoji: '👍', label: 'Like', icon: ThumbsUp },
  { emoji: '❤️', label: 'Love', icon: Heart },
  { emoji: '😂', label: 'Laugh', icon: Smile },
  { emoji: '😢', label: 'Sad', icon: Frown },
  { emoji: '😠', label: 'Angry', icon: Frown },
  { emoji: '👎', label: 'Dislike', icon: ThumbsDown },
];

const EmojiCommentSystem = ({ postId, onCommentAdded }: EmojiCommentSystemProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      
      // Fetch comments
      const { data: commentsData, error } = await supabase
        .from('post_comments')
        .select(`
          id,
          content,
          created_at,
          updated_at,
          user_id,
          post_id,
          parent_comment_id,
          is_edited
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) {
        console.warn('Comments table not available:', error);
        setComments([]);
        setLoading(false);
        return;
      }



      // Get profiles separately to avoid relationship issues
      let userProfiles: Record<string, any> = {};
      try {
        // Get unique user IDs from comments
        const userIds = [...new Set(commentsData?.map(c => c.user_id) || [])];
        
        if (userIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, name, avatar_url, email')
            .in('id', userIds);
          
          // Create a lookup map of user_id to profile
          userProfiles = (profilesData || []).reduce((acc, profile) => {
            acc[profile.id] = profile;
            return acc;
          }, {} as Record<string, any>);
        }
      } catch (profileError) {
        console.warn('Error fetching profiles:', profileError);
      }

      const commentsWithUserInfo = (commentsData || []).map(comment => ({
        ...comment,
        profiles: userProfiles[comment.user_id] || { name: 'Anonymous User', avatar_url: null, email: null },
        reactions: {} // Will be populated if needed
      }));

      // Organize comments into threads (parent comments with replies)
      const parentComments = commentsWithUserInfo.filter(c => !c.parent_comment_id);
      const repliesMap = new Map<string, Comment[]>();
      
      commentsWithUserInfo
        .filter(c => c.parent_comment_id)
        .forEach(reply => {
          if (!repliesMap.has(reply.parent_comment_id!)) {
            repliesMap.set(reply.parent_comment_id!, []);
          }
          repliesMap.get(reply.parent_comment_id!)!.push(reply);
        });

      const threaded = parentComments.map(parent => ({
        ...parent,
        replies: repliesMap.get(parent.id) || []
      }));


      setComments(threaded);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const addComment = async () => {
    if (!user || !newComment.trim()) return;

    try {
      const { error } = await supabase
        .from('post_comments')
        .insert({
          content: newComment.trim(),
          post_id: postId,
          user_id: user.id
        });

      if (error) throw error;

      setNewComment('');
      await fetchComments();
      onCommentAdded?.();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const addReply = async (parentCommentId: string) => {
    if (!user || !replyContent.trim()) return;

    try {
      const { error } = await supabase
        .from('post_comments')
        .insert({
          content: replyContent.trim(),
          post_id: postId,
          user_id: user.id,
          parent_comment_id: parentCommentId
        });

      if (error) throw error;

      setReplyContent('');
      setReplyingTo(null);
      await fetchComments();
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  const updateComment = async (commentId: string) => {
    if (!user || !editContent.trim()) return;

    try {
      const { error } = await supabase
        .from('post_comments')
        .update({
          content: editContent.trim(),
          is_edited: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId);

      if (error) throw error;

      setEditContent('');
      setEditingComment(null);
      await fetchComments();
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('post_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      await fetchComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const toggleReaction = async (commentId: string, emoji: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .rpc('toggle_comment_reaction', {
          p_comment_id: commentId,
          p_emoji: emoji
        });

      if (error) throw error;

      // Refresh comments to show updated reactions
      await fetchComments();
    } catch (error) {
      console.error('Error toggling reaction:', error);
    }
  };

  const isCommentOwner = (commentUserId: string) => user?.id === commentUserId;
  const isAdmin = user?.email === 'geokullo@gmail.com';

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`${isReply ? 'ml-8 border-l-2 border-muted pl-4' : ''}`}>
      <div className="flex space-x-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.profiles?.avatar_url} />
          <AvatarFallback>
            {comment.profiles?.name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="bg-muted rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-foreground">
                {comment.profiles?.name || 'Anonymous'}
              </span>
              {(isCommentOwner(comment.user_id) || isAdmin) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {isCommentOwner(comment.user_id) && (
                      <DropdownMenuItem
                        onClick={() => {
                          setEditingComment(comment.id);
                          setEditContent(comment.content);
                        }}
                      >
                        <Edit className="h-3 w-3 mr-2" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {(isCommentOwner(comment.user_id) || isAdmin) && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Trash2 className="h-3 w-3 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this comment? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteComment(comment.id)}
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
            
            {editingComment === comment.id ? (
              <div className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={2}
                  className="text-sm"
                />
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => updateComment(comment.id)}
                    disabled={!editContent.trim()}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingComment(null);
                      setEditContent('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-foreground whitespace-pre-wrap">{comment.content}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-2 mt-1 text-xs text-muted-foreground">
            <span>{new Date(comment.created_at).toLocaleDateString()}</span>
            {comment.is_edited && (
              <>
                <span>•</span>
                <span>edited</span>
              </>
            )}
          </div>

          {/* Emoji Reactions */}
          <div className="flex items-center space-x-2 mt-2">
            {/* Reaction Buttons */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 px-2">
                  <Smile className="h-3 w-3 mr-1" />
                  React
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {EMOJI_OPTIONS.map(({ emoji, label }) => (
                  <DropdownMenuItem
                    key={emoji}
                    onClick={() => toggleReaction(comment.id, emoji)}
                    className="flex items-center space-x-2"
                  >
                    <span className="text-lg">{emoji}</span>
                    <span>{label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Reply Button */}
            {!isReply && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2"
                onClick={() => setReplyingTo(comment.id)}
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
            )}
          </div>

          {/* Display Reactions */}
          {comment.reactions && Object.keys(comment.reactions).length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {Object.entries(comment.reactions).map(([emoji, data]) => (
                <button
                  key={emoji}
                  onClick={() => toggleReaction(comment.id, emoji)}
                  className="inline-flex items-center space-x-1 px-2 py-1 bg-muted/50 hover:bg-muted rounded-full text-xs transition-colors"
                  title={`${data.users.map(u => u.name).join(', ')}`}
                >
                  <span>{emoji}</span>
                  <span>{data.count}</span>
                </button>
              ))}
            </div>
          )}

          {/* Reply Input */}
          {replyingTo === comment.id && (
            <div className="mt-3 space-y-2">
              <div className="flex space-x-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback>
                    {user?.user_metadata?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 flex space-x-2">
                  <Input
                    placeholder="Write a reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        addReply(comment.id);
                      }
                    }}
                    className="text-sm"
                  />
                  <Button
                    size="sm"
                    onClick={() => addReply(comment.id)}
                    disabled={!replyContent.trim()}
                  >
                    <Send className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setReplyingTo(null);
                  setReplyContent('');
                }}
                className="text-xs"
              >
                Cancel
              </Button>
            </div>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 space-y-3">
              {comment.replies.map(reply => renderComment(reply, true))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex space-x-3 animate-pulse">
            <div className="h-8 w-8 bg-muted rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
              <div className="h-12 bg-muted rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add Comment */}
      {user && (
        <div className="flex space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.user_metadata?.avatar_url} />
            <AvatarFallback>
              {user.user_metadata?.name?.charAt(0) || user.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 flex space-x-2">
            <Input
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  addComment();
                }
              }}
            />
            <Button
              onClick={addComment}
              disabled={!newComment.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map(comment => renderComment(comment))}
      </div>

      {comments.length === 0 && !loading && (
        <div className="text-center py-8 text-muted-foreground">
          <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No comments yet. Be the first to comment!</p>

        </div>
      )}


    </div>
  );
};

export default EmojiCommentSystem;