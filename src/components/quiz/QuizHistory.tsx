import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Calendar, Trophy, ChevronRight, Eye, CheckCircle, XCircle, FileText, Brain } from "lucide-react";
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

interface TheorySubmission {
  id: string;
  question: string;
  answer: string;
  ai_score: number | null;
  max_score: number | null;
  ai_feedback: string | null;
  graded: boolean | null;
  created_at: string;
}

interface QuizHistoryProps {
  courseId: string;
  courseTitle: string;
}

const QuizHistory = ({ courseId, courseTitle }: QuizHistoryProps) => {
  const { user } = useAuth();
  const [history, setHistory] = useState<QuizHistoryEntry[]>([]);
  const [theoryHistory, setTheoryHistory] = useState<TheorySubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [theoryLoading, setTheoryLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizHistoryEntry | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [selectedTheory, setSelectedTheory] = useState<TheorySubmission | null>(null);
  const [showTheoryReview, setShowTheoryReview] = useState(false);

  useEffect(() => {
    if (user) {
      fetchQuizHistory();
      fetchTheoryHistory();
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

      if (error) { console.error('Error fetching quiz history:', error); return; }

      const transformedData: QuizHistoryEntry[] = (data || []).map(entry => ({
        ...entry,
        questions_data: entry.questions_data as QuizHistoryEntry['questions_data']
      }));
      setHistory(transformedData);
    } catch (error) {
      console.error('Error fetching quiz history:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTheoryHistory = async () => {
    if (!user) return;
    try {
      setTheoryLoading(true);
      const { data, error } = await supabase
        .from('theory_quiz_submissions')
        .select('*')
        .eq('course_id', courseId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) { console.error('Error fetching theory history:', error); return; }
      setTheoryHistory(data || []);
    } catch (error) {
      console.error('Error fetching theory history:', error);
    } finally {
      setTheoryLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
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

  const getTheoryScoreColor = (score: number | null, max: number | null) => {
    if (score === null || max === null) return "text-muted-foreground";
    const pct = (score / max) * 100;
    if (pct >= 80) return "text-green-400";
    if (pct >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const isMathCourse = courseTitle.toLowerCase().includes('math') || courseTitle.toLowerCase().includes('physics');
  const isCodeCourse = courseTitle.toLowerCase().includes('computer') || courseTitle.toLowerCase().includes('programming');

  const renderContent = (content: string) => {
    if (isMathCourse) return <MathRenderer>{content}</MathRenderer>;
    if (isCodeCourse) return <CodeRenderer>{content}</CodeRenderer>;
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

  return (
    <>
      <Card className="bg-bg-secondary/50 backdrop-blur border-white/10">
        <CardHeader>
          <CardTitle>📚 Quiz History</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="mcq" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="mcq" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                MCQ ({history.length})
              </TabsTrigger>
              <TabsTrigger value="theory" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Theory ({theoryHistory.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mcq">
              {loading ? (
                <div className="py-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading MCQ history...</p>
                </div>
              ) : history.length === 0 ? (
                <div className="py-8 text-center">
                  <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No MCQ attempts yet. Start a quiz to see your history!</p>
                </div>
              ) : (
                <ScrollArea className="h-[500px] pr-4">
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
                              <div className="space-y-2 flex-1 min-w-0">
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
                                    <span>{entry.questions_data.filter(q => q.is_correct).length}/{entry.total_questions} correct</span>
                                  </div>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => { setSelectedQuiz(entry); setShowReview(true); }}>
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
              )}
            </TabsContent>

            <TabsContent value="theory">
              {theoryLoading ? (
                <div className="py-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading theory history...</p>
                </div>
              ) : theoryHistory.length === 0 ? (
                <div className="py-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No theory attempts yet. Try the Theory Quiz!</p>
                </div>
              ) : (
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-4">
                    {theoryHistory.map((entry, index) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <Card className="bg-bg-primary/50 border-white/5 hover:border-white/10 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="space-y-2 flex-1 min-w-0">
                                <div className="flex items-center gap-3">
                                  {entry.graded ? (
                                    <Badge variant="outline" className={getTheoryScoreColor(entry.ai_score, entry.max_score)}>
                                      {entry.ai_score}/{entry.max_score}
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-muted-foreground">Pending</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground truncate">{entry.question.substring(0, 80)}...</p>
                                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>{formatDate(entry.created_at)}</span>
                                  </div>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => { setSelectedTheory(entry); setShowTheoryReview(true); }}>
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
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* MCQ Review Dialog */}
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
                        {q.is_correct ? <CheckCircle className="h-5 w-5 text-green-400" /> : <XCircle className="h-5 w-5 text-red-400" />}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-lg font-medium">{renderContent(q.question)}</div>
                      <div className="space-y-2">
                        {q.options.map((option, optIndex) => {
                          const isCorrect = optIndex === q.correct_answer;
                          const isUserAnswer = optIndex === q.user_answer;
                          return (
                            <div key={optIndex} className={`p-3 rounded-lg border transition-colors ${
                              isCorrect ? "bg-green-500/20 border-green-500 text-green-300"
                              : isUserAnswer && !isCorrect ? "bg-red-500/20 border-red-500 text-red-300"
                              : "bg-bg-secondary/30 border-white/5"
                            }`}>
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
                          <div className="text-sm text-muted-foreground">{renderContent(q.explanation)}</div>
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

      {/* Theory Review Dialog */}
      <Dialog open={showTheoryReview} onOpenChange={setShowTheoryReview}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Theory Review - {selectedTheory && formatDate(selectedTheory.created_at)}</DialogTitle>
          </DialogHeader>
          {selectedTheory && (
            <div className="space-y-6">
              {selectedTheory.graded && (
                <div className="flex items-center justify-between p-4 bg-bg-secondary/50 rounded-lg">
                  <Badge variant="outline" className={`text-lg ${getTheoryScoreColor(selectedTheory.ai_score, selectedTheory.max_score)}`}>
                    Score: {selectedTheory.ai_score}/{selectedTheory.max_score}
                  </Badge>
                </div>
              )}

              <Card className="bg-bg-secondary/30">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    Question
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-medium">{selectedTheory.question}</p>
                </CardContent>
              </Card>

              <Card className="bg-bg-secondary/30">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Your Answer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{selectedTheory.answer}</p>
                </CardContent>
              </Card>

              {selectedTheory.ai_feedback && (
                <Card className="bg-blue-500/10 border-blue-500/30">
                  <CardHeader>
                    <CardTitle className="text-base text-blue-400 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      AI Feedback
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedTheory.ai_feedback}</div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QuizHistory;
