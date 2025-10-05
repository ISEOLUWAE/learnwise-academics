import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageSquare, Loader2, Search, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  online_at: string | null;
  email?: string;
}

export const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchUsers();

    // Subscribe to realtime updates for online status
    const channel = supabase
      .channel('profiles-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchUsers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    // Filter users based on search query
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = users.filter(user => 
      user.username?.toLowerCase().includes(query) ||
      user.full_name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query)
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      // Call edge function to get users with emails (server-side only)
      const { data, error } = await supabase.functions.invoke('get-users-with-emails');
      
      if (error) {
        console.error('Error fetching users from edge function:', error);
        // Fallback to profiles only
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (profilesError) throw profilesError;
        setUsers(profiles || []);
      } else {
        setUsers(data.users || []);
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const isOnline = (onlineAt: string | null) => {
    if (!onlineAt) return false;
    const lastSeen = new Date(onlineAt).getTime();
    const now = Date.now();
    return now - lastSeen < 60000; // Online if seen within last minute
  };

  const handleMessageUser = (user: UserProfile) => {
    setSelectedUser(user);
    setMessageDialogOpen(true);
  };

  const sendMessage = async () => {
    if (!selectedUser || !messageContent.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase
        .from('private_messages')
        .insert({
          sender_id: currentUser?.id,
          recipient_id: selectedUser.id,
          message: messageContent
        });

      if (error) throw error;

      // Log admin action
      await supabase.from('admin_actions').insert({
        admin_id: currentUser?.id,
        action_type: 'send_message',
        target_id: selectedUser.id,
        details: { message: messageContent.substring(0, 100) }
      });

      toast.success('Message sent successfully');
      setMessageContent('');
      setMessageDialogOpen(false);
      setSelectedUser(null);
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>View and manage all registered users</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by username, name, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username || 'N/A'}</TableCell>
                  <TableCell>{user.full_name || 'N/A'}</TableCell>
                  <TableCell>{user.email || 'N/A'}</TableCell>
                  <TableCell>
                    {isOnline(user.online_at) ? (
                      <Badge variant="default" className="bg-green-500">Online</Badge>
                    ) : (
                      <Badge variant="secondary">Offline</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleMessageUser(user)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </CardContent>
      </Card>

      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Message to {selectedUser?.username || selectedUser?.full_name}</DialogTitle>
            <DialogDescription>
              Send a private message to this user
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Type your message here..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                rows={5}
              />
            </div>
            <Button 
              onClick={sendMessage} 
              disabled={sending || !messageContent.trim()} 
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              {sending ? 'Sending...' : 'Send Message'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
