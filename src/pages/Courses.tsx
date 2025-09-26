import { useState } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Calculator, Filter, BookOpen, Users, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import GPACalculator from "@/components/courses/GPACalculator";

// Sample course data - will be replaced with actual course data
const courses = [
  {
    id: "mth101",
    code: "MTH 101",
    title: "Elementary Mathematics I",
    level: "100",
    semester: "First",
    units: 2,
    department: "Computer Science",
    status: "Compulsory",
    students: 1250,
    description: "Algebra, trigonometry, and basic mathematical concepts"
  },
  {
    id: "cos101",
    code: "COS 101",
    title: "Introduction to Computing Sciences",
    level: "100",
    semester: "First",
    units: 3,
    department: "Computer Science",
    status: "Compulsory",
    students: 980,
    description: "Basic computing concepts and programming fundamentals"
  },
  {
    id: "gst111",
    code: "GST 111",
    title: "Communication in English",
    level: "100",
    semester: "First",
    units: 2,
    department: "Computer Science",
    status: "Compulsory",
    students: 1500,
    description: "Effective communication and academic writing skills"
  },
  {
    id: "phy101",
    code: "PHY 101",
    title: "General Physics I",
    level: "100",
    semester: "First",
    units: 2,
    department: "Computer Science",
    status: "Compulsory",
    students: 890,
    description: "Classical mechanics and wave motion principles"
  }
];

const Courses = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [showGPACalculator, setShowGPACalculator] = useState(false);
  const [filteredCourses, setFilteredCourses] = useState(courses);

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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Search Bar */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="lg:col-span-2"
              >
                <Card className="bg-bg-secondary/50 backdrop-blur border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="h-5 w-5" />
                      Course Search & Filter
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4 md:space-y-0 md:flex md:gap-4">
                      <div className="flex-1">
                        <Label htmlFor="search" className="text-sm font-medium mb-2 block">Course Title or Code</Label>
                        <Input
                          id="search"
                          placeholder="e.g., Mathematics, MTH 101"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="bg-bg-primary/50"
                        />
                      </div>
                      <div className="flex gap-4 md:w-auto">
                        <div className="flex-1 md:w-32">
                          <Label className="text-sm font-medium mb-2 block">Level</Label>
                          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                            <SelectTrigger className="bg-bg-primary/50">
                              <SelectValue placeholder="Level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="100">100 Level</SelectItem>
                              <SelectItem value="200">200 Level</SelectItem>
                              <SelectItem value="300">300 Level</SelectItem>
                              <SelectItem value="400">400 Level</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex-1 md:w-32">
                          <Label className="text-sm font-medium mb-2 block">Semester</Label>
                          <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                            <SelectTrigger className="bg-bg-primary/50">
                              <SelectValue placeholder="Semester" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="First">First</SelectItem>
                              <SelectItem value="Second">Second</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <Button onClick={handleSearch} className="w-full" variant="gradient">
                      <Filter className="h-4 w-4 mr-2" />
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
                <Card className="bg-gradient-primary text-white h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5" />
                      GPA Calculator
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 opacity-90">
                      Calculate your GPA and CGPA with our advanced calculator tool
                    </p>
                    <Button 
                      variant="glass" 
                      className="w-full"
                      onClick={() => setShowGPACalculator(true)}
                    >
                      Open Calculator
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* GPA Calculator Modal */}
        <GPACalculator 
          isOpen={showGPACalculator} 
          onClose={() => setShowGPACalculator(false)} 
        />

        {/* Courses List */}
        <section className="py-12">
          <div className="container mx-auto px-4">
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
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-brand-blue border-brand-blue">
                          {course.code}
                        </Badge>
                        <Badge variant={course.status === "Compulsory" ? "default" : "secondary"}>
                          {course.status}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{course.title}</CardTitle>
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
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-brand-green" />
                          <span>{course.students}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Level {course.level}</span>
                        <span>{course.semester} Semester</span>
                      </div>
                      
                      <Link to={`/course/${course.id}`}>
                        <Button variant="gradient" className="w-full">
                          View Course Details
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

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
