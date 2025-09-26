import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Users, MessageCircle, Send, Heart, Reply } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface CommunityPost {
  id: string;
  user_name: string;
  user_avatar: string;
  content: string;
  created_at: string;
  likes: number;
}

interface CommunityProps {
  courseId: string;
  courseTitle: string;
}

const Community = ({ courseId, courseTitle }: CommunityProps) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For now, we'll use mock data since we haven't created the community posts table yet
    setLoading(false);
    setPosts([
      {
        id: "1",
        user_name: "Sarah Johnson",
        user_avatar: "SJ",
        content: "Does anyone have notes for chapter 3? I missed the lecture and need to catch up.",
        created_at: new Date().toISOString(),
        likes: 5
      },
      {
        id: "2",
        user_name: "Mike Chen",
        user_avatar: "MC",
        content: "Just finished the quiz! The trigonometry questions were challenging but fair. Good luck everyone!",
        created_at: new Date(Date.now() - 3600000).toISOString(),
        likes: 8
      },
      {
        id: "3",
        user_name: "Emily Davis",
        user_avatar: "ED",
        content: "Study group forming for the upcoming exam. We'll meet in the library every Tuesday and Thursday at 3 PM. DM me if interested!",
        created_at: new Date(Date.now() - 7200000).toISOString(),
        likes: 12
      }
    ]);
  }, [courseId]);

  const handlePostSubmit = () => {
    if (!newPost.trim() || !user) return;

    const post: CommunityPost = {
      id: Date.now().toString(),
      user_name: user.email?.split('@')[0] || 'Anonymous',
      user_avatar: user.email?.charAt(0).toUpperCase() || 'A',
      content: newPost,
      created_at: new Date().toISOString(),
      likes: 0
    };

    setPosts([post, ...posts]);
    setNewPost("");
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
              <div className="flex justify-end">
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
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(post.created_at)}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed mb-3">{post.content}</p>
                    <div className="flex items-center gap-4">
                      <Button variant="ghost" size="sm" className="h-8 px-2">
                        <Heart className="h-4 w-4 mr-1" />
                        {post.likes}
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 px-2">
                        <Reply className="h-4 w-4 mr-1" />
                        Reply
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Community;