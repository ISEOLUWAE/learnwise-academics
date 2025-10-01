import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Calendar, Trophy, ChevronRight, Eye, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import MathRenderer from "./MathRenderer";
import CodeRenderer from "./CodeRenderer";

interface QuizHistoryEntry {
  id: string;
  score: number;
  total_questions: number;
  time_taken: number;
  created_at: string;
  questions_data: Array<{
    question: string;
    options: string[];
    correct_answer: number;
    user_answer: number;
    is_correct: boolean;
    explanation?: string;
  }>;
}

interface QuizHistoryProps {
  courseId: string;
  courseTitle: string;
}

const QuizHistory = ({ courseId, courseTitle }: QuizHistoryProps) => {
  const { user } = useAuth();
  const [history, setHistory] = useState<QuizHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizHistoryEntry | null>(null);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    if (user) {
      fetchQuizHistory();
    }
  }, [courseId, user]);

  const fetchQuizHistory = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('quiz_history')
        .select('*')
        .eq('course_id', courseId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching quiz history:', error);
        return;
      }

      // Transform data to match our interface
      const transformedData: QuizHistoryEntry[] = (data || []).map(entry => ({
        ...entry,
        questions_data: entry.questions_data as Array<{
          question: string;
          options: string[];
          correct_answer: number;
          user_answer: number;
          is_correct: boolean;
          explanation?: string;
        }>
      }));

      setHistory(transformedData);
    } catch (error) {
      console.error('Error fetching quiz history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const isMathCourse = courseTitle.toLowerCase().includes('math') || courseTitle.toLowerCase().includes('physics');
  const isCodeCourse = courseTitle.toLowerCase().includes('computer') || courseTitle.toLowerCase().includes('programming');

  const renderContent = (content: string) => {
    if (isMathCourse) {
      return <MathRenderer>{content}</MathRenderer>;
    } else if (isCodeCourse) {
      return <CodeRenderer>{content}</CodeRenderer>;
    }
    return content;
  };

  if (!user) {
    return (
      <Card className="bg-bg-secondary/50 backdrop-blur border-white/10">
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Please log in to view your quiz history</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="bg-bg-secondary/50 backdrop-blur border-white/10">
        <CardContent className="py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading quiz history...</p>
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card className="bg-bg-secondary/50 backdrop-blur border-white/10">
        <CardContent className="py-8 text-center">
          <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No quiz attempts yet. Start a quiz to see your history!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-bg-secondary/50 backdrop-blur border-white/10">
        <CardHeader>
          <CardTitle>📚 Quiz History</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {history.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="bg-bg-primary/50 border-white/5 hover:border-white/10 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className={getScoreColor(entry.score)}>
                              {entry.score}%
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {entry.total_questions} questions
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(entry.created_at)}</span>
                            </div>
                            {entry.time_taken && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{formatTime(entry.time_taken)}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Trophy className="h-3 w-3" />
                              <span>
                                {entry.questions_data.filter(q => q.is_correct).length}/{entry.total_questions} correct
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedQuiz(entry);
                            setShowReview(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Review
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={showReview} onOpenChange={setShowReview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quiz Review - {selectedQuiz && formatDate(selectedQuiz.created_at)}</DialogTitle>
          </DialogHeader>
          
          {selectedQuiz && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-bg-secondary/50 rounded-lg">
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className={`text-lg ${getScoreColor(selectedQuiz.score)}`}>
                    Score: {selectedQuiz.score}%
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {selectedQuiz.questions_data.filter(q => q.is_correct).length}/{selectedQuiz.total_questions} correct
                  </span>
                </div>
                {selectedQuiz.time_taken && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{formatTime(selectedQuiz.time_taken)}</span>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {selectedQuiz.questions_data.map((q, index) => (
                  <Card key={index} className="bg-bg-secondary/30">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <span className="text-muted-foreground">Question {index + 1}</span>
                        {q.is_correct ? (
                          <CheckCircle className="h-5 w-5 text-green-400" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-400" />
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-lg font-medium">
                        {renderContent(q.question)}
                      </div>

                      <div className="space-y-2">
                        {q.options.map((option, optIndex) => {
                          const isCorrect = optIndex === q.correct_answer;
                          const isUserAnswer = optIndex === q.user_answer;
                          
                          return (
                            <div
                              key={optIndex}
                              className={`p-3 rounded-lg border transition-colors ${
                                isCorrect
                                  ? "bg-green-500/20 border-green-500 text-green-300"
                                  : isUserAnswer && !isCorrect
                                  ? "bg-red-500/20 border-red-500 text-red-300"
                                  : "bg-bg-secondary/30 border-white/5"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {isCorrect && <CheckCircle className="h-4 w-4" />}
                                {isUserAnswer && !isCorrect && <XCircle className="h-4 w-4" />}
                                <div className="flex-1">{renderContent(option)}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {q.explanation && (
                        <div className="mt-4 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                          <h4 className="font-semibold text-blue-400 mb-2">Explanation:</h4>
                          <div className="text-sm text-muted-foreground">
                            {renderContent(q.explanation)}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QuizHistory;
