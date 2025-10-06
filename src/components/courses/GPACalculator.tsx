import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash2, Plus, Calculator, Award, BookOpen, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Course {
  id: string;
  name: string;
  unit: number;
  score: number;
  gradePoint: number;
}

interface GPACalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

const GPACalculator = ({ isOpen, onClose }: GPACalculatorProps) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [newCourse, setNewCourse] = useState({ name: "", unit: "", score: "" });
  const [semesters, setSemesters] = useState<Array<{ tugp: string; units: string }>>([]);
  const [newSemester, setNewSemester] = useState({ tugp: "", units: "" });
  const [showCGPA, setShowCGPA] = useState(false);
  const { toast } = useToast();

  const getGradePoint = (score: number): number => {
    if (score >= 70) return 5;
    if (score >= 60) return 4;
    if (score >= 50) return 3;
    if (score >= 45) return 2;
    if (score >= 40) return 1;
    return 0;
  };

  const getGradeLetter = (gradePoint: number): string => {
    const grades: Record<number, string> = {
      5: "A", 4: "B", 3: "C", 2: "D", 1: "E", 0: "F"
    };
    return grades[gradePoint] || "F";
  };

  const getClassification = (gpa: number): string => {
    if (gpa >= 4.50) return "First Class Honours";
    if (gpa >= 3.50) return "Second Class Honours (Upper Division)";
    if (gpa >= 2.40) return "Second Class Honours (Lower Division)";
    if (gpa >= 1.50) return "Third Class Honours";
    if (gpa >= 1.00) return "Pass";
    return "Fail";
  };

  const formatGPA = (gpa: number): string => {
    if (gpa === 5.00) return "5.00";
    if (gpa >= 4.995 && gpa < 5.00) return "4.99";
    return gpa.toFixed(2);
  };

  const addCourse = () => {
    if (!newCourse.unit || !newCourse.score) {
      toast({
        title: "Missing Information",
        description: "Please fill in unit and score",
        variant: "destructive"
      });
      return;
    }

    const unit = parseInt(newCourse.unit);
    const score = parseFloat(newCourse.score);

    if (unit <= 0 || score < 0 || score > 100) {
      toast({
        title: "Invalid Input",
        description: "Please enter valid unit (>0) and score (0-100)",
        variant: "destructive"
      });
      return;
    }

    const gradePoint = getGradePoint(score);
    const course: Course = {
      id: Date.now().toString(),
      name: newCourse.name || `Course ${courses.length + 1}`,
      unit,
      score,
      gradePoint
    };

    setCourses(prev => [...prev, course]);
    setNewCourse({ name: "", unit: "", score: "" });

    toast({
      title: "Course Added",
      description: `${course.name} has been added successfully`,
    });
  };

  const removeCourse = (id: string) => {
    setCourses(prev => prev.filter(course => course.id !== id));
  };

  const calculateGPA = () => {
    if (courses.length === 0) return 0;

    const totalTUGP = courses.reduce((sum, course) => sum + (course.gradePoint * course.unit), 0);
    const totalUnits = courses.reduce((sum, course) => sum + course.unit, 0);

    return totalTUGP / totalUnits;
  };

  const calculateCGPA = () => {
    if (semesters.length === 0) return null;

    const currentTUGP = courses.reduce((sum, course) => sum + (course.gradePoint * course.unit), 0);
    const currentUnits = courses.reduce((sum, course) => sum + course.unit, 0);

    // Sum all previous semesters' TUGPs and units
    const previousTotalTUGP = semesters.reduce((sum, sem) => sum + parseFloat(sem.tugp || "0"), 0);
    const previousTotalUnits = semesters.reduce((sum, sem) => sum + parseFloat(sem.units || "0"), 0);

    const totalTUGP = previousTotalTUGP + currentTUGP;
    const totalUnits = previousTotalUnits + currentUnits;

    if (totalUnits === 0) return null;
    return totalTUGP / totalUnits;
  };

  const addSemester = () => {
    if (!newSemester.tugp || !newSemester.units) {
      toast({
        title: "Missing Information",
        description: "Please fill in both TUGP and Units",
        variant: "destructive"
      });
      return;
    }

    const tugp = parseFloat(newSemester.tugp);
    const units = parseFloat(newSemester.units);

    if (tugp < 0 || units <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter valid TUGP (≥0) and Units (>0)",
        variant: "destructive"
      });
      return;
    }

    setSemesters(prev => [...prev, { tugp: newSemester.tugp, units: newSemester.units }]);
    setNewSemester({ tugp: "", units: "" });

    toast({
      title: "Semester Added",
      description: "Previous semester record added successfully",
    });
  };

  const removeSemester = (index: number) => {
    setSemesters(prev => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setCourses([]);
    setSemesters([]);
    setNewSemester({ tugp: "", units: "" });
    setShowCGPA(false);
  };

  const currentGPA = calculateGPA();
  const cgpa = calculateCGPA();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-full sm:max-w-4xl max-h-[90vh] overflow-y-auto mx-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl sm:text-2xl">
            <Calculator className="h-5 w-5 sm:h-6 sm:w-6" />
            GPA Calculator
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add Course Form */}
          <Card className="bg-bg-secondary/50 backdrop-blur border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add Course
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                <div className="sm:col-span-2 md:col-span-1">
                  <Label htmlFor="courseName" className="text-sm">Course Name (Optional)</Label>
                  <Input
                    id="courseName"
                    placeholder="e.g., Mathematics"
                    value={newCourse.name}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, name: e.target.value }))}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="courseUnit" className="text-sm">Course Unit</Label>
                  <Input
                    id="courseUnit"
                    type="number"
                    placeholder="e.g., 3"
                    value={newCourse.unit}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, unit: e.target.value }))}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="courseScore" className="text-sm">Score (0-100)</Label>
                  <Input
                    id="courseScore"
                    type="number"
                    placeholder="e.g., 85"
                    value={newCourse.score}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, score: e.target.value }))}
                    className="text-sm"
                  />
                </div>
              </div>
              <Button onClick={addCourse} className="w-full" variant="gradient" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Course
              </Button>
            </CardContent>
          </Card>

          {/* CGPA Calculation Option */}
          {!showCGPA && (
            <Card className="bg-bg-secondary/50 backdrop-blur border-white/10">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCGPA(true)}
                    className="flex items-center gap-2"
                  >
                    <BookOpen className="h-4 w-4" />
                    Calculate CGPA (Include Previous Results)
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Previous Results Input */}
          <AnimatePresence>
            {showCGPA && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-brand-blue/10 border-brand-blue/20">
                  <CardHeader>
                    <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <span className="flex items-center gap-2 text-base sm:text-lg">
                        <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                        Previous Academic Records
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowCGPA(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Add each semester's TUGP and Units separately (e.g., 100L First Semester, 100L Second Semester, etc.)
                    </p>
                    
                    {/* Add Semester Form */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="semesterTUGP">Semester TUGP</Label>
                        <Input
                          id="semesterTUGP"
                          type="number"
                          step="0.01"
                          placeholder="e.g., 37.5"
                          value={newSemester.tugp}
                          onChange={(e) => setNewSemester(prev => ({ ...prev, tugp: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="semesterUnits">Semester Units</Label>
                        <Input
                          id="semesterUnits"
                          type="number"
                          placeholder="e.g., 9"
                          value={newSemester.units}
                          onChange={(e) => setNewSemester(prev => ({ ...prev, units: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <Button onClick={addSemester} className="w-full" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Semester
                    </Button>

                    {/* Previous Semesters List */}
                    {semesters.length > 0 && (
                      <div className="space-y-2 mt-4">
                        <Label className="text-sm font-semibold">Added Semesters ({semesters.length})</Label>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {semesters.map((sem, index) => (
                            <div key={index} className="flex items-center justify-between p-2 rounded bg-bg-primary/50 text-sm">
                              <div>
                                <span className="font-medium">Semester {index + 1}: </span>
                                TUGP: {sem.tugp}, Units: {sem.units}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSemester(index)}
                                className="h-7 w-7 p-0"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <div className="pt-2 border-t border-white/10 text-sm">
                          <p><strong>Total Previous TUGP:</strong> {semesters.reduce((sum, s) => sum + parseFloat(s.tugp || "0"), 0).toFixed(2)}</p>
                          <p><strong>Total Previous Units:</strong> {semesters.reduce((sum, s) => sum + parseFloat(s.units || "0"), 0)}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Courses List */}
          {courses.length > 0 && (
            <Card className="bg-bg-secondary/50 backdrop-blur border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Courses ({courses.length})</span>
                  <Button variant="destructive" size="sm" onClick={clearAll}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {courses.map((course, index) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg bg-bg-primary/50 gap-2"
                    >
                      <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs sm:text-sm font-bold flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm sm:text-base truncate">{course.name}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {course.unit} units • Score: {course.score}% • Grade: {getGradeLetter(course.gradePoint)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                        <Badge variant="outline" className="text-brand-green border-brand-green text-xs sm:text-sm">
                          {course.gradePoint} GP
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCourse(course.id)}
                          className="text-red-500 hover:text-red-600 h-8 w-8 p-0"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {courses.length > 0 && (
            <Card className="bg-gradient-primary text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="text-center p-3 sm:p-4 rounded-lg bg-white/10">
                    <h3 className="text-base sm:text-lg font-semibold mb-2">Current GPA</h3>
                    <p className="text-2xl sm:text-3xl font-bold">{formatGPA(currentGPA)}</p>
                    <p className="text-xs sm:text-sm opacity-90">{getClassification(currentGPA)}</p>
                  </div>
                  
                  {cgpa !== null && (
                    <div className="text-center p-3 sm:p-4 rounded-lg bg-white/10">
                      <h3 className="text-base sm:text-lg font-semibold mb-2">CGPA</h3>
                      <p className="text-2xl sm:text-3xl font-bold">{formatGPA(cgpa)}</p>
                      <p className="text-xs sm:text-sm opacity-90">{getClassification(cgpa)}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                  <div>
                    <span className="opacity-90">Current Units:</span>
                    <p className="font-semibold">{courses.reduce((sum, course) => sum + course.unit, 0)}</p>
                  </div>
                  <div>
                    <span className="opacity-90">Current TUGP:</span>
                    <p className="font-semibold">{courses.reduce((sum, course) => sum + (course.gradePoint * course.unit), 0).toFixed(2)}</p>
                  </div>
                  {cgpa !== null && (
                    <>
                      <div>
                        <span className="opacity-90">Total Units:</span>
                        <p className="font-semibold">
                          {courses.reduce((sum, course) => sum + course.unit, 0) + 
                           semesters.reduce((sum, s) => sum + parseFloat(s.units || "0"), 0)}
                        </p>
                      </div>
                      <div>
                        <span className="opacity-90">Total TUGP:</span>
                        <p className="font-semibold">
                          {(courses.reduce((sum, course) => sum + (course.gradePoint * course.unit), 0) + 
                            semesters.reduce((sum, s) => sum + parseFloat(s.tugp || "0"), 0)).toFixed(2)}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Grading System Reference */}
          <Card className="bg-bg-secondary/50 backdrop-blur border-white/10">
            <CardHeader>
              <CardTitle>Grading System</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div className="space-y-1">
                  <p className="font-semibold">70-100: A (5 points)</p>
                  <p className="font-semibold">60-69: B (4 points)</p>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold">50-59: C (3 points)</p>
                  <p className="font-semibold">45-49: D (2 points)</p>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold">40-44: E (1 point)</p>
                  <p className="font-semibold">0-39: F (0 points)</p>
                </div>
              </div>
              
              <div className="mt-4 sm:mt-6 pt-4 border-t border-white/10">
                <h4 className="font-semibold mb-2 text-sm sm:text-base">Degree Classification:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 text-xs sm:text-sm">
                  <p>4.50 – 5.00: First Class Honours</p>
                  <p>3.50 – 4.49: Second Class Honours (Upper)</p>
                  <p>2.40 – 3.49: Second Class Honours (Lower)</p>
                  <p>1.50 – 2.39: Third Class Honours</p>
                  <p>1.00 – 1.49: Pass</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GPACalculator;