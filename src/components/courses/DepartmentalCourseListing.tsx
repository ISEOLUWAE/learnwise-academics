import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BookOpen, Loader2, Search, ChevronDown, Calendar, GraduationCap, Users, Calculator } from "lucide-react";

interface DepartmentalCourse {
  id: string;
  department: string;
  level: string;
  semester: string;
  session: string;
  course_code: string;
  course_title: string;
  units: number;
  status: string;
}

const DepartmentalCourseListing = () => {
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [courses, setCourses] = useState<DepartmentalCourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Available departments - you can expand this list
  const departments = [
    "Medicine and Surgery",
    "Computer Science",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Chemical Engineering",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Economics",
    "Business Administration",
    "Accounting",
    "Mass Communication",
    "Political Science",
    "Psychology",
    "Sociology",
    "English",
    "History",
    "Geography"
  ];

  const levels = ["100", "200", "300", "400", "500"];
  const semesters = ["1st Semester", "2nd Semester"];
  const sessions = ["2023/2024", "2024/2025"]; // You can make this dynamic

  const handleSearch = async () => {
    if (!selectedLevel || !selectedDepartment || !selectedSemester) {
      toast.error("Please select level, department, and semester");
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const { data, error } = await supabase
        .from('departmental_courses')
        .select('*')
        .eq('department', selectedDepartment)
        .eq('level', selectedLevel)
        .eq('semester', selectedSemester.toLowerCase())
        .order('course_code', { ascending: true });

      if (error) throw error;

      setCourses(data || []);
      
      if (data && data.length === 0) {
        toast.info("No courses found for the selected criteria");
      }
    } catch (error: any) {
      console.error('Error fetching departmental courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setCourses([]);
    setHasSearched(false);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'compulsory':
        return 'bg-blue-500 text-white';
      case 'elective':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getSemesterDisplayName = (semester: string) => {
    if (semester.toLowerCase().includes('1st') || semester.toLowerCase() === 'first') {
      return 'First Semester';
    } else if (semester.toLowerCase().includes('2nd') || semester.toLowerCase() === 'second') {
      return 'Second Semester';
    }
    return semester;
  };

  const getSemesterBadgeColor = (semester: string) => {
    if (semester.toLowerCase().includes('1st') || semester.toLowerCase() === 'first') {
      return 'bg-blue-500 text-white';
    } else if (semester.toLowerCase().includes('2nd') || semester.toLowerCase() === 'second') {
      return 'bg-green-500 text-white';
    }
    return 'bg-gray-500 text-white';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 rounded-full bg-primary/10">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Departmental Course Listings
          </h2>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Search for courses offered in your department for a specific level and semester. 
          Get detailed information about compulsory and elective courses.
        </p>
      </div>

      {/* Search Form */}
      <Card className="bg-gradient-to-br from-bg-secondary/80 to-bg-tertiary/80 backdrop-blur border-white/20 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-lg bg-primary/20">
              <Search className="h-5 w-5 text-primary" />
            </div>
            Course Search Criteria
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Select your academic level, department, and semester to view available courses
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Level Selection */}
            <div className="space-y-3">
              <label className="text-sm font-semibold flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary" />
                Academic Level
              </label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="bg-bg-primary/60 border-white/30 focus:border-primary h-12">
                  <SelectValue placeholder="Select Level" />
                </SelectTrigger>
                <SelectContent className="bg-background border-white/20 z-50">
                  {levels.map((level) => (
                    <SelectItem key={level} value={level}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{level}</span>
                        <span className="text-xs text-muted-foreground">Level</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Department Selection */}
            <div className="space-y-3">
              <label className="text-sm font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Department
              </label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="bg-bg-primary/60 border-white/30 focus:border-primary h-12">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent className="bg-background border-white/20 z-50">
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Semester Selection */}
            <div className="space-y-3">
              <label className="text-sm font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Semester
              </label>
              <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                <SelectTrigger className="bg-bg-primary/60 border-white/30 focus:border-primary h-12">
                  <SelectValue placeholder="Select Semester" />
                </SelectTrigger>
                <SelectContent className="bg-background border-white/20 z-50">
                  {semesters.map((semester) => (
                    <SelectItem key={semester} value={semester}>
                      <div className="flex items-center gap-2">
                        <Badge className={getSemesterBadgeColor(semester)}>
                          {semester}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleSearch} 
              disabled={loading || !selectedLevel || !selectedDepartment || !selectedSemester}
              className="flex-1 h-12 text-base font-semibold"
              variant="gradient"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  <span className="hidden sm:inline">Searching Courses...</span>
                  <span className="sm:hidden">Searching...</span>
                </>
              ) : (
                <>
                  <Search className="h-5 w-5 mr-2" />
                  Search Courses
                </>
              )}
            </Button>
            
            {hasSearched && (
              <Button 
                onClick={clearResults} 
                variant="outline" 
                className="h-12 px-6 border-white/30 hover:bg-white/10"
              >
                Clear Results
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {hasSearched && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Results Header */}
          <Card className="bg-gradient-to-r from-primary/10 via-blue-500/10 to-purple-500/10 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    Course Listings
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <Badge variant="outline" className="text-xs">
                      <GraduationCap className="h-3 w-3 mr-1" />
                      {selectedLevel} Level
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Users className="h-3 w-3 mr-1" />
                      {selectedDepartment}
                    </Badge>
                    <Badge className={getSemesterBadgeColor(selectedSemester)}>
                      <Calendar className="h-3 w-3 mr-1" />
                      {getSemesterDisplayName(selectedSemester)}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">{courses.length}</div>
                  <div className="text-sm text-muted-foreground">Courses Found</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Course Results */}
          <Card className="bg-bg-secondary/50 backdrop-blur border-white/10 shadow-xl">
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    <p className="text-muted-foreground">Loading courses...</p>
                  </div>
                </div>
              ) : courses.length === 0 ? (
                <div className="text-center py-12 px-6">
                  <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-4">
                    <BookOpen className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">No Courses Found</h4>
                  <p className="text-muted-foreground mb-4">
                    No courses are currently available for the selected criteria.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Try selecting different options or contact your department for course information.
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden">
                  {/* Summary Stats */}
                  <div className="bg-gradient-to-r from-primary/5 to-blue-500/5 p-4 border-b border-white/10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                      <div className="space-y-1">
                        <div className="text-2xl font-bold text-primary">
                          {courses.reduce((sum, course) => sum + course.units, 0)}
                        </div>
                        <div className="text-xs text-muted-foreground">Total Units</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-2xl font-bold text-blue-600">
                          {courses.filter(c => c.status.toLowerCase() === 'compulsory' || c.status === 'C').length}
                        </div>
                        <div className="text-xs text-muted-foreground">Compulsory</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-2xl font-bold text-green-600">
                          {courses.filter(c => c.status.toLowerCase() === 'elective' || c.status === 'E').length}
                        </div>
                        <div className="text-xs text-muted-foreground">Elective</div>
                      </div>
                    </div>
                  </div>

                  {/* Course Table */}
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/10">
                          <TableHead className="text-muted-foreground font-semibold">#</TableHead>
                          <TableHead className="text-muted-foreground font-semibold">Course Code</TableHead>
                          <TableHead className="text-muted-foreground font-semibold">Course Title</TableHead>
                          <TableHead className="text-muted-foreground font-semibold">Status</TableHead>
                          <TableHead className="text-muted-foreground font-semibold">Units</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {courses.map((course, index) => (
                          <TableRow key={course.id} className="border-white/5 hover:bg-white/5 transition-colors">
                            <TableCell className="font-medium text-muted-foreground">
                              {index + 1}.
                            </TableCell>
                            <TableCell className="font-mono font-semibold text-primary">
                              {course.course_code}
                            </TableCell>
                            <TableCell className="font-medium">
                              {course.course_title}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={course.status.toLowerCase() === 'compulsory' || course.status === 'C' ? 'default' : 'secondary'}
                                className="capitalize"
                              >
                                {course.status === 'C' ? 'Compulsory' : course.status === 'E' ? 'Elective' : course.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium flex items-center gap-1">
                              <Calculator className="h-3 w-3 text-muted-foreground" />
                              {course.units}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default DepartmentalCourseListing;

