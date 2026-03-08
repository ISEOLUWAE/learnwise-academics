import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, Award, Trash2 } from "lucide-react";
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
  }, [courseId]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .eq('course_id', courseId)
        .order('score', { ascending: false })
        .limit(10);

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

      // Log admin action
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
      case 0: return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 1: return <Medal className="h-5 w-5 text-gray-400" />;
      case 2: return <Award className="h-5 w-5 text-orange-500" />;
      default: return <span className="text-sm font-bold">#{index + 1}</span>;
    }
  };

  const getRankStyle = (index: number) => {
    switch (index) {
      case 0: return "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30";
      case 1: return "bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/30";
      case 2: return "bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/30";
      default: return "bg-bg-primary/50 border-white/10";
    }
  };

  if (loading) {
    return (
      <Card className="bg-bg-secondary/50 backdrop-blur border-white/10">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue mx-auto mb-4"></div>
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
    >
      <Card className="bg-bg-secondary/50 backdrop-blur border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Top 10 Leaderboard
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
          <div className="space-y-3">
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
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className={`flex items-center justify-between p-4 rounded-lg border ${getRankStyle(index)}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8">
                      {getRankIcon(index)}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-brand-blue/20 flex items-center justify-center text-sm font-semibold">
                      {entry.avatar}
                    </div>
                    <div>
                      <h4 className="font-semibold">{entry.name}</h4>
                      <p className="text-sm text-muted-foreground">Rank #{index + 1}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-brand-blue text-lg">{entry.score}%</p>
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
