import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
}

interface GradeResult {
  question_number: number;
  score: number;
  feedback: string;
}

// Theory question banks by course topic area
const theoryQuestionBank: Record<string, string[]> = {
  "software": [
    "Explain the Software Development Life Cycle (SDLC) and compare at least two development methodologies.",
    "Describe the principles of SOLID in object-oriented design and give an example for each.",
    "What is the difference between functional and non-functional requirements? Give three examples of each.",
    "Explain the concept of software testing. Differentiate between unit testing, integration testing, and system testing.",
    "Discuss the importance of version control systems in software development. Explain branching strategies.",
    "What are design patterns? Explain the Singleton and Observer patterns with examples.",
    "Describe the Agile methodology. What are its advantages over the Waterfall model?",
    "Explain the concept of code refactoring. Why is it important and when should it be done?",
    "What is DevOps? Explain how CI/CD pipelines improve software delivery.",
    "Discuss software architecture patterns: monolithic, microservices, and serverless.",
  ],
  "database": [
    "Explain normalization in database design. Describe 1NF, 2NF, and 3NF with examples.",
    "What is the difference between SQL and NoSQL databases? When would you choose one over the other?",
    "Explain ACID properties of database transactions with real-world examples.",
    "Describe the Entity-Relationship (ER) model. How do you convert an ER diagram to relational tables?",
    "What is database indexing? Explain how B-tree indexes work and their impact on query performance.",
    "Explain the concept of database concurrency control. Discuss locking mechanisms.",
    "What is a distributed database? Discuss the CAP theorem and its implications.",
    "Explain data warehousing concepts. Differentiate between OLTP and OLAP systems.",
    "Describe SQL joins: INNER, LEFT, RIGHT, FULL OUTER. Give an example query for each.",
    "What is database security? Discuss SQL injection and how to prevent it.",
  ],
  "network": [
    "Compare the OSI and TCP/IP reference models. Explain the function of each layer.",
    "What is the difference between TCP and UDP? Give use cases for each protocol.",
    "Explain IP addressing and subnetting. Calculate the subnet mask for a network with 500 hosts.",
    "Describe the process of DNS resolution. What happens when you type a URL in a browser?",
    "What are firewalls? Explain the difference between packet filtering and application-level gateways.",
    "Explain the concept of routing. Compare distance-vector and link-state routing algorithms.",
    "What is network security? Discuss common attacks: DDoS, man-in-the-middle, phishing.",
    "Describe wireless network standards (802.11). Discuss security protocols: WEP, WPA, WPA2, WPA3.",
    "Explain the concept of VPN. How does it ensure secure communication over public networks?",
    "What is cloud networking? Discuss virtual networks and software-defined networking (SDN).",
  ],
  "ai": [
    "Explain the difference between supervised, unsupervised, and reinforcement learning with examples.",
    "What is a neural network? Describe the architecture of a feedforward neural network.",
    "Explain the concept of overfitting in machine learning. What techniques can prevent it?",
    "Describe the decision tree algorithm. What are its advantages and limitations?",
    "What is natural language processing (NLP)? Discuss its main applications and challenges.",
    "Explain the concept of computer vision. How do convolutional neural networks work?",
    "What are expert systems? Describe their components and give an application example.",
    "Discuss the ethical implications of artificial intelligence in society.",
    "Explain gradient descent optimization. What is the difference between batch, mini-batch, and stochastic?",
    "What is transfer learning? Explain how pre-trained models can be used for new tasks.",
  ],
  "security": [
    "Explain the CIA triad in information security. Give examples of threats to each component.",
    "What is cryptography? Compare symmetric and asymmetric encryption with examples.",
    "Describe common web security vulnerabilities: XSS, CSRF, SQL Injection. How can each be prevented?",
    "What is digital forensics? Describe the forensic investigation process.",
    "Explain the concept of access control. Compare DAC, MAC, and RBAC models.",
    "What is a hash function? Explain its properties and applications in security.",
    "Describe malware types: viruses, worms, trojans, ransomware. How do antivirus systems detect them?",
    "What is a security policy? Discuss its components and importance in an organization.",
    "Explain public key infrastructure (PKI). How do digital certificates work?",
    "Discuss social engineering attacks. What are the best practices to defend against them?",
  ],
  "general_cs": [
    "Explain the concept of computational complexity. What is the difference between P and NP problems?",
    "Describe the different types of operating system scheduling algorithms with their pros and cons.",
    "What is virtualization? Explain the difference between Type 1 and Type 2 hypervisors.",
    "Explain the concept of parallel computing. Discuss Amdahl's Law and its implications.",
    "What is the Internet of Things (IoT)? Discuss its architecture, applications, and security challenges.",
    "Describe cloud computing service models: IaaS, PaaS, SaaS. Give examples of each.",
    "Explain the concept of blockchain technology. How does consensus work in distributed ledgers?",
    "What are formal methods in software development? Discuss their advantages and limitations.",
    "Explain the MapReduce programming model. How is it used in big data processing?",
    "Describe the concept of Human-Computer Interaction. What are Nielsen's 10 usability heuristics?",
  ],
};

