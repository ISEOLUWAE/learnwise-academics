import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FileText, Clock, CheckCircle, XCircle, RotateCcw, Loader2, Brain } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import AntiCheatWrapper from "./AntiCheatWrapper";

interface TheoryQuizProps {
  courseId: string;
  courseTitle: string;
  courseCode: string;
  courseOverview?: string;
}

interface GradeResult {
  question_number: number;
  score: number;
  feedback: string;
  explanation: string;
}

const TheoryQuizComponent = ({ courseId, courseTitle, courseCode, courseOverview }: TheoryQuizProps) => {
  const { user } = useAuth();
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [referenceAnswers, setReferenceAnswers] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [grading, setGrading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [grades, setGrades] = useState<GradeResult[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [maxTotal, setMaxTotal] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [selectedCount, setSelectedCount] = useState("5");
  const [selectedTime, setSelectedTime] = useState("30");
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Timer
  useEffect(() => {
    if (!timerActive || timeRemaining <= 0) return;
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  });

  const startQuiz = async () => {
    const count = parseInt(selectedCount);
    setGenerating(true);

    try {
      // ALWAYS prioritize banked questions first — no repeats until all are exhausted
      const { data: bankQuestions } = await supabase
        .from('theory_quiz_bank')
        .select('id, question, reference_answer')
        .eq('course_id', courseId);

      if (bankQuestions && bankQuestions.length > 0) {
        // Get previously asked question IDs for this user+course from submissions
        const { data: previousSubmissions } = await supabase
          .from('theory_quiz_submissions')
          .select('question')
          .eq('course_id', courseId)
          .eq('user_id', user?.id || '');

        const previouslyAskedQuestions = new Set(
          (previousSubmissions || []).map(s => s.question)
        );

        // Filter out already-asked questions
        let unseenQuestions = bankQuestions.filter(
          q => !previouslyAskedQuestions.has(q.question)
        );

        // If all questions have been asked, reset — allow full bank again
        if (unseenQuestions.length === 0) {
          unseenQuestions = [...bankQuestions];
          toast.info("All banked questions completed! Starting a new cycle.");
        }

        // Randomly select up to `count` from unseen
        const shuffled = [...unseenQuestions].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, Math.min(count, shuffled.length));

        setQuestions(selected.map(q => q.question));
        setReferenceAnswers(selected.map(q => q.reference_answer));
        setAnswers(new Array(selected.length).fill(""));
        setCurrentQuestion(0);
        setQuizStarted(true);
        setQuizCompleted(false);
        setGrades([]);
        setTimeRemaining(parseInt(selectedTime) * 60);
        setTimerActive(true);
        return;
      }

      // Fallback ONLY if NO banked questions exist at all: AI generates from course content
      const [materialsRes, textbooksRes] = await Promise.all([
        supabase.from('materials').select('title, type').eq('course_id', courseId),
        supabase.from('textbooks').select('title, author').eq('course_id', courseId),
      ]);

      const materialsContext = (materialsRes.data || []).map(m => `${m.title} (${m.type})`).join(', ');
      const textbooksContext = (textbooksRes.data || []).map(t => `${t.title} by ${t.author}`).join(', ');

      const { data, error } = await supabase.functions.invoke('grade-theory-quiz', {
        body: {
          action: 'generate',
          courseTitle,
          courseCode,
          courseId,
          courseOverview: courseOverview || '',
          materialsContext,
          textbooksContext,
          questionCount: count,
        }
      });

      if (error) throw error;

      const generatedQuestions = data.questions as string[];
      if (!generatedQuestions || generatedQuestions.length === 0) {
        toast.error("Failed to generate questions. Please try again.");
        return;
      }

      setQuestions(generatedQuestions);
      setReferenceAnswers([]);
      setAnswers(new Array(generatedQuestions.length).fill(""));
      setCurrentQuestion(0);
      setQuizStarted(true);
      setQuizCompleted(false);
      setGrades([]);
      setTimeRemaining(parseInt(selectedTime) * 60);
      setTimerActive(true);
    } catch (err) {
      console.error('Question generation error:', err);
      toast.error('Failed to generate quiz questions. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleAnswerChange = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    setTimerActive(false);
    setGrading(true);

    try {
      const { data, error } = await supabase.functions.invoke('grade-theory-quiz', {
        body: {
          action: 'grade',
          questions,
          answers,
          referenceAnswers: referenceAnswers.length > 0 ? referenceAnswers : undefined,
          courseTitle,
          courseCode,
          courseId,
          courseOverview: courseOverview || '',
        }
      });

      if (error) throw error;

      setGrades(data.grades || []);
      setTotalScore(data.totalScore || 0);
      setMaxTotal(data.maxTotal || 0);
      setPercentage(data.percentage || 0);
      setQuizCompleted(true);
    } catch (err) {
      console.error('Grading error:', err);
      toast.error('Failed to grade quiz. Please try again.');
    } finally {
      setGrading(false);
    }
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setQuizCompleted(false);
    setQuestions([]);
    setAnswers([]);
    setReferenceAnswers([]);
    setGrades([]);
    setCurrentQuestion(0);
    setTimerActive(false);
    setTimeRemaining(0);
    setShowResults(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-400";
    if (score >= 5) return "text-yellow-400";
    return "text-red-400";
  };

  if (generating) {
    return (
      <Card className="bg-bg-secondary/50 backdrop-blur border-white/10">
        <CardContent className="p-12 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">AI is generating questions from course content...</h3>
          <p className="text-muted-foreground">Creating questions based on {courseTitle} course outline and materials.</p>
        </CardContent>
      </Card>
    );
  }

  if (grading) {
    return (
      <Card className="bg-bg-secondary/50 backdrop-blur border-white/10">
        <CardContent className="p-12 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">AI is grading your answers...</h3>
          <p className="text-muted-foreground">This may take a moment. Please wait.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <AntiCheatWrapper
      isActive={quizStarted && !quizCompleted}
      onCheatDetected={() => console.log("Theory quiz cheat detected")}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="bg-bg-secondary/50 backdrop-blur border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Theory Quiz - {courseTitle}
              </span>
              {timerActive && timeRemaining > 0 && (
                <div className="flex items-center gap-2 text-red-400">
                  <Clock className="h-4 w-4" />
                  <span className="font-mono">
                    {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!quizStarted ? (
              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 inline-block">
                    <FileText className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Theory Quiz Settings</h3>
                  <p className="text-muted-foreground max-w-lg mx-auto">
                    AI generates questions strictly from your course outline, topics, and available materials. Your responses will be graded by AI based on accuracy, completeness, and clarity.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-lg mx-auto">
                  <div className="space-y-2">
                    <Label>Number of Questions</Label>
                    <Select value={selectedCount} onValueChange={setSelectedCount}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[3, 5, 7, 10].map(n => (
                          <SelectItem key={n} value={n.toString()}>{n} questions</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Time Limit</Label>
                    <Select value={selectedTime} onValueChange={setSelectedTime}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[15, 30, 45, 60, 90, 120].map(m => (
                          <SelectItem key={m} value={m.toString()}>{m} minutes</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="text-center">
                  <Button onClick={startQuiz} size="lg" className="px-8">
                    <Brain className="h-5 w-5 mr-2" />
                    Start Theory Quiz
                  </Button>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-400 mb-2">How it works:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• AI generates questions from the course outline and available materials</li>
                    <li>• Questions are strictly based on course content — no out-of-context topics</li>
                    <li>• Write detailed answers to each theory question</li>
                    <li>• AI grades each answer out of 10 marks with feedback</li>
                    <li>• Your score is recorded on the leaderboard</li>
                  </ul>
                </div>
              </div>
            ) : quizCompleted ? (
              <div className="space-y-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="text-center"
                >
                  <Brain className="h-16 w-16 text-primary mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Theory Quiz Graded!</h3>
                  <div className="text-4xl font-bold text-primary mb-2">{percentage}%</div>
                  <p className="text-muted-foreground">
                    {totalScore} / {maxTotal} marks ({grades.length} questions graded by AI)
                  </p>
                </motion.div>

                <div className="flex gap-4 justify-center">
                  <Button onClick={resetQuiz} variant="outline">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Retake Quiz
                  </Button>
                  <Button onClick={() => setShowResults(!showResults)} variant="default">
                    {showResults ? "Hide" : "View"} Detailed Feedback
                  </Button>
                </div>

                {showResults && (
                  <div className="space-y-4 mt-6">
                    <h4 className="text-xl font-semibold">Detailed AI Feedback</h4>
                    {questions.map((q, i) => {
                      const grade = grades.find(g => g.question_number === i + 1);
                      return (
                        <Card key={i} className="bg-bg-primary/30">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <span className="font-medium">Question {i + 1}</span>
                              <div className="flex items-center gap-2">
                                {(grade?.score || 0) >= 5 ? (
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-red-500" />
                                )}
                                <span className={`font-bold ${getScoreColor(grade?.score || 0)}`}>
                                  {grade?.score || 0}/10
                                </span>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <p className="font-medium text-sm mb-1">Question:</p>
                              <p className="text-sm text-muted-foreground">{q}</p>
                            </div>
                            <div>
                              <p className="font-medium text-sm mb-1">Your Answer:</p>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {answers[i] || "(No answer provided)"}
                              </p>
                            </div>
                            {grade?.feedback && (
                              <div className="bg-primary/5 rounded-lg p-3">
                                <p className="font-medium text-sm mb-1">AI Feedback:</p>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{grade.feedback}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">
                    Question {currentQuestion + 1} of {questions.length}
                  </span>
                  <Progress value={((currentQuestion + 1) / questions.length) * 100} className="w-1/3" />
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <p className="font-medium">{questions[currentQuestion]}</p>
                </div>

                <Textarea
                  value={answers[currentQuestion]}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder="Write your detailed answer here..."
                  rows={8}
                  className="resize-none"
                />

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestion === 0}
                  >
                    Previous
                  </Button>
                  {currentQuestion < questions.length - 1 ? (
                    <Button onClick={() => setCurrentQuestion(prev => prev + 1)}>
                      Next
                    </Button>
                  ) : (
                    <Button onClick={handleSubmit} variant="default">
                      Submit Quiz
                    </Button>
                  )}
                </div>

                {/* Question navigator */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-white/10">
                  {questions.map((_, i) => (
                    <Button
                      key={i}
                      variant={i === currentQuestion ? "default" : answers[i] ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => setCurrentQuestion(i)}
                      className="w-10 h-10"
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AntiCheatWrapper>
  );
};

export default TheoryQuizComponent;
