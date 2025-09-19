import { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
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

// Mock course data - would come from database
const courseData: Record<string, any> = {
  "mth101": {
    code: "MTH 101",
    title: "Elementary Mathematics I",
    level: "100",
    semester: "First",
    units: 2,
    department: "Computer Science",
    status: "Compulsory",
    description: "This course covers fundamental mathematical concepts including algebra, trigonometry, and basic calculus. Students will develop problem-solving skills essential for computer science applications.",
    overview: "Elementary Mathematics I is designed to provide students with a solid foundation in mathematical concepts. The course emphasizes practical applications in computer science and prepares students for advanced mathematical courses.",
    textbooks: [
      { title: "Mathematics for Computer Science", author: "John Smith", year: 2023, downloadLink: "#" },
      { title: "Algebra and Trigonometry", author: "Jane Doe", year: 2022, downloadLink: "#" }
    ],
    materials: [
      { type: "video", title: "Introduction to Algebra", duration: "45 min", link: "#" },
      { type: "slides", title: "Trigonometric Functions", pages: 32, link: "#" },
      { type: "notes", title: "Course Notes - Week 1", link: "#" }
    ],
    pastQuestions: [
      { year: 2023, semester: "First", link: "#" },
      { year: 2022, semester: "First", link: "#" },
      { year: 2021, semester: "First", link: "#" }
    ],
    leaderboard: [
      { name: "John Doe", score: 98, avatar: "JD" },
      { name: "Jane Smith", score: 95, avatar: "JS" },
      { name: "Mike Johnson", score: 92, avatar: "MJ" }
    ]
  },
  "cos101": {
    code: "COS 101",
    title: "Introduction to Computing Sciences",
    level: "100",
    semester: "First",
    units: 3,
    department: "Computer Science",
    status: "Compulsory",
    description: "Introduction to fundamental computing concepts, programming basics, and computer systems.",
    overview: "This course introduces students to the world of computing, covering basic programming concepts, computer systems, and computational thinking.",
    textbooks: [
      { title: "Introduction to Computer Science", author: "Robert Williams", year: 2023, downloadLink: "#" }
    ],
    materials: [
      { type: "video", title: "Programming Fundamentals", duration: "60 min", link: "#" },
      { type: "slides", title: "Computer Systems Overview", pages: 45, link: "#" }
    ],
    pastQuestions: [
      { year: 2023, semester: "First", link: "#" },
      { year: 2022, semester: "First", link: "#" }
    ],
    leaderboard: [
      { name: "Sarah Connor", score: 97, avatar: "SC" },
      { name: "Tom Brady", score: 94, avatar: "TB" },
      { name: "Lisa Johnson", score: 91, avatar: "LJ" }
    ]
  }
};

const CourseDetail = () => {
  const { courseId } = useParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Mock authentication check - replace with actual auth logic
  useEffect(() => {
    // For demo purposes, we'll assume user is authenticated
    // In real app, check Supabase auth status
    setIsAuthenticated(true);
  }, []);

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const course = courseData[courseId || ""];
  
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
                <Badge variant={course.status === "Compulsory" ? "default" : "secondary"}>
                  {course.status}
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
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-brand-orange" />
                  <span>{course.department}</span>
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
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="textbooks">Textbooks</TabsTrigger>
                  <TabsTrigger value="materials">Materials</TabsTrigger>
                  <TabsTrigger value="questions">Past Questions</TabsTrigger>
                  <TabsTrigger value="quiz">Quiz</TabsTrigger>
                  <TabsTrigger value="community">Community</TabsTrigger>
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
                    {course.textbooks.map((book: any, index: number) => (
                      <motion.div
                        key={index}
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
                            <Button variant="outline" size="sm">
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
                    {course.materials.map((material: any, index: number) => (
                      <motion.div
                        key={index}
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
                                  {material.duration || `${material.pages} pages`}
                                </p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
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
                    {course.pastQuestions.map((question: any, index: number) => (
                      <motion.div
                        key={index}
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
                            <Button variant="outline" size="sm">
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
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className="grid md:grid-cols-2 gap-6">
                      <Card className="bg-gradient-primary text-white">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5" />
                            Take Quiz
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="mb-4 opacity-90">
                            Test your knowledge with interactive quizzes and track your progress.
                          </p>
                          <Button variant="glass" className="w-full">
                            Start Quiz
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="bg-bg-secondary/50 backdrop-blur border-white/10">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5" />
                            Leaderboard
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {course.leaderboard.map((user: any, index: number) => (
                              <div key={index} className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm font-medium">
                                  {user.avatar}
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium">{user.name}</p>
                                  <p className="text-sm text-muted-foreground">Score: {user.score}%</p>
                                </div>
                                <Badge variant="outline">#{index + 1}</Badge>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </motion.div>
                </TabsContent>

                <TabsContent value="community" className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Card className="bg-bg-secondary/50 backdrop-blur border-white/10">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MessageCircle className="h-5 w-5" />
                          Course Community
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-12">
                          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
                          <p className="text-muted-foreground">
                            Interactive community features will be available soon. Connect with classmates, ask questions, and share resources.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default CourseDetail;