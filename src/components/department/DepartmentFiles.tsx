import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { FileText, Upload, Loader2, Trash2, Bot, MessageSquare, Send, X } from 'lucide-react';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DepartmentFile {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_name: string;
  file_type: string;
  uploaded_by: string;
  created_at: string;
  uploader?: { username: string | null; full_name: string | null };
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface DepartmentFilesProps {
  spaceId: string;
  canManage: boolean;
}

export const DepartmentFiles = ({ spaceId, canManage }: DepartmentFilesProps) => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [files, setFiles] = useState<DepartmentFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // AI Chat state
  const [showAIChat, setShowAIChat] = useState(false);
  const [currentFile, setCurrentFile] = useState<DepartmentFile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchFiles();
  }, [spaceId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('department_files')
        .select('*')
        .eq('department_space_id', spaceId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch uploader info
      const filesWithUploaders = await Promise.all(
        (data || []).map(async (file) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, full_name')
            .eq('id', file.uploaded_by)
            .single();
          return { ...file, uploader: profile };
        })
      );

      setFiles(filesWithUploaders);
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !title.trim() || !user) return;
    
    setUploading(true);
    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${spaceId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('department-files')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('department-files')
        .getPublicUrl(fileName);

      const { error: insertError } = await supabase
        .from('department_files')
        .insert({
          department_space_id: spaceId,
          title: title.trim(),
          description: description.trim() || null,
          file_url: publicUrl,
          file_name: selectedFile.name,
          file_type: selectedFile.type,
          uploaded_by: user.id,
        });

      if (insertError) throw insertError;

      toast({ title: 'File uploaded successfully!' });
      setShowUploadModal(false);
      setTitle('');
      setDescription('');
      setSelectedFile(null);
      fetchFiles();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({ title: 'Failed to upload file', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId: string, fileUrl: string) => {
    try {
      const path = fileUrl.split('/department-files/')[1];
      if (path) {
        await supabase.storage.from('department-files').remove([path]);
      }
      
      const { error } = await supabase
        .from('department_files')
        .delete()
        .eq('id', fileId);

      if (error) throw error;
      toast({ title: 'File deleted' });
      fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({ title: 'Failed to delete file', variant: 'destructive' });
    }
  };

  const openAIChat = (file: DepartmentFile) => {
    setCurrentFile(file);
    setMessages([{
      role: 'assistant',
      content: `I'm ready to help you with "${file.title}". You can ask me to:\n\n• Summarize the content\n• Explain specific concepts\n• Create quiz questions\n• Answer any questions about the file\n\nWhat would you like to know?`
    }]);
    setShowAIChat(true);
  };

  const sendMessage = async () => {
    if (!chatInput.trim() || !currentFile || !session) return;
    
    const userMessage = chatInput.trim();
    setChatInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsStreaming(true);

    try {
      const response = await fetch(
        `https://cgfiwjbegervslftrvaz.supabase.co/functions/v1/course-ai-assistant`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [
              ...messages.map(m => ({ role: m.role, content: m.content })),
              { role: 'user', content: `[Context: This is about a department file titled "${currentFile.title}" (${currentFile.file_name}). ${currentFile.description ? `Description: ${currentFile.description}` : ''}]\n\n${userMessage}` }
            ],
          }),
        }
      );

      if (!response.ok || !response.body) {
        throw new Error('Failed to get AI response');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6));
              const content = data.choices?.[0]?.delta?.content;
              if (content) {
                assistantMessage += content;
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1].content = assistantMessage;
                  return newMessages;
                });
              }
            } catch {}
          }
        }
      }
    } catch (error) {
      console.error('AI chat error:', error);
      toast({ title: 'Failed to get AI response', variant: 'destructive' });
    } finally {
      setIsStreaming(false);
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
    <div className="space-y-6">
      {canManage && (
        <div className="flex justify-end">
          <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Department File</DialogTitle>
                <DialogDescription>
                  Share a file with your department members. Files can be analyzed by AI.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="File title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.md"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
                <Button 
                  onClick={handleUpload} 
                  disabled={uploading || !selectedFile || !title.trim()}
                  className="w-full"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Uploading...
                    </>
                  ) : (
                    'Upload'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {files.length === 0 ? (
        <Card className="bg-bg-secondary/50 border-white/10">
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No files uploaded yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {files.map((file) => (
            <Card key={file.id} className="bg-bg-secondary/50 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <FileText className="h-8 w-8 text-brand-blue mt-1" />
                    <div className="flex-1">
                      <h4 className="font-medium">{file.title}</h4>
                      {file.description && (
                        <p className="text-sm text-muted-foreground mt-1">{file.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span>@{file.uploader?.username || file.uploader?.full_name || 'Unknown'}</span>
                        <span>•</span>
                        <span>{format(new Date(file.created_at), 'PP')}</span>
                        <span>•</span>
                        <span>{file.file_name}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openAIChat(file)}
                    >
                      <Bot className="h-4 w-4 mr-1" />
                      AI Chat
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(file.file_url, '_blank')}
                    >
                      View
                    </Button>
                    {canManage && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(file.id, file.file_url)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* AI Chat Modal */}
      <Dialog open={showAIChat} onOpenChange={setShowAIChat}>
        <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-brand-blue" />
              AI Assistant - {currentFile?.title}
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-brand-blue text-white'
                        : 'bg-white/10'
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="flex gap-2 mt-4">
            <Input
              placeholder="Ask about this file..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              disabled={isStreaming}
            />
            <Button onClick={sendMessage} disabled={isStreaming || !chatInput.trim()}>
              {isStreaming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};