import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Calculator, Filter, BookOpen, Users, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import GPACalculator from "@/components/courses/GPACalculator";
import DepartmentalCourseListing from "@/components/courses/DepartmentalCourseListing";
import { supabase } from "@/integrations/supabase/client";
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
}

const Courses = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [showGPACalculator, setShowGPACalculator] = useState(false);
  const [showDepartmentalCourses, setShowDepartmentalCourses] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();

    // Set up real-time subscription
    const channel = supabase
      .channel('courses-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'courses'
        },
        () => {
          fetchCourses();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('level', { ascending: true })
        .order('code', { ascending: true });

      if (error) throw error;

      setCourses(data || []);
      setFilteredCourses(data || []);
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [searchTerm, selectedLevel, selectedSemester, courses]);

  const handleSearch = () => {
    const filtered = courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLevel = !selectedLevel || course.level === selectedLevel;
      const matchesSemester = !selectedSemester || course.semester === selectedSemester;
      
      return matchesSearch && matchesLevel && matchesSemester;
    });
    setFilteredCourses(filtered);
  };

  return (
    <Layout>
      <div className="pt-20">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-tertiary">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                <span className="hero-text">Courses</span> & Tools
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                Discover courses, calculate your GPA, and find the perfect academic resources for your journey
              </p>
            </motion.div>
          </div>
        </section>

        {/* Search and Tools Section */}
        <section className="py-12 bg-bg-secondary/30">
          <div className="container mx-auto px-4">
            {/* Navigation Tabs */}
            <div className="flex justify-center mb-8 px-4">
              <div className="bg-bg-secondary/50 backdrop-blur border-white/10 rounded-lg p-1 w-full max-w-2xl">
                <div className="grid grid-cols-2 gap-1">
                  <button
                    onClick={() => setShowDepartmentalCourses(false)}
                    className={`px-3 sm:px-6 py-3 rounded-md transition-all text-sm sm:text-base font-medium ${
                      !showDepartmentalCourses
                        ? 'bg-primary text-white shadow-md'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span className="hidden sm:inline">Course Search & Details</span>
                    <span className="sm:hidden">Search Courses</span>
                  </button>
                  <button
                    onClick={() => setShowDepartmentalCourses(true)}
                    className={`px-3 sm:px-6 py-3 rounded-md transition-all text-sm sm:text-base font-medium ${
                      showDepartmentalCourses
                        ? 'bg-primary text-white shadow-md'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span className="hidden sm:inline">Departmental Course Listings</span>
                    <span className="sm:hidden">Dept. Courses</span>
                  </button>
                </div>
              </div>
            </div>

            {showDepartmentalCourses ? (
              <DepartmentalCourseListing />
            ) : (
              <div className="space-y-6">
              {/* Search Bar */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="bg-gradient-to-br from-bg-secondary/80 to-bg-tertiary/80 backdrop-blur border-white/20 shadow-xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-2 rounded-lg bg-primary/20">
                        <Search className="h-5 w-5 text-primary" />
                      </div>
                      Course Search & Filter
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">
                      Search for courses by title, code, level, or semester
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="search" className="text-sm font-semibold mb-2 block flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-primary" />
                          Course Title or Code
                        </Label>
                        <Input
                          id="search"
                          placeholder="e.g., Mathematics, MTH 101"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="bg-bg-primary/60 border-white/30 focus:border-primary h-12"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-semibold mb-2 block flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary" />
                            Level
                          </Label>
                          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                            <SelectTrigger className="bg-bg-primary/60 border-white/30 focus:border-primary h-12">
                              <SelectValue placeholder="Level" />
                            </SelectTrigger>
                            <SelectContent className="bg-background border-white/20">
                              <SelectItem value="100">100 Level</SelectItem>
                              <SelectItem value="200">200 Level</SelectItem>
                              <SelectItem value="300">300 Level</SelectItem>
                              <SelectItem value="400">400 Level</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm font-semibold mb-2 block flex items-center gap-2">
                            <Filter className="h-4 w-4 text-primary" />
                            Semester
                          </Label>
                          <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                            <SelectTrigger className="bg-bg-primary/60 border-white/30 focus:border-primary h-12">
                              <SelectValue placeholder="Semester" />
                            </SelectTrigger>
                            <SelectContent className="bg-background border-white/20">
                              <SelectItem value="First">First</SelectItem>
                              <SelectItem value="Second">Second</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <Button onClick={handleSearch} className="w-full h-12 text-base font-semibold" variant="gradient">
                      <Search className="h-5 w-5 mr-2" />
                      Search Courses
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* GPA Calculator Access */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="bg-gradient-primary text-white shadow-xl border-primary/20">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-2 rounded-lg bg-white/20">
                        <Calculator className="h-5 w-5" />
                      </div>
                      GPA Calculator
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-6 opacity-90 text-sm sm:text-base">
                      Calculate your GPA and CGPA with our advanced calculator tool
                    </p>
                    <Button 
                      variant="glass" 
                      className="w-full h-12 text-base font-semibold"
                      onClick={() => setShowGPACalculator(true)}
                    >
                      <Calculator className="h-5 w-5 mr-2" />
                      Open Calculator
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
              </div>
            )}
          </div>
        </section>

        {/* GPA Calculator Modal */}
        <GPACalculator 
          isOpen={showGPACalculator} 
          onClose={() => setShowGPACalculator(false)} 
        />

        {/* Courses List */}
        {!showDepartmentalCourses && (
          <section className="py-12">
            <div className="container mx-auto px-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="mb-8"
                >
                  <h2 className="text-2xl font-bold mb-2">Available Courses</h2>
                  <p className="text-muted-foreground">
                    Found {filteredCourses.length} courses matching your criteria
                  </p>
                </motion.div>

                {filteredCourses.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg text-muted-foreground">No courses found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="card-hover bg-bg-secondary/50 backdrop-blur border-white/10 h-full">
                    <CardHeader>
                      <CardTitle className="text-lg mb-3">{course.title}</CardTitle>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-brand-blue border-brand-blue">
                          {course.code}
                        </Badge>
                        <Badge variant={course.status === "C" || course.status === "Compulsory" ? "default" : "secondary"}>
                          {course.status === "C" ? "Compulsory" : course.status === "E" ? "Elective" : course.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span>Level {course.level}</span>
                        <span>{course.semester} Semester</span>
                      </div>
                    </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-muted-foreground text-sm">
                          {course.description}
                        </p>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4 text-brand-blue" />
                            <span>{course.units} Units</span>
                          </div>
                        </div>
                        
                        <Link to={`/course/${encodeURIComponent(course.code)}`}>
                          <Button variant="gradient" className="w-full">
                            View Course Details
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </motion.div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </section>
        )}

        {/* Course Finder Results Summary */}
        <section className="py-12 bg-bg-secondary/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h2 className="text-2xl font-bold mb-4">Need More Help?</h2>
              <p className="text-muted-foreground mb-6">
                Can't find what you're looking for? Our support team is here to help you navigate your academic journey.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button variant="outline" size="lg">
                  Contact Support
                </Button>
                <Button variant="gradient" size="lg">
                  Browse All Departments
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Courses;