function getQuestionsForCourse(courseTitle: string, courseCode: string, count: number): string[] {
  const title = courseTitle.toLowerCase();
  const code = courseCode.toLowerCase();
  
  let pools: string[] = [];
  
  if (title.includes('software') || code.includes('301') || code.includes('302')) {
    pools = [...theoryQuestionBank.software];
  } else if (title.includes('database') || code.includes('206') || code.includes('402')) {
    pools = [...theoryQuestionBank.database];
  } else if (title.includes('network') || code.includes('305')) {
    pools = [...theoryQuestionBank.network];
  } else if (title.includes('artificial') || title.includes('machine learning') || code.includes('307') || code.includes('310')) {
    pools = [...theoryQuestionBank.ai];
  } else if (title.includes('security') || code.includes('403')) {
    pools = [...theoryQuestionBank.security];
  } else {
    pools = [...theoryQuestionBank.general_cs];
  }
  
  // Shuffle and pick
  const shuffled = pools.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

const TheoryQuizComponent = ({ courseId, courseTitle, courseCode }: TheoryQuizProps) => {
  const { user } = useAuth();
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [grading, setGrading] = useState(false);
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

  const startQuiz = () => {
    const count = parseInt(selectedCount);
    const qs = getQuestionsForCourse(courseTitle, courseCode, count);
    if (qs.length === 0) {
      toast.error("No theory questions available for this course");
      return;
    }
    setQuestions(qs);
    setAnswers(new Array(qs.length).fill(""));
    setCurrentQuestion(0);
    setQuizStarted(true);
    setQuizCompleted(false);
    setGrades([]);
    setTimeRemaining(parseInt(selectedTime) * 60);
    setTimerActive(true);
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
          questions,
          answers,
          courseTitle,
          courseCode,
          courseId,
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
                    Answer open-ended questions. Your responses will be graded by AI based on accuracy, completeness, and clarity.
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
                    <li>• Write detailed answers to each theory question</li>
                    <li>• AI grades each answer out of 10 marks</li>
                    <li>• Get instant feedback on each response</li>
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
                              <p className="font-medium text-sm text-muted-foreground mb-1">Question:</p>
                              <p>{q}</p>
                            </div>
                            <div>
                              <p className="font-medium text-sm text-muted-foreground mb-1">Your Answer:</p>
                              <p className="text-sm bg-bg-secondary/50 p-3 rounded-lg whitespace-pre-wrap">
                                {answers[i] || "(No answer provided)"}
                              </p>
                            </div>
                            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                              <p className="font-semibold text-blue-400 text-sm mb-1">AI Feedback:</p>
                              <p className="text-sm text-muted-foreground">{grade?.feedback || "No feedback available"}</p>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
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
                    {answers.filter(a => a.trim().length > 0).length} answered
                  </div>
                </div>

                <Progress value={((currentQuestion + 1) / questions.length) * 100} />

                <div className="space-y-4">
                  <div className="p-4 bg-bg-primary/50 rounded-lg border border-white/10">
                    <p className="font-medium">{questions[currentQuestion]}</p>
                  </div>

                  <Textarea
                    value={answers[currentQuestion]}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    placeholder="Write your detailed answer here... Be thorough and use technical terms where appropriate."
                    className="min-h-[200px] bg-bg-primary/60 border-white/20"
                  />
                  
                  <p className="text-xs text-muted-foreground">
                    {answers[currentQuestion].length} characters written
                  </p>
                </div>

                <div className="flex justify-between">
                  <Button
                    onClick={() => setCurrentQuestion(prev => prev - 1)}
                    disabled={currentQuestion === 0}
                    variant="outline"
                  >
                    Previous
                  </Button>
                  {currentQuestion === questions.length - 1 ? (
                    <Button onClick={handleSubmit} variant="destructive">
                      Submit for AI Grading
                    </Button>
                  ) : (
                    <Button onClick={() => setCurrentQuestion(prev => prev + 1)}>
                      Next
                    </Button>
                  )}
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
