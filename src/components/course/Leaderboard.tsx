import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, Award, Trash2, Crown, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminRole } from "@/hooks/useAdminRole";
import { toast } from "sonner";

interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  avatar: string;
  user_id: string;
}

interface LeaderboardProps {
  courseId: string;
}

const Leaderboard = ({ courseId }: LeaderboardProps) => {
  const { user } = useAuth();
  const { isAdmin } = useAdminRole();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
    
    // Real-time subscription
    const channel = supabase
      .channel(`leaderboard-${courseId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'leaderboard',
        filter: `course_id=eq.${courseId}`
      }, () => fetchLeaderboard())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [courseId]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .eq('course_id', courseId)
        .order('score', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching leaderboard:', error);
        return;
      }
      setLeaderboard(data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetLeaderboard = async () => {
    if (!confirm('Are you sure you want to reset this leaderboard? This will delete all scores for this course.')) return;

    setResetting(true);
    try {
      const { error } = await supabase
        .from('leaderboard')
        .delete()
        .eq('course_id', courseId);

      if (error) throw error;

      if (user) {
        await supabase.from('admin_actions').insert({
          admin_id: user.id,
          action_type: 'reset_leaderboard',
          target_id: courseId,
          details: { course_id: courseId }
        });
      }

      setLeaderboard([]);
      toast.success('Leaderboard reset successfully');
    } catch (error) {
      console.error('Error resetting leaderboard:', error);
      toast.error('Failed to reset leaderboard');
    } finally {
      setResetting(false);
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Crown className="h-6 w-6 text-yellow-400" />;
      case 1: return <Medal className="h-5 w-5 text-gray-300" />;
      case 2: return <Award className="h-5 w-5 text-amber-600" />;
      default: return <span className="text-sm font-bold text-muted-foreground">#{index + 1}</span>;
    }
  };

  const getRankStyle = (index: number) => {
    switch (index) {
      case 0: return "bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/40 shadow-lg shadow-yellow-500/10";
      case 1: return "bg-gradient-to-r from-gray-400/15 to-gray-500/15 border-gray-400/30";
      case 2: return "bg-gradient-to-r from-amber-600/15 to-orange-500/15 border-amber-500/30";
      default: return "bg-bg-primary/30 border-white/10";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    if (score >= 40) return "text-orange-400";
    return "text-red-400";
  };

  const currentUserRank = user ? leaderboard.findIndex(e => e.user_id === user.id) : -1;

  if (loading) {
    return (
      <Card className="bg-bg-secondary/50 backdrop-blur border-white/10">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading leaderboard...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-4"
    >
      {/* Current user rank card */}
      {currentUserRank >= 0 && (
        <Card className="bg-gradient-to-r from-primary/20 to-primary/10 border-primary/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Your Rank</p>
                <p className="text-xs text-muted-foreground">Best score recorded</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">#{currentUserRank + 1}</p>
              <p className="text-sm text-muted-foreground">{leaderboard[currentUserRank]?.score}%</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-bg-secondary/50 backdrop-blur border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Top 20 Leaderboard
            </span>
            {isAdmin && leaderboard.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={resetLeaderboard}
                disabled={resetting}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                {resetting ? 'Resetting...' : 'Reset'}
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {leaderboard.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No quiz scores yet. Be the first to take the quiz!
              </p>
            ) : (
              leaderboard.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all overflow-hidden ${getRankStyle(index)} ${
                    user && entry.user_id === user.id ? 'ring-2 ring-primary/50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex items-center justify-center w-8 h-8 shrink-0">
                      {getRankIcon(index)}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold shrink-0">
                      {entry.avatar}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-sm truncate">
                        {entry.name}
                        {user && entry.user_id === user.id && (
                          <span className="text-xs text-primary ml-2">(You)</span>
                        )}
                      </h4>
                      <p className="text-xs text-muted-foreground">Rank #{index + 1}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className={`font-bold text-lg ${getScoreColor(entry.score)}`}>{entry.score}%</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Leaderboard;
