import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Trophy, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Question {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation?: string;
}

interface QuizComponentProps {
  courseId: string;
  courseTitle: string;
}

const QuizComponent = ({ courseId, courseTitle }: QuizComponentProps) => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizQuestions();
  }, [courseId]);

  const fetchQuizQuestions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('course_id', courseId);

      if (error) {
        console.error('Error fetching quiz questions:', error);
        return;
      }

      if (data) {
        const formattedQuestions = data.map(q => ({
          ...q,
          options: Array.isArray(q.options) ? q.options : JSON.parse(q.options as string)
        }));
        setQuestions(formattedQuestions);
      }
    } catch (error) {
      console.error('Error fetching quiz questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateLeaderboard = async (finalScore: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('leaderboard')
        .upsert({
          course_id: courseId,
          user_id: user.id,
          name: user.email?.split('@')[0] || 'Anonymous',
          score: finalScore,
          avatar: user.email?.charAt(0).toUpperCase() || 'A'
        }, {
          onConflict: 'course_id,user_id'
        });

      if (error) {
        console.error('Error updating leaderboard:', error);
      }
    } catch (error) {
      console.error('Error updating leaderboard:', error);
    }
  };

  if (loading) {
    return (
      <Card className="bg-bg-secondary/50 backdrop-blur border-white/10">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading quiz questions...</p>
        </CardContent>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <Card className="bg-bg-secondary/50 backdrop-blur border-white/10">
        <CardContent className="p-8 text-center">
          <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Quiz Coming Soon</h3>
          <p className="text-muted-foreground">
            Quiz questions for this course are being prepared. Check back soon!
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleAnswerSelect = (value: string) => {
    setSelectedAnswer(value);
  };

  const handleNext = async () => {
    const answerIndex = parseInt(selectedAnswer);
    const newAnswers = [...answers, answerIndex];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer("");
    } else {
      // Quiz completed
      const correctCount = newAnswers.reduce((count, answer, index) => {
        return count + (answer === questions[index].correct_answer ? 1 : 0);
      }, 0);
      const finalScore = Math.round((correctCount / questions.length) * 100);
      setScore(correctCount);
      setQuizCompleted(true);
      await updateLeaderboard(finalScore);
    }
  };

  const handleShowResult = () => {
    setShowResult(true);
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer("");
    setAnswers([]);
    setShowResult(false);
    setQuizCompleted(false);
    setScore(0);
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];

  if (quizCompleted && !showResult) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-primary text-white">
          <CardContent className="p-8 text-center">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-yellow-400" />
            <h2 className="text-2xl font-bold mb-4">Quiz Completed!</h2>
            <p className="text-lg mb-2">Your Score:</p>
            <p className="text-4xl font-bold mb-6">
              {score}/{questions.length} ({Math.round((score / questions.length) * 100)}%)
            </p>
            <div className="space-y-3">
              <Button variant="glass" onClick={handleShowResult} className="w-full">
                View Detailed Results
              </Button>
              <Button variant="outline" onClick={handleRestart} className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20">
                <RotateCcw className="h-4 w-4 mr-2" />
                Retake Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (showResult) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        <Card className="bg-gradient-primary text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Quiz Results - {courseTitle}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">
              Final Score: {score}/{questions.length} ({Math.round((score / questions.length) * 100)}%)
            </p>
          </CardContent>
        </Card>

        {questions.map((question, index) => {
          const userAnswer = answers[index];
          const isCorrect = userAnswer === question.correct_answer;
          
          return (
            <Card key={question.id} className="bg-bg-secondary/50 backdrop-blur border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  {isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  Question {index + 1}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="font-medium">{question.question}</p>
                
                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => {
                    let bgColor = "";
                    if (optionIndex === question.correct_answer) {
                      bgColor = "bg-green-500/20 border-green-500";
                    } else if (optionIndex === userAnswer && !isCorrect) {
                      bgColor = "bg-red-500/20 border-red-500";
                    }
                    
                    return (
                      <div
                        key={optionIndex}
                        className={`p-3 rounded-lg border ${bgColor || "border-white/10"}`}
                      >
                        {option}
                        {optionIndex === question.correct_answer && (
                          <Badge variant="outline" className="ml-2 text-green-500 border-green-500">
                            Correct
                          </Badge>
                        )}
                        {optionIndex === userAnswer && !isCorrect && (
                          <Badge variant="outline" className="ml-2 text-red-500 border-red-500">
                            Your Answer
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {question.explanation && (
                  <div className="p-3 rounded-lg bg-blue-500/20 border border-blue-500/30">
                    <p className="text-sm">
                      <strong>Explanation:</strong> {question.explanation}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        <Card className="bg-bg-secondary/50 backdrop-blur border-white/10">
          <CardContent className="p-6 text-center">
            <Button onClick={handleRestart} variant="gradient" className="w-full">
              <RotateCcw className="h-4 w-4 mr-2" />
              Take Quiz Again
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card className="bg-bg-secondary/50 backdrop-blur border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Question {currentQuestion + 1} of {questions.length}</CardTitle>
            <Badge variant="outline">
              {courseTitle}
            </Badge>
          </div>
          <Progress value={progress} className="w-full" />
        </CardHeader>
      </Card>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-bg-secondary/50 backdrop-blur border-white/10">
            <CardHeader>
              <CardTitle>{currentQ.question}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup value={selectedAnswer} onValueChange={handleAnswerSelect}>
                {currentQ.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-white/5 transition-colors">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <Button 
                onClick={handleNext} 
                disabled={!selectedAnswer} 
                className="w-full"
                variant="gradient"
              >
                {currentQuestion < questions.length - 1 ? "Next Question" : "Finish Quiz"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default QuizComponent;