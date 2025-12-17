import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Vote, Plus, Loader2, Trophy, CheckCircle, XCircle, Play, Square, RotateCcw } from 'lucide-react';

interface VoteSession {
  id: string;
  title: string;
  is_active: boolean;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
}

interface Candidate {
  id: string;
  user_id: string;
  manifesto: string | null;
  vote_count: number;
  profiles?: {
    full_name: string;
    username: string;
  };
}

interface DepartmentVotingProps {
  spaceId: string;
  isDeptAdmin: boolean;
  isClassRep?: boolean;
}

export const DepartmentVoting = ({ spaceId, isDeptAdmin, isClassRep }: DepartmentVotingProps) => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [voteSessions, setVoteSessions] = useState<VoteSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<VoteSession | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [manifesto, setManifesto] = useState('');
  const [registering, setRegistering] = useState(false);
  const [voting, setVoting] = useState(false);
  const [restarting, setRestarting] = useState(false);

  useEffect(() => {
    fetchVoteSessions();
  }, [spaceId]);

  useEffect(() => {
    if (selectedSession) {
      fetchCandidates(selectedSession.id);
      checkIfVoted(selectedSession.id);
    }
  }, [selectedSession]);

  const fetchVoteSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('department_votes')
        .select('*')
        .eq('department_space_id', spaceId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVoteSessions(data || []);
      if (data && data.length > 0) {
        setSelectedSession(data[0]);
      }
    } catch (error) {
      console.error('Error fetching vote sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidates = async (voteId: string) => {
    try {
      const { data, error } = await supabase
        .from('vote_candidates')
        .select('*')
        .eq('vote_id', voteId)
        .order('vote_count', { ascending: false });

      if (error) throw error;

      // Fetch profile info for each candidate
      const candidatesWithProfiles = await Promise.all(
        (data || []).map(async (candidate) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, username')
            .eq('id', candidate.user_id)
            .single();
          return { ...candidate, profiles: profile };
        })
      );

      setCandidates(candidatesWithProfiles);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    }
  };

  const checkIfVoted = async (voteId: string) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_votes')
        .select('id')
        .eq('vote_id', voteId)
        .eq('user_id', user.id)
        .single();

      setHasVoted(!!data);
    } catch (error) {
      setHasVoted(false);
    }
  };

  const createVoteSession = async () => {
    try {
      const { error } = await supabase
        .from('department_votes')
        .insert({
          department_space_id: spaceId,
          title: 'Class Representative Election',
          is_active: false,
          created_by: user?.id,
        });

      if (error) throw error;
      toast({ title: 'Vote session created!' });
      fetchVoteSessions();
    } catch (error) {
      console.error('Error creating vote session:', error);
      toast({ title: 'Failed to create vote session', variant: 'destructive' });
    }
  };

  const toggleVoting = async (sessionId: string, activate: boolean) => {
    try {
      const updateData: any = { is_active: activate };
      if (activate) {
        updateData.started_at = new Date().toISOString();
        updateData.ended_at = null;
      } else {
        updateData.ended_at = new Date().toISOString();
        
        // When closing voting, promote the winner to class_rep
        if (candidates.length > 0 && candidates[0].vote_count > 0) {
          const winner = candidates[0];
          
          // Call edge function to promote winner
          const response = await fetch(
            `https://cgfiwjbegervslftrvaz.supabase.co/functions/v1/department-space`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${session?.access_token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                action: 'promote_class_rep',
                voteId: sessionId,
                winnerId: winner.user_id,
                spaceId
              }),
            }
          );
          
          if (response.ok) {
            toast({ 
              title: `${winner.profiles?.full_name || winner.profiles?.username || 'Winner'} is now Class Representative!` 
            });
          }
        }
      }

      const { error } = await supabase
        .from('department_votes')
        .update(updateData)
        .eq('id', sessionId);

      if (error) throw error;
      toast({ title: activate ? 'Voting opened!' : 'Voting closed!' });
      fetchVoteSessions();
    } catch (error) {
      console.error('Error toggling voting:', error);
      toast({ title: 'Failed to update voting status', variant: 'destructive' });
    }
  };

  const restartVoting = async (sessionId: string) => {
    setRestarting(true);
    try {
      const response = await fetch(
        `https://cgfiwjbegervslftrvaz.supabase.co/functions/v1/department-space`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'restart_voting',
            spaceId,
            voteId: sessionId
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        toast({ title: 'Voting has been reset!' });
        fetchVoteSessions();
        fetchCandidates(sessionId);
        setHasVoted(false);
      } else {
        toast({ title: data.error || 'Failed to restart voting', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error restarting voting:', error);
      toast({ title: 'Failed to restart voting', variant: 'destructive' });
    } finally {
      setRestarting(false);
    }
  };

  const registerAsCandidate = async () => {
    if (!selectedSession || !user) return;
    
    setRegistering(true);
    try {
      const { error } = await supabase
        .from('vote_candidates')
        .insert({
          vote_id: selectedSession.id,
          user_id: user.id,
          manifesto: manifesto || null,
        });

      if (error) throw error;
      toast({ title: 'You are now a candidate!' });
      setShowRegisterModal(false);
      setManifesto('');
      fetchCandidates(selectedSession.id);
    } catch (error: any) {
      console.error('Error registering:', error);
      if (error.code === '23505') {
        toast({ title: 'You are already registered as a candidate', variant: 'destructive' });
      } else {
        toast({ title: 'Failed to register', variant: 'destructive' });
      }
    } finally {
      setRegistering(false);
    }
  };

  const castVote = async (candidateId: string) => {
    if (!selectedSession || !user || hasVoted) return;
    
    setVoting(true);
    try {
      // Record that user has voted (anonymous)
      const { error: voteError } = await supabase
        .from('user_votes')
        .insert({
          vote_id: selectedSession.id,
          user_id: user.id,
        });

      if (voteError) throw voteError;

      // Increment candidate's vote count
      const candidate = candidates.find(c => c.id === candidateId);
      if (candidate) {
        const { error: updateError } = await supabase
          .from('vote_candidates')
          .update({ vote_count: candidate.vote_count + 1 })
          .eq('id', candidateId);

        if (updateError) throw updateError;
      }

      toast({ title: 'Vote cast successfully!' });
      setHasVoted(true);
      fetchCandidates(selectedSession.id);
    } catch (error: any) {
      console.error('Error casting vote:', error);
      if (error.code === '23505') {
        toast({ title: 'You have already voted', variant: 'destructive' });
        setHasVoted(true);
      } else {
        toast({ title: 'Failed to cast vote', variant: 'destructive' });
      }
    } finally {
      setVoting(false);
    }
  };

  const totalVotes = candidates.reduce((sum, c) => sum + c.vote_count, 0);
  const isCandidate = candidates.some(c => c.user_id === user?.id);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      {(isDeptAdmin || isClassRep) && (
        <div className="flex justify-end gap-2">
          <Button onClick={createVoteSession}>
            <Plus className="h-4 w-4 mr-2" />
            New Election
          </Button>
        </div>
      )}

      {voteSessions.length === 0 ? (
        <Card className="bg-bg-secondary/50 border-white/10 w-full overflow-hidden">
          <CardContent className="py-12 text-center">
            <Vote className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No elections scheduled</p>
          </CardContent>
        </Card>
      ) : selectedSession && (
        <Card className="bg-bg-secondary/50 border-white/10">
          <CardHeader>
            <div className="space-y-4">
              {/* Title and status */}
              <div>
                <CardTitle className="flex items-center gap-2 mb-2">
                  <Trophy className="h-5 w-5 text-amber-400 flex-shrink-0" />
                  <span className="break-words">{selectedSession.title}</span>
                </CardTitle>
                <CardDescription>
                  {selectedSession.is_active ? (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Voting Open
                    </Badge>
                  ) : selectedSession.ended_at ? (
                    <Badge variant="outline">
                      <XCircle className="h-3 w-3 mr-1" />
                      Voting Closed
                    </Badge>
                  ) : (
                    <Badge variant="outline">Not Started</Badge>
                  )}
                </CardDescription>
              </div>

              {/* Admin controls - responsive grid */}
              {(isDeptAdmin || isClassRep) && (
                <div className="flex flex-wrap gap-2">
                  {selectedSession.ended_at && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => restartVoting(selectedSession.id)}
                      disabled={restarting}
                    >
                      {restarting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Restart Voting
                        </>
                      )}
                    </Button>
                  )}
                  <Button
                    variant={selectedSession.is_active ? 'destructive' : 'default'}
                    size="sm"
                    onClick={() => toggleVoting(selectedSession.id, !selectedSession.is_active)}
                  >
                    {selectedSession.is_active ? (
                      <>
                        <Square className="h-4 w-4 mr-1" />
                        Close Voting
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-1" />
                        Open Voting
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {/* Candidates */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Candidates ({candidates.length})</h4>
                {!isCandidate && !selectedSession.ended_at && (
                  <Dialog open={showRegisterModal} onOpenChange={setShowRegisterModal}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Register as Candidate
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Register as Candidate</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-1 block">
                            Your Manifesto (optional)
                          </label>
                          <Textarea
                            placeholder="Tell your classmates why they should vote for you..."
                            value={manifesto}
                            onChange={(e) => setManifesto(e.target.value)}
                            rows={4}
                          />
                        </div>
                        <Button onClick={registerAsCandidate} disabled={registering} className="w-full">
                          {registering ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Registering...
                            </>
                          ) : (
                            'Register'
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              {candidates.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No candidates registered yet
                </p>
              ) : (
                <div className="space-y-3">
                  {candidates.map((candidate, index) => (
                    <div
                      key={candidate.id}
                      className={`p-4 rounded-lg bg-white/5 ${
                        index === 0 && totalVotes > 0 ? 'border border-amber-500/30' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {index === 0 && totalVotes > 0 && (
                            <Trophy className="h-4 w-4 text-amber-400" />
                          )}
                          <span className="font-medium truncate">
                            @{candidate.profiles?.username || candidate.profiles?.full_name || 'Unknown'}
                          </span>
                          {candidate.user_id === user?.id && (
                            <Badge variant="outline" className="text-xs">You</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {candidate.vote_count} vote{candidate.vote_count !== 1 ? 's' : ''}
                          </span>
                          {selectedSession.is_active && !hasVoted && candidate.user_id !== user?.id && (
                            <Button
                              size="sm"
                              onClick={() => castVote(candidate.id)}
                              disabled={voting}                              className="flex-shrink-0"                            >
                              {voting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                'Vote'
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                      {totalVotes > 0 && (
                        <Progress 
                          value={(candidate.vote_count / totalVotes) * 100} 
                          className="h-2"
                        />
                      )}
                      {candidate.manifesto && (
                        <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground mt-2">
                          "{candidate.manifesto}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {hasVoted && (
                <p className="text-sm text-center text-green-400 flex items-center justify-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  You have voted in this election
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};