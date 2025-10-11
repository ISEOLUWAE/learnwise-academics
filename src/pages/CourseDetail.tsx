import { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Download, 
  Video, 
  FileText, 
  Trophy, 
  Users, 
  MessageCircle,
  Clock,
  GraduationCap,
  Play
} from "lucide-react";
import QuizComponent from "@/components/quiz/QuizComponent";
import QuizHistory from "@/components/quiz/QuizHistory";
import Leaderboard from "@/components/course/Leaderboard";
import Community from "@/components/course/Community";
import { supabase } from "@/integrations/supabase/client";
import { AdViewerModal } from "@/components/ads/AdViewerModal";
import { useAdVerification } from "@/hooks/useAdVerification";
import { toast } from "sonner";

interface Course {
  id: string;
  code: string;
  title: string;
  level: string;
  semester: string;
  units: number;
  department: string;
  status: string;
  description: string;
  overview: string;
}

interface Textbook {
  id: string;
  title: string;
  author: string;
  year: number;
  download_link: string;
}

interface Material {
  id: string;
  type: string;
  title: string;
  duration?: string;
  pages?: number;
  link: string;
}

interface PastQuestion {
  id: string;
  year: number;
  semester: string;
  link: string;
}

interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  avatar: string;
}

const CourseDetail = () => {
  const { courseCode } = useParams();
  const { user, loading } = useAuth();
  const { hasWatchedAds, loading: adLoading, markAdsAsWatched } = useAdVerification();
  const [course, setCourse] = useState<Course | null>(null);
  const [textbooks, setTextbooks] = useState<Textbook[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [pastQuestions, setPastQuestions] = useState<PastQuestion[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [courseLoading, setCourseLoading] = useState(true);
  const [showAdModal, setShowAdModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'download' | 'quiz' | null>(null);

  useEffect(() => {
    if (courseCode) {
      fetchCourseData();
    }
  }, [courseCode]);

  useEffect(() => {
    if (!course) return;

    // Subscribe to realtime updates for course materials
    const textbooksChannel = supabase
      .channel('textbooks-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'textbooks',
        filter: `course_id=eq.${course.id}`
      }, () => {
        fetchCourseData();
      })
      .subscribe();

    const materialsChannel = supabase
      .channel('materials-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'materials',
        filter: `course_id=eq.${course.id}`
      }, () => {
        fetchCourseData();
      })
      .subscribe();

    const pastQuestionsChannel = supabase
      .channel('past-questions-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'past_questions',
        filter: `course_id=eq.${course.id}`
      }, () => {
        fetchCourseData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(textbooksChannel);
      supabase.removeChannel(materialsChannel);
      supabase.removeChannel(pastQuestionsChannel);
    };
  }, [course]);

  const fetchCourseData = async () => {
    try {
      setCourseLoading(true);
      
      // Try to find course by exact code first, then try formatted version
      let courseData = null;
      let courseError = null;
      
      // First try with the exact code from URL (decode it first)
      const decodedCode = decodeURIComponent(courseCode || '');
      const exactResult = await supabase
        .from('courses')
        .select('*')
        .eq('code', decodedCode)
        .single();
      
      if (exactResult.data) {
        courseData = exactResult.data;
      } else {
        // If not found, try with formatted code (adding space between letters and numbers)
        const formattedCode = decodedCode.replace(/([a-zA-Z]+)(\d+)/, '$1 $2').toUpperCase();
        const formattedResult = await supabase
          .from('courses')
          .select('*')
          .eq('code', formattedCode)
          .single();
        
        courseData = formattedResult.data;
        courseError = formattedResult.error;
      }

      if (courseError) {
        console.error('Error fetching course:', courseError);
        return;
      }

      if (!courseData) {
        return;
      }

      setCourse(courseData);

      // Fetch related data
      const [textbooksResult, materialsResult, pastQuestionsResult, leaderboardResult] = await Promise.all([
        supabase.from('textbooks').select('*').eq('course_id', courseData.id),
        supabase.from('materials').select('*').eq('course_id', courseData.id),
        supabase.from('past_questions').select('*').eq('course_id', courseData.id),
        supabase.from('leaderboard').select('*').eq('course_id', courseData.id).order('score', { ascending: false })
      ]);

      if (textbooksResult.data) setTextbooks(textbooksResult.data);
      if (materialsResult.data) setMaterials(materialsResult.data);
      if (pastQuestionsResult.data) setPastQuestions(pastQuestionsResult.data);
      if (leaderboardResult.data) setLeaderboard(leaderboardResult.data);

    } catch (error) {
      console.error('Error fetching course data:', error);
    } finally {
      setCourseLoading(false);
    }
  };
  
  if (loading || courseLoading) {
    return (
      <Layout>
        <div className="pt-20 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!course) {
    return <Navigate to="/courses" replace />;
  }

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="h-4 w-4" />;
      case "slides": return <FileText className="h-4 w-4" />;
      case "notes": return <BookOpen className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const handleDownloadClick = (url: string) => {
    if (!hasWatchedAds) {
      setPendingAction('download');
      setShowAdModal(true);
    } else {
      window.open(url, '_blank');
    }
  };

  const handleQuizAccess = () => {
    if (!hasWatchedAds) {
      setPendingAction('quiz');
      setShowAdModal(true);
      return false;
    }
    return true;
  };

  const handleAdComplete = () => {
    markAdsAsWatched();
    setShowAdModal(false);
    
    if (pendingAction === 'download') {
      toast.success("You can now download files!");
    } else if (pendingAction === 'quiz') {
      toast.success("You can now start the quiz!");
    }
    
    setPendingAction(null);
  };

  return (
    <Layout>
      <div className="pt-20">
        {/* Course Header */}
        <section className="py-12 bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-tertiary">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl mx-auto"
            >
              <div className="flex items-center gap-4 mb-6">
                <Badge variant="outline" className="text-brand-blue border-brand-blue">
                  {course.code}
                </Badge>
                <Badge variant={course.status === "C" || course.status === "Compulsory" ? "default" : "secondary"}>
                  {course.status === "C" ? "Compulsory" : course.status === "E" ? "Elective" : course.status}
                </Badge>
                <Badge variant="outline">
                  {course.units} Units
                </Badge>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="hero-text">{course.title}</span>
              </h1>
              
              <p className="text-lg text-muted-foreground mb-6">
                {course.description}
              </p>
              
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-brand-blue" />
                  <span>Level {course.level}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-brand-green" />
                  <span>{course.semester} Semester</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Course Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <Tabs defaultValue="overview" className="space-y-8">
                <TabsList className="flex flex-wrap w-full justify-center gap-1 h-auto p-1.5 bg-bg-secondary/50 backdrop-blur border border-white/10 rounded-lg">
                  <TabsTrigger 
                    value="overview" 
                    className="flex-1 min-w-[80px] text-xs sm:text-sm px-3 py-2 rounded-md font-medium transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-primary/20"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger 
                    value="textbooks" 
                    className="flex-1 min-w-[80px] text-xs sm:text-sm px-3 py-2 rounded-md font-medium transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-primary/20"
                  >
                    Textbooks
                  </TabsTrigger>
                  <TabsTrigger 
                    value="materials" 
                    className="flex-1 min-w-[80px] text-xs sm:text-sm px-3 py-2 rounded-md font-medium transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-primary/20"
                  >
                    Materials
                  </TabsTrigger>
                  <TabsTrigger 
                    value="questions" 
                    className="flex-1 min-w-[80px] text-xs sm:text-sm px-3 py-2 rounded-md font-medium transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-primary/20"
                  >
                    Past Q's
                  </TabsTrigger>
                  <TabsTrigger 
                    value="quiz" 
                    className="flex-1 min-w-[80px] text-xs sm:text-sm px-3 py-2 rounded-md font-medium transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-primary/20"
                  >
                    Quiz
                  </TabsTrigger>
                  <TabsTrigger 
                    value="history" 
                    className="flex-1 min-w-[80px] text-xs sm:text-sm px-3 py-2 rounded-md font-medium transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-primary/20"
                  >
                    History
                  </TabsTrigger>
                  <TabsTrigger 
                    value="leaderboard" 
                    className="flex-1 min-w-[80px] text-xs sm:text-sm px-3 py-2 rounded-md font-medium transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-primary/20"
                  >
                    Board
                  </TabsTrigger>
                  <TabsTrigger 
                    value="community" 
                    className="flex-1 min-w-[80px] text-xs sm:text-sm px-3 py-2 rounded-md font-medium transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-primary/20"
                  >
                    Community
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Card className="bg-bg-secondary/50 backdrop-blur border-white/10">
                      <CardHeader>
                        <CardTitle>Course Overview</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground leading-relaxed">
                          {course.overview}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                <TabsContent value="textbooks" className="space-y-6">
                  <div className="grid gap-4">
                    {textbooks.map((book, index) => (
                      <motion.div
                        key={book.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                      >
                        <Card className="bg-bg-secondary/50 backdrop-blur border-white/10">
                          <CardContent className="flex items-center justify-between p-6">
                            <div>
                              <h3 className="font-semibold">{book.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                by {book.author} ({book.year})
                              </p>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDownloadClick(book.download_link)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="materials" className="space-y-6">
                  <div className="grid gap-4">
                    {materials.map((material, index) => (
                      <motion.div
                        key={material.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                      >
                        <Card className="bg-bg-secondary/50 backdrop-blur border-white/10">
                          <CardContent className="flex items-center justify-between p-6">
                            <div className="flex items-center gap-3">
                              {getMaterialIcon(material.type)}
                              <div>
                                <h3 className="font-semibold">{material.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {material.duration || (material.pages ? `${material.pages} pages` : '')}
                                </p>
                              </div>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDownloadClick(material.link)}
                            >
                              {material.type === "video" ? <Play className="h-4 w-4 mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                              {material.type === "video" ? "Watch" : "Download"}
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="questions" className="space-y-6">
                  <div className="grid gap-4">
                    {pastQuestions.map((question, index) => (
                      <motion.div
                        key={question.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                      >
                        <Card className="bg-bg-secondary/50 backdrop-blur border-white/10">
                          <CardContent className="flex items-center justify-between p-6">
                            <div>
                              <h3 className="font-semibold">{question.year} - {question.semester} Semester</h3>
                              <p className="text-sm text-muted-foreground">Past examination questions</p>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDownloadClick(question.link)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="quiz" className="space-y-6">
                  <QuizComponent 
                    courseId={course.id} 
                    courseTitle={course.title}
                    hasWatchedAds={hasWatchedAds}
                    onQuizAccess={handleQuizAccess}
                  />
                </TabsContent>

                <TabsContent value="history" className="space-y-6">
                  <QuizHistory courseId={course.id} courseTitle={course.title} />
                </TabsContent>

                <TabsContent value="leaderboard" className="space-y-6">
                  <Leaderboard courseId={course.id} />
                </TabsContent>

                <TabsContent value="community" className="space-y-6">
                  <Community courseId={course.id} courseTitle={course.title} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>
      </div>

      <AdViewerModal 
        open={showAdModal}
        onClose={() => setShowAdModal(false)}
        onComplete={handleAdComplete}
        video1Url=""
        video2Url=""
      />
    </Layout>
  );
};

export default CourseDetail;