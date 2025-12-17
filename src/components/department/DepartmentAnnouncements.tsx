import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Megaphone, Plus, AlertTriangle, Phone, Loader2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface Announcement {
  id: string;
  title: string;
  content: string;
  is_urgent: boolean;
  created_at: string;
  created_by: string;
}

interface DepartmentAnnouncementsProps {
  spaceId: string;
  canManage: boolean;
}

export const DepartmentAnnouncements = ({ spaceId, canManage }: DepartmentAnnouncementsProps) => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [triggerCalls, setTriggerCalls] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchAnnouncements();

    const channel = supabase
      .channel('announcements-' + spaceId)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'department_announcements',
        filter: `department_space_id=eq.${spaceId}`
      }, () => {
        fetchAnnouncements();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [spaceId]);

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('department_announcements')
        .select('*')
        .eq('department_space_id', spaceId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) {
      toast({ title: 'Please fill in all fields', variant: 'destructive' });
      return;
    }

    setCreating(true);

    try {
      const { error } = await supabase
        .from('department_announcements')
        .insert({
          department_space_id: spaceId,
          title: title.trim(),
          content: content.trim(),
          is_urgent: isUrgent,
          created_by: session?.user?.id,
        });

      if (error) throw error;

      // Trigger urgent calls if selected
      if (isUrgent && triggerCalls && session) {
        try {
          await fetch(
            'https://cgfiwjbegervslftrvaz.supabase.co/functions/v1/trigger-urgent-call',
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                departmentSpaceId: spaceId,
                message: `${title}: ${content}`,
              }),
            }
          );
          toast({ title: 'Urgent calls triggered!' });
        } catch (callError) {
          console.error('Failed to trigger calls:', callError);
          toast({ 
            title: 'Announcement posted but calls failed', 
            description: 'The announcement was saved but we could not trigger phone calls.',
            variant: 'destructive' 
          });
        }
      }

      toast({ title: 'Announcement posted!' });
      setShowCreateModal(false);
      setTitle('');
      setContent('');
      setIsUrgent(false);
      setTriggerCalls(false);
    } catch (error) {
      console.error('Error creating announcement:', error);
      toast({ title: 'Failed to post announcement', variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('department_announcements')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Announcement deleted' });
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast({ title: 'Failed to delete', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      {canManage && (
        <div className="flex justify-end">
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Announcement</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Input
                    placeholder="Announcement title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="Announcement content..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="flex flex-col gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isUrgent}
                      onChange={(e) => setIsUrgent(e.target.checked)}
                      className="rounded"
                    />
                    <span className="flex items-center gap-1 text-sm">
                      <AlertTriangle className="h-4 w-4 text-amber-400" />
                      Mark as urgent
                    </span>
                  </label>
                </div>
                {isUrgent && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={triggerCalls}
                        onChange={(e) => setTriggerCalls(e.target.checked)}
                        className="rounded"
                      />
                      <span className="flex items-center gap-1 text-sm">
                        <Phone className="h-4 w-4 text-green-400" />
                        Trigger urgent phone calls to all members
                      </span>
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      This will call all members with registered phone numbers
                    </p>
                  </div>
                )}
                <Button onClick={handleCreate} disabled={creating} className="w-full">
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    'Post Announcement'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {announcements.length === 0 ? (
        <Card className="bg-bg-secondary/50 border-white/10">
          <CardContent className="py-12 text-center">
            <Megaphone className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No announcements yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card 
              key={announcement.id} 
              className={`bg-bg-secondary/50 border-white/10 w-full overflow-hidden break-words ${
                announcement.is_urgent ? 'border-l-4 border-l-amber-500' : ''
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <CardTitle className="text-lg truncate max-w-[calc(100%-120px)]">{announcement.title}</CardTitle>
                    {announcement.is_urgent && (
                      <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Urgent
                      </Badge>
                    )}
                  </div>
                  {canManage && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(announcement.id)}
                      className="text-muted-foreground hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(announcement.created_at), 'PPp')}
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap break-words">{announcement.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};