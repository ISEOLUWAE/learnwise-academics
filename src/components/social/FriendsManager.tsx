import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserPlus, UserMinus, Check, X, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  username: string | null;
}

interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  friend_profile?: Profile;
}

interface FriendsManagerProps {
  onOpenChat?: (friendId: string, friendName: string) => void;
}

export const FriendsManager = ({ onOpenChat }: FriendsManagerProps) => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friendship[]>([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchFriends();
      setupRealtimeSubscription();
    }
  }, [user]);

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('friendships-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'friendships' }, () => {
        fetchFriends();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchFriends = async () => {
    if (!user) return;

    // Get accepted friends
    const { data: acceptedFriends } = await supabase
      .from('friendships')
      .select('*')
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
      .eq('status', 'accepted');

    // Get pending requests (received)
    const { data: pending } = await supabase
      .from('friendships')
      .select('*')
      .eq('friend_id', user.id)
      .eq('status', 'pending');

    // Fetch profiles for friends
    if (acceptedFriends) {
      const friendIds = acceptedFriends.map((f) =>
        f.user_id === user.id ? f.friend_id : f.user_id
      );
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', friendIds);

      const friendsWithProfiles = acceptedFriends.map((f) => ({
        ...f,
        status: f.status as 'accepted' | 'pending' | 'rejected',
        friend_profile: profiles?.find(
          (p) => p.id === (f.user_id === user.id ? f.friend_id : f.user_id)
        ),
      }));
      setFriends(friendsWithProfiles);
    }

    // Fetch profiles for pending requests
    if (pending) {
      const senderIds = pending.map((p) => p.user_id);
      const { data: senderProfiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', senderIds);

      const pendingWithProfiles = pending.map((p) => ({
        ...p,
        status: p.status as 'accepted' | 'pending' | 'rejected',
        friend_profile: senderProfiles?.find((sp) => sp.id === p.user_id),
      }));
      setPendingRequests(pendingWithProfiles);
    }
  };

  const searchUsers = async () => {
    if (!searchEmail.trim() || !user) return;

    setLoading(true);
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .or(`full_name.ilike.%${searchEmail}%,username.ilike.%${searchEmail}%`);

      setSearchResults(profiles || []);
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (friendId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('friendships').insert({
        user_id: user.id,
        friend_id: friendId,
        status: 'pending',
      });

      if (error) throw error;
      toast.success('Friend request sent!');
      setSearchResults([]);
      setSearchEmail('');
    } catch (error: any) {
      if (error.message.includes('duplicate')) {
        toast.error('Friend request already sent');
      } else {
        toast.error('Failed to send friend request');
      }
    }
  };

  const acceptRequest = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', friendshipId);

      if (error) throw error;
      toast.success('Friend request accepted!');
      fetchFriends();
    } catch (error) {
      toast.error('Failed to accept request');
    }
  };

  const rejectRequest = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;
      toast.success('Friend request rejected');
      fetchFriends();
    } catch (error) {
      toast.error('Failed to reject request');
    }
  };

  const removeFriend = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;
      toast.success('Friend removed');
      fetchFriends();
    } catch (error) {
      toast.error('Failed to remove friend');
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Users */}
      <Card className="p-4 sm:p-6">
        <h3 className="text-lg font-semibold mb-4">Add Friends</h3>
        <div className="flex gap-2">
          <Input
            placeholder="Search by name or username..."
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
            className="text-sm"
          />
          <Button onClick={searchUsers} disabled={loading} size="sm">
            Search
          </Button>
        </div>

        {searchResults.length > 0 && (
          <div className="mt-4 space-y-2">
            {searchResults.map((profile) => (
              <div
                key={profile.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">
                      {profile.full_name?.[0] || profile.username?.[0] || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {profile.full_name || profile.username || 'Unknown User'}
                  </span>
                </div>
                <Button
                  size="sm"
                  onClick={() => sendFriendRequest(profile.id)}
                  className="gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  Add
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card className="p-4 sm:p-6">
          <h3 className="text-lg font-semibold mb-4">Friend Requests</h3>
          <div className="space-y-3">
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={request.friend_profile?.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">
                      {request.friend_profile?.full_name?.[0] || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {request.friend_profile?.full_name || 'Unknown User'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => acceptRequest(request.id)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => rejectRequest(request.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Friends List */}
      <Card className="p-4 sm:p-6">
        <h3 className="text-lg font-semibold mb-4">My Friends</h3>
        {friends.length === 0 ? (
          <p className="text-sm text-muted-foreground">No friends yet. Start adding friends!</p>
        ) : (
          <div className="space-y-3">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={friend.friend_profile?.avatar_url || undefined} />
                    <AvatarFallback>
                      {friend.friend_profile?.full_name?.[0] || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">
                    {friend.friend_profile?.full_name || 'Unknown User'}
                  </span>
                </div>
                <div className="flex gap-2">
                  {onOpenChat && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        onOpenChat(
                          friend.user_id === user?.id ? friend.friend_id : friend.user_id,
                          friend.friend_profile?.full_name || 'Friend'
                        )
                      }
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removeFriend(friend.id)}
                  >
                    <UserMinus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
