import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, Trophy, RotateCcw, Clock, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import AntiCheatWrapper from "./AntiCheatWrapper";
import MathRenderer from "./MathRenderer";
import CodeRenderer from "./CodeRenderer";

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
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quizSettings, setQuizSettings] = useState(false);
  const [selectedQuestionCount, setSelectedQuestionCount] = useState("10");
  const [selectedTimeLimit, setSelectedTimeLimit] = useState("15");
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  useEffect(() => {
    fetchQuizQuestions();
  }, [courseId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeRemaining]);

  // Enhanced tab switching detection
  useEffect(() => {
    if (quizStarted && !quizCompleted) {
      const handleVisibilityChange = () => {
        if (document.hidden) {
          console.log("Tab switch detected - auto submitting quiz");
          handleSubmit();
        }
      };

      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = '';
        handleSubmit();
      };

      const handleBlur = () => {
        if (quizStarted && !quizCompleted) {
          console.log("Window focus lost - auto submitting quiz");
          handleSubmit();
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('blur', handleBlur);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        window.removeEventListener('blur', handleBlur);
      };
    }
  }, [quizStarted, quizCompleted]);

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

      // Transform the data to match our Question interface
      const transformedQuestions: Question[] = (data || []).map(q => ({
        id: q.id,
        question: q.question,
        options: Array.isArray(q.options) ? q.options : JSON.parse(q.options as string),
        correct_answer: q.correct_answer,
        explanation: q.explanation || undefined
      }));

      setAllQuestions(transformedQuestions);
    } catch (error) {
      console.error('Error fetching quiz questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = () => {
    if (allQuestions.length === 0) return;

    const questionCount = Math.min(parseInt(selectedQuestionCount), allQuestions.length);
    const shuffledQuestions = [...allQuestions]
      .sort(() => Math.random() - 0.5)
      .slice(0, questionCount);

    setQuestions(shuffledQuestions);
    setAnswers(new Array(questionCount).fill(-1));
    setCurrentQuestion(0);
    setSelectedAnswer("");
    setQuizStarted(true);
    setQuizCompleted(false);
    setShowResult(false);
    setScore(0);
    
    // Start timer
    const timeLimitMinutes = parseInt(selectedTimeLimit);
    setTimeRemaining(timeLimitMinutes * 60);
    setTimerActive(true);
  };

  const handleNext = () => {
    if (selectedAnswer !== "") {
      const newAnswers = [...answers];
      newAnswers[currentQuestion] = parseInt(selectedAnswer);
      setAnswers(newAnswers);
      
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(answers[currentQuestion + 1]?.toString() || "");
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(answers[currentQuestion - 1]?.toString() || "");
    }
  };

  const handleSubmit = async () => {
    setTimerActive(false);
    
    // Save current answer
    const finalAnswers = [...answers];
    if (selectedAnswer !== "") {
      finalAnswers[currentQuestion] = parseInt(selectedAnswer);
    }
    
    // Calculate score
    let correctCount = 0;
    questions.forEach((question, index) => {
      if (finalAnswers[index] === question.correct_answer) {
        correctCount++;
      }
    });
    
    const finalScore = Math.round((correctCount / questions.length) * 100);
    const timeTaken = (parseInt(selectedTimeLimit) * 60) - timeRemaining;
    setScore(finalScore);
    setAnswers(finalAnswers);
    setQuizCompleted(true);

    // Save to both leaderboard and quiz history if user is authenticated
    if (user) {
      try {
        // Save to leaderboard
        if (finalScore > 0) {
          const { error: leaderboardError } = await supabase
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

          if (leaderboardError) {
            console.error('Error saving score:', leaderboardError);
          }
        }

        // Save to quiz history
        const questionsData = questions.map((q, index) => ({
          question: q.question,
          options: q.options,
          correct_answer: q.correct_answer,
          user_answer: finalAnswers[index],
          is_correct: finalAnswers[index] === q.correct_answer,
          explanation: q.explanation
        }));

        const { error: historyError } = await supabase
          .from('quiz_history')
          .insert({
            course_id: courseId,
            user_id: user.id,
            user_name: user.email?.split('@')[0] || 'Anonymous',
            score: finalScore,
            total_questions: questions.length,
            time_taken: timeTaken,
            questions_data: questionsData
          });

        if (historyError) {
          console.error('Error saving quiz history:', historyError);
        }
      } catch (error) {
        console.error('Error saving quiz results:', error);
      }
    }
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setQuizCompleted(false);
    setShowResult(false);
    setCurrentQuestion(0);
    setSelectedAnswer("");
    setAnswers([]);
    setScore(0);
    setTimerActive(false);
    setTimeRemaining(0);
  };

  const renderQuestionContent = (question: Question, isResult: boolean = false) => {
    const isMathCourse = courseTitle.toLowerCase().includes('math') || courseTitle.toLowerCase().includes('physics');
    const isCodeCourse = courseTitle.toLowerCase().includes('computer') || courseTitle.toLowerCase().includes('programming');

    return (
      <div className="space-y-4">
        <div className="text-lg font-medium">
          {isMathCourse ? (
            <MathRenderer>{question.question}</MathRenderer>
          ) : isCodeCourse ? (
            <CodeRenderer>{question.question}</CodeRenderer>
          ) : (
            question.question
          )}
        </div>
        
        <RadioGroup 
          value={isResult ? question.correct_answer.toString() : selectedAnswer} 
          onValueChange={!isResult ? setSelectedAnswer : undefined}
          disabled={isResult}
          className="space-y-3"
        >
          {question.options.map((option, index) => {
            const isCorrectAnswer = isResult && index === question.correct_answer;
            const isUserWrongAnswer = isResult && answers[currentQuestion] === index && index !== question.correct_answer;
            
            return (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem 
                  value={index.toString()} 
                  id={`option-${index}`}
                  className={isCorrectAnswer ? "border-green-500" : isUserWrongAnswer ? "border-red-500" : ""}
                />
                <Label 
                  htmlFor={`option-${index}`} 
                  className={`flex-1 cursor-pointer p-3 rounded-lg border transition-colors ${
                    isResult 
                      ? isCorrectAnswer 
                        ? "bg-green-500/20 border-green-500 text-green-300" 
                        : isUserWrongAnswer
                        ? "bg-red-500/20 border-red-500 text-red-300"
                        : "bg-bg-secondary/30"
                      : "bg-bg-secondary/30 hover:bg-bg-secondary/50"
                  }`}
                >
                  {isMathCourse ? (
                    <MathRenderer>{option}</MathRenderer>
                  ) : isCodeCourse ? (
                    <CodeRenderer>{option}</CodeRenderer>
                  ) : (
                    option
                  )}
                </Label>
              </div>
            );
          })}
        </RadioGroup>
        
        {isResult && question.explanation && (
          <div className="mt-4 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <h4 className="font-semibold text-blue-400 mb-2">Explanation:</h4>
            <div className="text-sm text-muted-foreground">
              {isMathCourse ? (
                <MathRenderer>{question.explanation}</MathRenderer>
              ) : isCodeCourse ? (
                <CodeRenderer>{question.explanation}</CodeRenderer>
              ) : (
                question.explanation
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <AntiCheatWrapper 
      isActive={quizStarted && !quizCompleted}
      onCheatDetected={() => {
        console.log("Cheat attempt detected during quiz");
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="bg-bg-secondary/50 backdrop-blur border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>📝 {courseTitle} Quiz</span>
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
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading quiz questions...</p>
              </div>
            ) : !quizStarted ? (
              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <h3 className="text-xl font-semibold">Quiz Settings</h3>
                  <p className="text-muted-foreground">
                    Configure your quiz before starting. Choose the number of questions and time limit.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="question-count">Number of Questions</Label>
                    <Select value={selectedQuestionCount} onValueChange={setSelectedQuestionCount}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select questions" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 20 }, (_, i) => (i + 1) * 5).map(count => (
                          <SelectItem key={count} value={count.toString()}>
                            {count} questions
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="time-limit">Time Limit</Label>
                    <Select value={selectedTimeLimit} onValueChange={setSelectedTimeLimit}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 5, 10, 15, 20, 30, 45, 60, 90, 120].map(minutes => (
                          <SelectItem key={minutes} value={minutes.toString()}>
                            {minutes} {minutes === 1 ? 'minute' : 'minutes'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="text-center">
                  <Button 
                    onClick={startQuiz} 
                    size="lg" 
                    className="px-8"
                    disabled={allQuestions.length === 0}
                  >
                    Start Quiz
                  </Button>
                </div>
                
                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-400 mb-2">Anti-Cheat Notice:</h4>
                  <ul className="text-sm text-yellow-300 space-y-1">
                    <li>• Right-clicking is disabled during the quiz</li>
                    <li>• Copy/paste functions are blocked</li>
                    <li>• Tab switching is monitored</li>
                    <li>• Screenshot attempts are detected</li>
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
                  <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Quiz Completed!</h3>
                  <div className="text-4xl font-bold text-brand-blue mb-2">{score}%</div>
                  <p className="text-muted-foreground">
                    You scored {score}% ({Math.round((score / 100) * questions.length)} out of {questions.length} questions correct)
                  </p>
                </motion.div>

                <div className="flex gap-4 justify-center">
                  <Button onClick={resetQuiz} variant="outline">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Retake Quiz
                  </Button>
                  <Button onClick={() => setShowResult(true)} variant="default">
                    View Explanations
                  </Button>
                </div>

                {showResult && (
                  <div className="space-y-6 mt-6">
                    <h4 className="text-xl font-semibold">Quiz Review & Explanations</h4>
                    {questions.map((question, index) => (
                      <Card key={question.id} className="bg-bg-primary/30">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Question {index + 1}</span>
                            <div className="flex items-center gap-2">
                              {answers[index] === question.correct_answer ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-500" />
                              )}
                              <span className="text-sm text-muted-foreground">
                                {answers[index] === question.correct_answer ? "Correct" : "Incorrect"}
                              </span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {renderQuestionContent(question, true)}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">
                    Question {currentQuestion + 1} of {questions.length}
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    {Math.round(((currentQuestion + 1) / questions.length) * 100)}% Complete
                  </div>
                </div>

                <Progress value={((currentQuestion + 1) / questions.length) * 100} />

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentQuestion}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {renderQuestionContent(questions[currentQuestion])}
                  </motion.div>
                </AnimatePresence>

                <div className="flex justify-between">
                  <Button
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                    variant="outline"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={currentQuestion === questions.length - 1 ? handleSubmit : handleNext}
                    disabled={!selectedAnswer}
                    variant={currentQuestion === questions.length - 1 ? "destructive" : "default"}
                  >
                    {currentQuestion === questions.length - 1 ? "Submit Quiz" : "Next"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AntiCheatWrapper>
  );
};

export default QuizComponent;