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
      <DialogContent className="w-[calc(100vw-2rem)] max-w-[min(95vw,56rem)] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="space-y-2">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl md:text-2xl">
            <Calculator className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
            <span className="truncate">GPA Calculator</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Add Course Form */}
          <Card className="bg-bg-secondary/50 backdrop-blur border-white/10">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                Add Course
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="flex flex-col gap-3 sm:gap-4">
                <div className="w-full">
                  <Label htmlFor="courseName" className="text-xs sm:text-sm mb-1.5 block">Course Name (Optional)</Label>
                  <Input
                    id="courseName"
                    placeholder="e.g., Mathematics"
                    value={newCourse.name}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, name: e.target.value }))}
                    className="h-11 sm:h-10 text-sm w-full"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label htmlFor="courseUnit" className="text-xs sm:text-sm mb-1.5 block">Course Unit</Label>
                    <Input
                      id="courseUnit"
                      type="number"
                      placeholder="e.g., 3"
                      value={newCourse.unit}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, unit: e.target.value }))}
                      className="h-11 sm:h-10 text-sm w-full"
                    />
                  </div>
                  <div>
                    <Label htmlFor="courseScore" className="text-xs sm:text-sm mb-1.5 block">Score (0-100)</Label>
                    <Input
                      id="courseScore"
                      type="number"
                      placeholder="e.g., 85"
                      value={newCourse.score}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, score: e.target.value }))}
                      className="h-11 sm:h-10 text-sm w-full"
                    />
                  </div>
                </div>
              </div>
              <Button onClick={addCourse} className="w-full h-11 sm:h-10" variant="gradient">
                <Plus className="h-4 w-4 mr-2" />
                Add Course
              </Button>
            </CardContent>
          </Card>

          {/* CGPA Calculation Option */}
          {!showCGPA && (
            <Card className="bg-bg-secondary/50 backdrop-blur border-white/10">
              <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6">
                <div className="flex justify-center">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCGPA(true)}
                    className="w-full sm:w-auto h-11 sm:h-10 text-sm"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    <span className="truncate">Calculate CGPA (Include Previous Results)</span>
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
                  <CardHeader className="pb-3 sm:pb-6">
                    <CardTitle className="flex flex-row items-center justify-between gap-2">
                      <span className="flex items-center gap-2 text-sm sm:text-base md:text-lg">
                        <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                        <span className="truncate">Previous Records</span>
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowCGPA(false)}
                        className="h-8 w-8 p-0 flex-shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      Add each semester's TUGP and Units separately (e.g., 100L First Semester, 100L Second Semester, etc.)
                    </p>
                    
                    {/* Add Semester Form */}
                    <div className="flex flex-col gap-3 sm:gap-4">
                      <div>
                        <Label htmlFor="semesterTUGP" className="text-xs sm:text-sm mb-1.5 block">Semester TUGP</Label>
                        <Input
                          id="semesterTUGP"
                          type="number"
                          step="0.01"
                          placeholder="e.g., 37.5"
                          value={newSemester.tugp}
                          onChange={(e) => setNewSemester(prev => ({ ...prev, tugp: e.target.value }))}
                          className="h-11 sm:h-10 text-sm w-full"
                        />
                      </div>
                      <div>
                        <Label htmlFor="semesterUnits" className="text-xs sm:text-sm mb-1.5 block">Semester Units</Label>
                        <Input
                          id="semesterUnits"
                          type="number"
                          placeholder="e.g., 9"
                          value={newSemester.units}
                          onChange={(e) => setNewSemester(prev => ({ ...prev, units: e.target.value }))}
                          className="h-11 sm:h-10 text-sm w-full"
                        />
                      </div>
                    </div>
                    
                    <Button onClick={addSemester} className="w-full h-11 sm:h-10">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Semester
                    </Button>

                    {/* Previous Semesters List */}
                    {semesters.length > 0 && (
                      <div className="space-y-2 mt-2">
                        <Label className="text-xs sm:text-sm font-semibold">Added Semesters ({semesters.length})</Label>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {semesters.map((sem, index) => (
                            <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded bg-bg-primary/50 gap-2">
                              <div className="text-xs sm:text-sm flex-1 min-w-0">
                                <span className="font-medium">Semester {index + 1}: </span>
                                <span className="break-words">TUGP: {sem.tugp}, Units: {sem.units}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSemester(index)}
                                className="h-8 w-8 p-0 flex-shrink-0 self-end sm:self-center"
                              >
                                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <div className="pt-3 border-t border-white/10 text-xs sm:text-sm space-y-1">
                          <p className="break-words"><strong>Total Previous TUGP:</strong> {semesters.reduce((sum, s) => sum + parseFloat(s.tugp || "0"), 0).toFixed(2)}</p>
                          <p className="break-words"><strong>Total Previous Units:</strong> {semesters.reduce((sum, s) => sum + parseFloat(s.units || "0"), 0)}</p>
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
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
                  <span className="text-base sm:text-lg">Courses ({courses.length})</span>
                  <Button variant="destructive" size="sm" onClick={clearAll} className="w-full sm:w-auto h-9">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 sm:space-y-3">
                  {courses.map((course, index) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex flex-col gap-2 p-3 sm:p-4 rounded-lg bg-bg-primary/50"
                    >
                      <div className="flex items-start gap-2 sm:gap-3 w-full">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs sm:text-sm font-bold flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm sm:text-base break-words">{course.name}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                            {course.unit} units • Score: {course.score}% • Grade: {getGradeLetter(course.gradePoint)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 justify-between pl-9 sm:pl-11">
                        <Badge variant="outline" className="text-brand-green border-brand-green text-xs sm:text-sm">
                          {course.gradePoint} GP
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCourse(course.id)}
                          className="text-red-500 hover:text-red-600 h-8 w-8 p-0 flex-shrink-0"
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
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Award className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="flex flex-col gap-4">
                  <div className="text-center p-4 sm:p-5 rounded-lg bg-white/10">
                    <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-2">Current GPA</h3>
                    <p className="text-3xl sm:text-4xl md:text-5xl font-bold">{formatGPA(currentGPA)}</p>
                    <p className="text-xs sm:text-sm md:text-base opacity-90 mt-2 break-words px-2">{getClassification(currentGPA)}</p>
                  </div>
                  
                  {cgpa !== null && (
                    <div className="text-center p-4 sm:p-5 rounded-lg bg-white/10">
                      <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-2">CGPA</h3>
                      <p className="text-3xl sm:text-4xl md:text-5xl font-bold">{formatGPA(cgpa)}</p>
                      <p className="text-xs sm:text-sm md:text-base opacity-90 mt-2 break-words px-2">{getClassification(cgpa)}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                  <div className="p-2 rounded bg-white/5">
                    <span className="opacity-90 block mb-1">Current Units:</span>
                    <p className="font-semibold text-sm sm:text-base">{courses.reduce((sum, course) => sum + course.unit, 0)}</p>
                  </div>
                  <div className="p-2 rounded bg-white/5">
                    <span className="opacity-90 block mb-1">Current TUGP:</span>
                    <p className="font-semibold text-sm sm:text-base break-words">{courses.reduce((sum, course) => sum + (course.gradePoint * course.unit), 0).toFixed(2)}</p>
                  </div>
                  {cgpa !== null && (
                    <>
                      <div className="p-2 rounded bg-white/5">
                        <span className="opacity-90 block mb-1">Total Units:</span>
                        <p className="font-semibold text-sm sm:text-base">
                          {courses.reduce((sum, course) => sum + course.unit, 0) + 
                           semesters.reduce((sum, s) => sum + parseFloat(s.units || "0"), 0)}
                        </p>
                      </div>
                      <div className="p-2 rounded bg-white/5">
                        <span className="opacity-90 block mb-1">Total TUGP:</span>
                        <p className="font-semibold text-sm sm:text-base break-words">
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
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-base sm:text-lg">Grading System</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2 sm:gap-3 text-xs sm:text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <p className="font-semibold p-2 rounded bg-bg-primary/30">70-100: A (5 pts)</p>
                  <p className="font-semibold p-2 rounded bg-bg-primary/30">60-69: B (4 pts)</p>
                  <p className="font-semibold p-2 rounded bg-bg-primary/30">50-59: C (3 pts)</p>
                  <p className="font-semibold p-2 rounded bg-bg-primary/30">45-49: D (2 pts)</p>
                  <p className="font-semibold p-2 rounded bg-bg-primary/30">40-44: E (1 pt)</p>
                  <p className="font-semibold p-2 rounded bg-bg-primary/30">0-39: F (0 pts)</p>
                </div>
              </div>
              
              <div className="pt-3 sm:pt-4 border-t border-white/10">
                <h4 className="font-semibold mb-2 sm:mb-3 text-xs sm:text-sm md:text-base">Degree Classification:</h4>
                <div className="flex flex-col gap-1.5 sm:gap-2 text-xs sm:text-sm">
                  <p className="p-2 rounded bg-bg-primary/20">4.50 – 5.00: First Class Honours</p>
                  <p className="p-2 rounded bg-bg-primary/20">3.50 – 4.49: Second Class Honours (Upper)</p>
                  <p className="p-2 rounded bg-bg-primary/20">2.40 – 3.49: Second Class Honours (Lower)</p>
                  <p className="p-2 rounded bg-bg-primary/20">1.50 – 2.39: Third Class Honours</p>
                  <p className="p-2 rounded bg-bg-primary/20">1.00 – 1.49: Pass</p>
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