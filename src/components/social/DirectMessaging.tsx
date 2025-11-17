import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Paperclip, X } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface DirectMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  message: string;
  file_url: string | null;
  file_name: string | null;
  read: boolean;
  created_at: string;
  sender_profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface DirectMessagingProps {
  friendId: string;
  friendName: string;
  onClose: () => void;
}

export const DirectMessaging = ({ friendId, friendName, onClose }: DirectMessagingProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user && friendId) {
      fetchMessages();
      setupRealtimeSubscription();
    }
  }, [user, friendId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('direct-messages-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'direct_messages' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newMsg = payload.new as DirectMessage;
            if (
              (newMsg.sender_id === friendId && newMsg.recipient_id === user?.id) ||
              (newMsg.sender_id === user?.id && newMsg.recipient_id === friendId)
            ) {
              fetchMessages();
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchMessages = async () => {
    if (!user) return;

    const { data: messagesData } = await supabase
      .from('direct_messages')
      .select('*')
      .or(
        `and(sender_id.eq.${user.id},recipient_id.eq.${friendId}),and(sender_id.eq.${friendId},recipient_id.eq.${user.id})`
      )
      .order('created_at', { ascending: true });

    if (messagesData) {
      // Fetch sender profiles
      const senderIds = [...new Set(messagesData.map((m) => m.sender_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', senderIds);

      const messagesWithProfiles = messagesData.map((msg) => ({
        ...msg,
        sender_profile: profiles?.find((p) => p.id === msg.sender_id),
      }));

      setMessages(messagesWithProfiles as DirectMessage[]);
      
      // Mark messages as read
      await supabase
        .from('direct_messages')
        .update({ read: true })
        .eq('recipient_id', user.id)
        .eq('sender_id', friendId)
        .eq('read', false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user!.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('community-files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('community-files').getPublicUrl(fileName);
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  };

  const sendMessage = async () => {
    if ((!newMessage.trim() && !file) || !user) return;

    setLoading(true);
    try {
      let fileUrl = null;
      let fileName = null;

      if (file) {
        fileUrl = await uploadFile(file);
        fileName = file.name;
      }

      const { error } = await supabase.from('direct_messages').insert({
        sender_id: user.id,
        recipient_id: friendId,
        message: newMessage.trim() || '📎 File attachment',
        file_url: fileUrl,
        file_name: fileName,
      });

      if (error) throw error;

      setNewMessage('');
      setFile(null);
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-[600px] max-h-[80vh]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{friendName[0]}</AvatarFallback>
          </Avatar>
          <h3 className="font-semibold">{friendName}</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm">
            No messages yet. Start the conversation!
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${
                msg.sender_id === user?.id ? 'flex-row-reverse' : ''
              }`}
            >
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={msg.sender_profile?.avatar_url || undefined} />
                <AvatarFallback className="text-xs">
                  {msg.sender_profile?.full_name?.[0] || '?'}
                </AvatarFallback>
              </Avatar>
              <div
                className={`flex flex-col max-w-[70%] ${
                  msg.sender_id === user?.id ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`rounded-lg px-4 py-2 ${
                    msg.sender_id === user?.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm break-words">{msg.message}</p>
                  {msg.file_url && (
                    <a
                      href={msg.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs underline mt-1 block"
                    >
                      {msg.file_name || 'View file'}
                    </a>
                  )}
                </div>
                <span className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        {file && (
          <div className="mb-2 flex items-center gap-2 text-sm bg-muted p-2 rounded">
            <Paperclip className="h-4 w-4" />
            <span className="flex-1 truncate">{file.name}</span>
            <Button variant="ghost" size="sm" onClick={() => setFile(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            disabled={loading}
            className="text-sm"
          />
          <Button onClick={sendMessage} disabled={loading} size="sm">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
