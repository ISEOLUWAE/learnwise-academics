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
  BookOpen, 
  FileQuestion,
  Loader2,
  User,
  Lightbulb,
  GraduationCap
} from "lucide-react";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const streamChat = async (userMessage: string, action?: string) => {
    setIsLoading(true);
    
    const userMsg: Message = { role: "user", content: userMessage };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    let assistantContent = "";

    try {
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          courseContext: { code: courseCode, title: courseTitle },
          action,
        }),
      });

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
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    streamChat(input.trim());
  };

  const handleQuickAction = (action: string, prompt: string) => {
    streamChat(prompt, action);
  };

  return (
    <Card className="bg-bg-secondary/50 backdrop-blur border-white/10">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-brand-blue" />
          AI Course Assistant
          <Badge variant="outline" className="ml-2 text-xs">
            {courseCode}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Actions */}
        {messages.length === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="justify-start gap-2 h-auto py-3"
              onClick={() => handleQuickAction('explain', `Give me a comprehensive overview of ${courseTitle}. What are the key concepts I need to understand?`)}
            >
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              <span className="text-left text-xs">Course Overview</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="justify-start gap-2 h-auto py-3"
              onClick={() => handleQuickAction('quiz', `Generate a practice quiz for ${courseTitle} covering the main topics.`)}
            >
              <FileQuestion className="h-4 w-4 text-brand-green" />
              <span className="text-left text-xs">Generate Quiz</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="justify-start gap-2 h-auto py-3"
              onClick={() => handleQuickAction('explain', `What are the most important exam tips for ${courseTitle}? What topics should I focus on?`)}
            >
              <GraduationCap className="h-4 w-4 text-brand-blue" />
              <span className="text-left text-xs">Exam Tips</span>
            </Button>
          </div>
        )}

        {/* Chat Messages */}
        <ScrollArea className="h-[400px] pr-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <Sparkles className="h-12 w-12 text-brand-blue/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Ask me anything about {courseTitle}</h3>
                <p className="text-sm text-muted-foreground">
                  I can explain concepts, generate quizzes, and help you prepare for exams.
                </p>
              </div>
            )}

            <AnimatePresence>
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-brand-blue/20 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-brand-blue" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.role === "user"
                        ? "bg-brand-blue text-white"
                        : "bg-bg-tertiary border border-white/10"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-brand-green/20 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-brand-green" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 justify-start"
              >
                <div className="w-8 h-8 rounded-full bg-brand-blue/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-brand-blue" />
                </div>
                <div className="bg-bg-tertiary border border-white/10 rounded-lg p-3">
                  <Loader2 className="h-4 w-4 animate-spin text-brand-blue" />
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about course concepts, request explanations, or generate a quiz..."
            className="min-h-[60px] max-h-[120px] resize-none bg-bg-tertiary border-white/10"
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
            disabled={!input.trim() || isLoading}
            className="self-end"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIAssistant;
