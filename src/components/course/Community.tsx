import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Users, MessageCircle, Send, Heart, Reply, Paperclip, FileText, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useAdminRole } from "@/hooks/useAdminRole";

interface CommunityPost {
  id: string;
  user_name: string;
  user_avatar: string;
  content: string;
  created_at: string;
  likes: number;
  parent_id?: string;
  file_url?: string;
  file_name?: string;
  user_id: string;
  replies?: CommunityPost[];
  user_liked?: boolean;
  is_admin_reply?: boolean;
}

interface CommunityProps {
  courseId: string;
  courseTitle: string;
}

const Community = ({ courseId, courseTitle }: CommunityProps) => {
  const { user } = useAuth();
  const { isAdmin } = useAdminRole();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchCommunityPosts();
  }, [courseId]);

  const fetchCommunityPosts = async () => {
    try {
      setLoading(true);
      
      // Fetch posts and their replies
      const { data: postsData, error } = await supabase
        .from('community_posts')
        .select('*')
        .eq('course_id', courseId)
        .is('parent_id', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
        return;
      }

      // Fetch replies for each post
      const postsWithReplies = await Promise.all(
        (postsData || []).map(async (post) => {
          const { data: replies } = await supabase
            .from('community_posts')
            .select('*')
            .eq('parent_id', post.id)
            .order('created_at', { ascending: true });

          // Check if current user liked this post
          let userLiked = false;
          if (user) {
            const { data: likeData } = await supabase
              .from('community_likes')
              .select('id')
              .eq('post_id', post.id)
              .eq('user_id', user.id)
              .single();
            userLiked = !!likeData;
          }

          return {
            ...post,
            user_avatar: post.user_avatar || post.user_name?.charAt(0).toUpperCase() || 'A',
            replies: replies || [],
            user_liked: userLiked
          };
        })
      );

      setPosts(postsWithReplies);
    } catch (error) {
      console.error('Error fetching community posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostSubmit = async () => {
    if (!newPost.trim() || !user) return;

    try {
      let fileUrl = null;
      let fileName = null;

      // Upload file if selected (you'll need to implement file upload to Supabase Storage)
      if (selectedFile) {
        // For now, just store the file name - implement actual upload later
        fileName = selectedFile.name;
      }

      const { data, error } = await supabase
        .from('community_posts')
        .insert({
          course_id: courseId,
          user_id: user.id,
          user_name: user.email?.split('@')[0] || 'Anonymous',
          user_avatar: user.email?.charAt(0).toUpperCase() || 'A',
          content: newPost,
          file_url: fileUrl,
          file_name: fileName
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating post:', error);
        return;
      }

      // Add the new post to the beginning of the list
      setPosts([{ ...data, replies: [], user_liked: false }, ...posts]);
      setNewPost("");
      setSelectedFile(null);
    } catch (error) {
      console.error('Error submitting post:', error);
    }
  };

  const handleReplySubmit = async (parentId: string) => {
    if (!replyContent.trim() || !user) return;

    try {
      const { data, error } = await supabase
        .from('community_posts')
        .insert({
          course_id: courseId,
          user_id: user.id,
          user_name: user.email?.split('@')[0] || 'Anonymous',
          user_avatar: user.email?.charAt(0).toUpperCase() || 'A',
          content: replyContent,
          parent_id: parentId,
          is_admin_reply: isAdmin
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating reply:', error);
        return;
      }

      // Add reply to the specific post
      setPosts(posts.map(post => 
        post.id === parentId 
          ? { ...post, replies: [...(post.replies || []), data] }
          : post
      ));
      
      setReplyContent("");
      setReplyingTo(null);
    } catch (error) {
      console.error('Error submitting reply:', error);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return;

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.user_liked) {
        // Unlike
        await supabase
          .from('community_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        // Like
        await supabase
          .from('community_likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });
      }

      // Update the post in state
      setPosts(posts.map(p => 
        p.id === postId 
          ? { 
              ...p, 
              likes: post.user_liked ? p.likes - 1 : p.likes + 1,
              user_liked: !post.user_liked 
            }
          : p
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffMs = now.getTime() - postTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  if (loading) {
    return (
      <Card className="bg-bg-secondary/50 backdrop-blur border-white/10">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading community...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      <Card className="bg-bg-secondary/50 backdrop-blur border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {courseTitle} Community
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {user && (
            <div className="space-y-3">
              <Textarea
                placeholder="Share something with your classmates..."
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <Paperclip className="h-4 w-4 mr-2" />
                    Attach File
                  </Button>
                  {selectedFile && (
                    <span className="text-sm text-muted-foreground">
                      {selectedFile.name}
                    </span>
                  )}
                </div>
                <Button onClick={handlePostSubmit} disabled={!newPost.trim()}>
                  <Send className="h-4 w-4 mr-2" />
                  Post
                </Button>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="p-4 rounded-lg bg-bg-primary/30 border border-white/5"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-blue/20 flex items-center justify-center text-sm font-semibold">
                    {post.user_avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-sm">{post.user_name}</h4>
                      {post.is_admin_reply && (
                        <Badge variant="default" className="text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(post.created_at)}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed mb-3">{post.content}</p>
                    
                    {post.file_name && (
                      <div className="flex items-center gap-2 mb-3 p-2 bg-bg-secondary/30 rounded-lg">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">{post.file_name}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`h-8 px-2 ${post.user_liked ? 'text-red-400' : ''}`}
                        onClick={() => handleLike(post.id)}
                      >
                        <Heart className={`h-4 w-4 mr-1 ${post.user_liked ? 'fill-current' : ''}`} />
                        {post.likes}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-2"
                        onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)}
                      >
                        <Reply className="h-4 w-4 mr-1" />
                        Reply ({post.replies?.length || 0})
                      </Button>
                    </div>

                    {/* Reply form */}
                    {replyingTo === post.id && user && (
                      <div className="mt-3 space-y-2">
                        <Textarea
                          placeholder="Write a reply..."
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          className="min-h-[80px]"
                        />
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setReplyingTo(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleReplySubmit(post.id)}
                            disabled={!replyContent.trim()}
                          >
                            Reply
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Replies */}
                    {post.replies && post.replies.length > 0 && (
                      <div className="mt-4 space-y-3 pl-4 border-l-2 border-brand-blue/30">
                        {post.replies.map((reply) => (
                          <div key={reply.id} className="flex items-start gap-2">
                            <div className="w-6 h-6 rounded-full bg-brand-blue/20 flex items-center justify-center text-xs font-semibold">
                              {reply.user_avatar}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-xs">{reply.user_name}</span>
                                {reply.is_admin_reply && (
                                  <Badge variant="default" className="text-xs">
                                    <Shield className="h-3 w-3 mr-1" />
                                    Admin
                                  </Badge>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {formatTimeAgo(reply.created_at)}
                                </span>
                              </div>
                              <p className="text-sm">{reply.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {posts.length === 0 && (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No discussions yet. Be the first to start a conversation!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Community;