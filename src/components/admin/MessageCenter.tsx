import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Send, MessageSquare } from 'lucide-react';

export const MessageCenter = () => {
  const { user } = useAuth();
  const [recipientEmail, setRecipientEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const sendMessage = async () => {
    if (!recipientEmail.trim() || !message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setSending(true);
    try {
      // Find recipient by email
      const { data: { users } } = await supabase.auth.admin.listUsers();
      const recipient = users?.find((u: any) => u.email === recipientEmail);

      if (!recipient) {
        toast.error('Recipient not found');
        return;
      }

      // Send message
      const { error } = await supabase
        .from('private_messages')
        .insert({
          sender_id: user?.id,
          recipient_id: recipient.id,
          message: message
        });

      if (error) throw error;

      // Log action
      await supabase.from('admin_actions').insert({
        admin_id: user?.id,
        action_type: 'send_message',
        target_id: recipient.id,
        details: { message: message.substring(0, 100) }
      });

      toast.success('Message sent successfully');
      setMessage('');
      setRecipientEmail('');
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Message Center
        </CardTitle>
        <CardDescription>Send private messages to users</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="recipientEmail">Recipient Email</Label>
          <Input
            id="recipientEmail"
            type="email"
            placeholder="user@example.com"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            placeholder="Type your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
          />
        </div>

        <Button onClick={sendMessage} disabled={sending} className="w-full">
          <Send className="h-4 w-4 mr-2" />
          {sending ? 'Sending...' : 'Send Message'}
        </Button>
      </CardContent>
    </Card>
  );
};
