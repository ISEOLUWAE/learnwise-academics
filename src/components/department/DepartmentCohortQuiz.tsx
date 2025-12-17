import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Plus, Loader2, Play, Square, CheckCircle, Trophy, Users, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface CohortQuiz {
  id: string;
  title: string;
  description: string | null;
  is_active: boolean;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string | null;
}

interface QuizResult {
  id: string;
  user_id: string;
  score: number;
  total_questions: number;
  completed_at: string;
  profile?: { username: string | null; full_name: string | null };
}

interface DepartmentCohortQuizProps {
  spaceId: string;
  canManage: boolean;
  isDeptAdmin?: boolean;
  isClassRep?: boolean;
}

export const DepartmentCohortQuiz = ({ spaceId, canManage, isDeptAdmin = false, isClassRep = false }: DepartmentCohortQuizProps) => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [quizzes, setQuizzes] = useState<CohortQuiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<CohortQuiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [showTakeQuizModal, setShowTakeQuizModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  
  // Create quiz form
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [creating, setCreating] = useState(false);
  
  // Add question form
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [addingQuestion, setAddingQuestion] = useState(false);
  
  // Take quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [userScore, setUserScore] = useState(0);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    fetchQuizzes();
  }, [spaceId]);

  useEffect(() => {
    if (selectedQuiz) {
      fetchQuestions(selectedQuiz.id);
      fetchResults(selectedQuiz.id);
      checkIfSubmitted(selectedQuiz.id);
    }
  }, [selectedQuiz]);

  const fetchQuizzes = async () => {
    try {
      const { data, error } = await supabase
        .from('cohort_quizzes')
        .select('*')
        .eq('department_space_id', spaceId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuizzes(data || []);
      if (data && data.length > 0) {
        setSelectedQuiz(data[0]);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async (quizId: string) => {
    try {
      const { data, error } = await supabase
        .from('cohort_quiz_questions')
        .select('*')
        .eq('quiz_id', quizId);

      if (error) throw error;
      setQuestions(data?.map(q => ({
        ...q,
        options: q.options as string[]
      })) || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const fetchResults = async (quizId: string) => {
    try {
      const { data, error } = await supabase
        .from('cohort_quiz_results')
        .select('*')
        .eq('quiz_id', quizId)
        .order('score', { ascending: false });

      if (error) throw error;

      const resultsWithProfiles = await Promise.all(
        (data || []).map(async (result) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, full_name')
            .eq('id', result.user_id)
            .single();
          return { ...result, profile };
        })
      );

      setResults(resultsWithProfiles);
    } catch (error) {
      console.error('Error fetching results:', error);
    }
  };

  const checkIfSubmitted = async (quizId: string) => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('cohort_quiz_results')
        .select('id')
        .eq('quiz_id', quizId)
        .eq('user_id', user.id)
        .single();

      setHasSubmitted(!!data);
    } catch {
      setHasSubmitted(false);
    }
  };

  const createQuiz = async () => {
    if (!quizTitle.trim() || !user) return;
    
    setCreating(true);
    try {
      const { error } = await supabase
        .from('cohort_quizzes')
        .insert({
          department_space_id: spaceId,
          title: quizTitle.trim(),
          description: quizDescription.trim() || null,
          created_by: user.id,
        });

      if (error) throw error;
      toast({ title: 'Quiz created!' });
      setShowCreateModal(false);
      setQuizTitle('');
      setQuizDescription('');
      fetchQuizzes();
    } catch (error) {
      console.error('Error creating quiz:', error);
      toast({ title: 'Failed to create quiz', variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const addQuestion = async () => {
    if (!questionText.trim() || !selectedQuiz || options.some(o => !o.trim())) return;
    
    setAddingQuestion(true);
    try {
      const { error } = await supabase
        .from('cohort_quiz_questions')
        .insert({
          quiz_id: selectedQuiz.id,
          question: questionText.trim(),
          options: options.map(o => o.trim()),
          correct_answer: correctAnswer,
          explanation: explanation.trim() || null,
        });

      if (error) throw error;
      toast({ title: 'Question added!' });
      setShowAddQuestionModal(false);
      setQuestionText('');
      setOptions(['', '', '', '']);
      setCorrectAnswer(0);
      setExplanation('');
      fetchQuestions(selectedQuiz.id);
    } catch (error) {
      console.error('Error adding question:', error);
      toast({ title: 'Failed to add question', variant: 'destructive' });
    } finally {
      setAddingQuestion(false);
    }
  };

  const deleteQuiz = async (quizId: string) => {
    if (!quizId) return;
    // confirm deletion
    if (!window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) return;

    try {
      // remove related results and questions first for safety
      await supabase.from('cohort_quiz_results').delete().eq('quiz_id', quizId);
      await supabase.from('cohort_quiz_questions').delete().eq('quiz_id', quizId);

      const { error } = await supabase
        .from('cohort_quizzes')
        .delete()
        .eq('id', quizId);

      if (error) throw error;
      toast({ title: 'Quiz deleted' });
      setSelectedQuiz(null);
      fetchQuizzes();
    } catch (err) {
      console.error('Error deleting quiz:', err);
      toast({ title: 'Failed to delete quiz', variant: 'destructive' });
    }
  };

  const toggleQuiz = async (activate: boolean) => {
    if (!selectedQuiz) return;
    
    try {
      const updateData: any = { is_active: activate };
      if (activate) {
        updateData.started_at = new Date().toISOString();
        updateData.ended_at = null;
      } else {
        updateData.ended_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('cohort_quizzes')
        .update(updateData)
        .eq('id', selectedQuiz.id);

      if (error) throw error;
      toast({ title: activate ? 'Quiz started!' : 'Quiz ended!' });
      fetchQuizzes();
    } catch (error) {
      console.error('Error toggling quiz:', error);
      toast({ title: 'Failed to update quiz', variant: 'destructive' });
    }
  };

  const startTakingQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers(new Array(questions.length).fill(-1));
    setQuizCompleted(false);
    setUserScore(0);
    setShowTakeQuizModal(true);
  };

  const submitQuiz = async () => {
    if (!selectedQuiz || !user) return;
    
    let score = 0;
    questions.forEach((q, i) => {
      if (selectedAnswers[i] === q.correct_answer) score++;
    });
    
    setUserScore(score);
    setQuizCompleted(true);

    try {
      const { error } = await supabase
        .from('cohort_quiz_results')
        .insert({
          quiz_id: selectedQuiz.id,
          user_id: user.id,
          score,
          total_questions: questions.length,
          answers: selectedAnswers,
        });

      if (error && error.code !== '23505') throw error;
      setHasSubmitted(true);
      fetchResults(selectedQuiz.id);
    } catch (error) {
      console.error('Error submitting quiz:', error);
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
    <div className="space-y-6 max-w-full overflow-x-hidden">
      {canManage && (
        <div className="flex justify-end gap-2">
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Quiz
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Cohort Quiz</DialogTitle>
                <DialogDescription>
                  Create a quiz for your department members to take together.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Quiz title"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Description (optional)"
                  value={quizDescription}
                  onChange={(e) => setQuizDescription(e.target.value)}
                  rows={3}
                />
                <Button onClick={createQuiz} disabled={creating || !quizTitle.trim()} className="w-full">
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Quiz'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {quizzes.length === 0 ? (
        <Card className="bg-bg-secondary/50 border-white/10">
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No quizzes created yet</p>
          </CardContent>
        </Card>
      ) : selectedQuiz && (
        <Card className="bg-bg-secondary/50 border-white/10">
          <CardHeader>
            <div className="space-y-4">
              {/* Title and status */}
              <div>
                <CardTitle className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-5 w-5 text-brand-blue flex-shrink-0" />
                  <span className="break-words">{selectedQuiz.title}</span>
                </CardTitle>
                <CardDescription className="flex flex-wrap items-center gap-2">
                  {selectedQuiz.is_active ? (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 flex-shrink-0">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  ) : selectedQuiz.ended_at ? (
                    <Badge variant="outline" className="flex-shrink-0">Ended</Badge>
                  ) : (
                    <Badge variant="outline" className="flex-shrink-0">Not Started</Badge>
                  )}
                  <span className="text-muted-foreground text-sm">
                    {questions.length} question{questions.length !== 1 ? 's' : ''}
                  </span>
                </CardDescription>
              </div>

              {/* Action buttons - responsive grid */}
              <div className="flex flex-wrap gap-2">
                {selectedQuiz.is_active && !hasSubmitted && questions.length > 0 && (
                  <Button onClick={startTakingQuiz} size="sm">
                    <Play className="h-4 w-4 mr-1" />
                    Take Quiz
                  </Button>
                )}
                <Button variant="outline" onClick={() => setShowResultsModal(true)} size="sm">
                  <Trophy className="h-4 w-4 mr-1" />
                  Results
                </Button>
                {canManage && (
                  <>
                    <Dialog open={showAddQuestionModal} onOpenChange={setShowAddQuestionModal}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-1" />
                          Add Question
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-[95vw] sm:max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Add Question</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Textarea
                            placeholder="Question"
                            value={questionText}
                            onChange={(e) => setQuestionText(e.target.value)}
                            rows={3}
                          />
                          {options.map((opt, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <input
                                type="radio"
                                checked={correctAnswer === i}
                                onChange={() => setCorrectAnswer(i)}
                              />
                              <Input
                                placeholder={`Option ${i + 1}`}
                                value={opt}
                                onChange={(e) => {
                                  const newOpts = [...options];
                                  newOpts[i] = e.target.value;
                                  setOptions(newOpts);
                                }}
                              />
                            </div>
                          ))}
                          <p className="text-xs text-muted-foreground">
                            Select the correct answer using the radio buttons
                          </p>
                          <Textarea
                            placeholder="Explanation (optional)"
                            value={explanation}
                            onChange={(e) => setExplanation(e.target.value)}
                            rows={2}
                          />
                          <Button 
                            onClick={addQuestion} 
                            disabled={addingQuestion || !questionText.trim() || options.some(o => !o.trim())}
                            className="w-full"
                          >
                            {addingQuestion ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Question'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant={selectedQuiz.is_active ? 'destructive' : 'default'}
                      onClick={() => toggleQuiz(!selectedQuiz.is_active)}
                      disabled={questions.length === 0}
                      size="sm"
                    >
                      {selectedQuiz.is_active ? (
                        <>
                          <Square className="h-4 w-4 mr-1" />
                          End Quiz
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-1" />
                          Start Quiz
                        </>
                      )}
                    </Button>
                    {(canManage || isDeptAdmin || isClassRep) && (
                      <Button
                        variant="destructive"
                        onClick={() => deleteQuiz(selectedQuiz.id)}
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          
          {hasSubmitted && (
            <CardContent>
              <p className="text-center text-green-400 flex items-center justify-center gap-2">
                <CheckCircle className="h-4 w-4" />
                You have completed this quiz
              </p>
            </CardContent>
          )}
        </Card>
      )}

      {/* Take Quiz Modal */}
      <Dialog open={showTakeQuizModal} onOpenChange={setShowTakeQuizModal}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="break-words">{selectedQuiz?.title}</DialogTitle>
          </DialogHeader>
          
          {!quizCompleted ? (
            <div className="space-y-6">
              <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} />
              <p className="text-sm text-muted-foreground">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
              
              {questions[currentQuestionIndex] && (
                <div className="space-y-4">
                  <p className="text-lg font-medium">{questions[currentQuestionIndex].question}</p>
                  <RadioGroup
                    value={String(selectedAnswers[currentQuestionIndex])}
                    onValueChange={(v) => {
                      const newAnswers = [...selectedAnswers];
                      newAnswers[currentQuestionIndex] = parseInt(v);
                      setSelectedAnswers(newAnswers);
                    }}
                  >
                    {questions[currentQuestionIndex].options.map((option, i) => (
                      <div key={i} className="flex items-center space-x-2 p-3 rounded-lg bg-white/5">
                        <RadioGroupItem value={String(i)} id={`option-${i}`} />
                        <Label htmlFor={`option-${i}`} className="flex-1 cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}
              
              <div className="flex gap-2 justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestionIndex(i => i - 1)}
                  disabled={currentQuestionIndex === 0}
                  size="sm"
                  className="flex-1"
                >
                  Previous
                </Button>
                {currentQuestionIndex === questions.length - 1 ? (
                  <Button
                    onClick={submitQuiz}
                    disabled={selectedAnswers.some(a => a === -1)}
                    size="sm"
                    className="flex-1"
                  >
                    Submit Quiz
                  </Button>
                ) : (
                  <Button
                    onClick={() => setCurrentQuestionIndex(i => i + 1)}
                    disabled={selectedAnswers[currentQuestionIndex] === -1}
                    size="sm"
                    className="flex-1"
                  >
                    Next
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 space-y-4">
              <Trophy className="h-16 w-16 mx-auto text-amber-400" />
              <h3 className="text-2xl font-bold">Quiz Completed!</h3>
              <p className="text-lg">
                Your Score: <span className="text-brand-blue font-bold">{userScore}/{questions.length}</span>
              </p>
              <p className="text-muted-foreground">
                {Math.round((userScore / questions.length) * 100)}% correct
              </p>
              <Button onClick={() => setShowTakeQuizModal(false)}>Close</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Results Modal */}
      <Dialog open={showResultsModal} onOpenChange={setShowResultsModal}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg overflow-x-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-400 flex-shrink-0" />
              <span className="break-words">Quiz Results</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {results.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No results yet</p>
            ) : (
              results.map((result, index) => (
                <div
                  key={result.id}
                  className={`flex items-center justify-between p-3 rounded-lg bg-white/5 ${
                    index === 0 ? 'border border-amber-500/30' : ''
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {index === 0 && <Trophy className="h-4 w-4 text-amber-400 flex-shrink-0" />}
                    <span className="break-words text-sm">@{result.profile?.username || result.profile?.full_name || 'Unknown'}</span>
                  </div>
                  <Badge variant="outline" className="flex-shrink-0">
                    {result.score}/{result.total_questions}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};