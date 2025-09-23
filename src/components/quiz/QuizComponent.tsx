import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Trophy, RotateCcw } from "lucide-react";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizComponentProps {
  courseId: string;
  courseTitle: string;
}

// Sample quiz questions - would come from database
const quizQuestions: Record<string, Question[]> = {
  "mth101": [
    {
      id: 1,
      question: "What is the value of x in the equation 2x + 5 = 15?",
      options: ["5", "10", "15", "20"],
      correctAnswer: 0,
      explanation: "To solve 2x + 5 = 15, subtract 5 from both sides to get 2x = 10, then divide by 2 to get x = 5."
    },
    {
      id: 2,
      question: "What is sin(90°)?",
      options: ["0", "1", "-1", "undefined"],
      correctAnswer: 1,
      explanation: "sin(90°) = 1. This is a fundamental trigonometric value."
    },
    {
      id: 3,
      question: "What is the derivative of x²?",
      options: ["x", "2x", "x²", "2"],
      correctAnswer: 1,
      explanation: "Using the power rule, the derivative of x² is 2x."
    }
  ],
  "cos101": [
    {
      id: 1,
      question: "What does CPU stand for?",
      options: ["Central Processing Unit", "Computer Processing Unit", "Central Program Unit", "Computer Program Unit"],
      correctAnswer: 0,
      explanation: "CPU stands for Central Processing Unit, which is the main component that executes instructions."
    },
    {
      id: 2,
      question: "Which of the following is a programming language?",
      options: ["HTML", "CSS", "JavaScript", "HTTP"],
      correctAnswer: 2,
      explanation: "JavaScript is a programming language, while HTML and CSS are markup languages and HTTP is a protocol."
    },
    {
      id: 3,
      question: "What is binary code primarily composed of?",
      options: ["Letters A-Z", "Numbers 0-9", "Numbers 0-1", "Symbols"],
      correctAnswer: 2,
      explanation: "Binary code uses only 0s and 1s to represent information in computers."
    }
  ]
};

const QuizComponent = ({ courseId, courseTitle }: QuizComponentProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);

  const questions = quizQuestions[courseId] || [];

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

  const handleNext = () => {
    const answerIndex = parseInt(selectedAnswer);
    const newAnswers = [...answers, answerIndex];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer("");
    } else {
      // Quiz completed
      const correctCount = newAnswers.reduce((count, answer, index) => {
        return count + (answer === questions[index].correctAnswer ? 1 : 0);
      }, 0);
      setScore(correctCount);
      setQuizCompleted(true);
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
          const isCorrect = userAnswer === question.correctAnswer;
          
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
                    if (optionIndex === question.correctAnswer) {
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
                        {optionIndex === question.correctAnswer && (
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
                
                <div className="p-3 rounded-lg bg-blue-500/20 border border-blue-500/30">
                  <p className="text-sm">
                    <strong>Explanation:</strong> {question.explanation}
                  </p>
                </div>
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