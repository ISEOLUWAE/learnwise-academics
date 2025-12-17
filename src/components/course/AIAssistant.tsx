import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  Send, 
  Sparkles, 
  FileQuestion,
  Loader2,
  User,
  Lightbulb,
  GraduationCap,
  Upload,
  Image as ImageIcon,
  X,
  FileText,
  Camera
} from "lucide-react";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
  attachments?: { type: string; name: string; preview?: string }[];
}

interface AIAssistantProps {
  courseCode: string;
  courseTitle: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/course-ai-assistant`;

const AIAssistant = ({ courseCode, courseTitle }: AIAssistantProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<{ file: File; preview?: string; base64?: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: { file: File; preview?: string; base64?: string }[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large. Max 10MB.`);
        continue;
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error(`File type ${file.type} not supported. Use images or PDF.`);
        continue;
      }

      // Create preview for images
      let preview: string | undefined;
      let base64: string | undefined;

      if (file.type.startsWith('image/')) {
        preview = URL.createObjectURL(file);
        
        // Convert to base64
        const reader = new FileReader();
        base64 = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      } else if (file.type === 'application/pdf') {
        // For PDF, we'll send the base64
        const reader = new FileReader();
        base64 = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      }

      newFiles.push({ file, preview, base64 });
    }

    setAttachedFiles(prev => [...prev, ...newFiles]);
    
    // Reset input
    if (e.target) e.target.value = '';
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => {
      const newFiles = [...prev];
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const streamChat = async (userMessage: string, action?: string) => {
    setIsLoading(true);
    
    // Build message content with attachments
    const attachments = attachedFiles.map(f => ({
      type: f.file.type,
      name: f.file.name,
      preview: f.preview
    }));

    const userMsg: Message = { 
      role: "user", 
      content: userMessage,
      attachments: attachments.length > 0 ? attachments : undefined
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    let assistantContent = "";

    try {
      // Build the content array for multimodal
      const contentParts: any[] = [{ type: "text", text: userMessage }];
      
      // Add files as base64 images or document references
      for (const attachedFile of attachedFiles) {
        if (attachedFile.base64) {
          if (attachedFile.file.type.startsWith('image/')) {
            contentParts.push({
              type: "image_url",
              image_url: {
                url: attachedFile.base64
              }
            });
          } else if (attachedFile.file.type === 'application/pdf') {
            // For PDFs, we inform the AI about the document
            contentParts[0].text = `[User uploaded a PDF document: "${attachedFile.file.name}"]\n\nNote: I cannot directly read PDF files, but if you can describe what's in it or copy-paste the text, I can help analyze it.\n\n${userMessage}`;
          }
        }
      }

      // Build the message for the API
      const apiMessages = [...messages, { 
        role: "user" as const, 
        content: attachedFiles.some(f => f.file.type.startsWith('image/')) ? contentParts : userMessage 
      }];

      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          messages: apiMessages,
          courseContext: { code: courseCode, title: courseTitle },
          action,
          hasAttachments: attachedFiles.length > 0,
        }),
      });

      // Clear attached files after sending
      attachedFiles.forEach(f => {
        if (f.preview) URL.revokeObjectURL(f.preview);
      });
      setAttachedFiles([]);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to get AI response");
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => 
                    i === prev.length - 1 ? { ...m, content: assistantContent } : m
                  );
                }
                return [...prev, { role: "assistant", content: assistantContent }];
              });
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error("AI Chat error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to get AI response");
      // Remove the user message if there was an error
      setMessages(prev => prev.slice(0, -1));
      // Restore attached files on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    if ((!input.trim() && attachedFiles.length === 0) || isLoading) return;
    streamChat(input.trim() || "Please analyze the attached file(s).");
  };

  const handleQuickAction = (action: string, prompt: string) => {
    streamChat(prompt, action);
  };

  return (
    <Card className="bg-bg-secondary/50 backdrop-blur border-white/10">
      <CardHeader className="pb-3 px-3 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
          <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-brand-blue flex-shrink-0" />
          <span className="truncate">AI Course Assistant</span>
          <Badge variant="outline" className="ml-1 sm:ml-2 text-xs flex-shrink-0">
            {courseCode}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-3 sm:px-6">
        {/* Quick Actions */}
        {messages.length === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="justify-start gap-2 h-auto py-2 sm:py-3"
              onClick={() => handleQuickAction('explain', `Give me a comprehensive overview of ${courseTitle}. What are the key concepts I need to understand?`)}
            >
              <Lightbulb className="h-4 w-4 text-yellow-500 flex-shrink-0" />
              <span className="text-left text-xs truncate">Course Overview</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="justify-start gap-2 h-auto py-2 sm:py-3"
              onClick={() => handleQuickAction('quiz', `Generate a practice quiz for ${courseTitle} covering the main topics.`)}
            >
              <FileQuestion className="h-4 w-4 text-brand-green flex-shrink-0" />
              <span className="text-left text-xs truncate">Generate Quiz</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="justify-start gap-2 h-auto py-2 sm:py-3"
              onClick={() => handleQuickAction('explain', `What are the most important exam tips for ${courseTitle}? What topics should I focus on?`)}
            >
              <GraduationCap className="h-4 w-4 text-brand-blue flex-shrink-0" />
              <span className="text-left text-xs truncate">Exam Tips</span>
            </Button>
          </div>
        )}

        {/* Chat Messages */}
        <ScrollArea className="h-[300px] sm:h-[400px] pr-2 sm:pr-4" ref={scrollRef}>
          <div className="space-y-3 sm:space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8 sm:py-12">
                <Sparkles className="h-10 w-10 sm:h-12 sm:w-12 text-brand-blue/50 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-medium mb-2">Ask me anything about {courseTitle}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 px-2">
                  I can explain concepts, generate quizzes, analyze images/documents, and help you prepare for exams.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge variant="outline" className="gap-1 text-xs">
                    <ImageIcon className="h-3 w-3" />
                    Upload Images
                  </Badge>
                  <Badge variant="outline" className="gap-1 text-xs">
                    <FileText className="h-3 w-3" />
                    Analyze Documents
                  </Badge>
                </div>
              </div>
            )}

            <AnimatePresence>
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex gap-2 sm:gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-brand-blue/20 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-brand-blue" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg p-2 sm:p-3 ${
                      msg.role === "user"
                        ? "bg-brand-blue text-white"
                        : "bg-bg-tertiary border border-white/10"
                    }`}
                  >
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-1 sm:gap-2 mb-2">
                        {msg.attachments.map((att, i) => (
                          <div key={i} className="relative">
                            {att.type.startsWith('image/') && att.preview ? (
                              <img 
                                src={att.preview} 
                                alt={att.name} 
                                className="h-12 w-12 sm:h-16 sm:w-16 object-cover rounded"
                              />
                            ) : (
                              <div className="h-12 w-12 sm:h-16 sm:w-16 bg-white/10 rounded flex items-center justify-center">
                                <FileText className="h-4 w-4 sm:h-6 sm:w-6" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-xs sm:text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  {msg.role === "user" && (
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-brand-green/20 flex items-center justify-center flex-shrink-0">
                      <User className="h-3 w-3 sm:h-4 sm:w-4 text-brand-green" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2 sm:gap-3 justify-start"
              >
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-brand-blue/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-brand-blue" />
                </div>
                <div className="bg-bg-tertiary border border-white/10 rounded-lg p-2 sm:p-3">
                  <Loader2 className="h-4 w-4 animate-spin text-brand-blue" />
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {/* Attached Files Preview */}
        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 p-2 bg-bg-tertiary rounded-lg border border-white/10 overflow-x-auto">
            {attachedFiles.map((f, index) => (
              <div key={index} className="relative group flex-shrink-0">
                {f.preview ? (
                  <img 
                    src={f.preview} 
                    alt={f.file.name} 
                    className="h-12 w-12 sm:h-16 sm:w-16 object-cover rounded"
                  />
                ) : (
                  <div className="h-12 w-12 sm:h-16 sm:w-16 bg-white/10 rounded flex items-center justify-center">
                    <FileText className="h-4 w-4 sm:h-6 sm:w-6 text-muted-foreground" />
                  </div>
                )}
                <button
                  onClick={() => removeFile(index)}
                  className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-destructive text-white rounded-full p-0.5 sm:p-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-2 w-2 sm:h-3 sm:w-3" />
                </button>
                <p className="text-[10px] sm:text-xs text-center mt-1 truncate max-w-[48px] sm:max-w-[64px]">{f.file.name}</p>
              </div>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="space-y-2">
          <div className="flex gap-1 sm:gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*,application/pdf"
              multiple
              className="hidden"
            />
            <input
              type="file"
              ref={cameraInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              capture="environment"
              className="hidden"
            />
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              title="Upload file"
              className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0"
            >
              <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => cameraInputRef.current?.click()}
              disabled={isLoading}
              title="Take photo"
              className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0"
            >
              <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="min-h-[50px] sm:min-h-[60px] max-h-[100px] sm:max-h-[120px] resize-none bg-bg-tertiary border-white/10 flex-1 text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={((!input.trim() && attachedFiles.length === 0) || isLoading)}
              className="self-end h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0"
              size="icon"
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
              ) : (
                <Send className="h-3 w-3 sm:h-4 sm:w-4" />
              )}
            </Button>
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground text-center">
            Upload images or PDFs for analysis • Snap photos of notes
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIAssistant;