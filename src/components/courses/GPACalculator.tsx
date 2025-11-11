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
      <DialogContent className="w-full max-w-[calc(100vw-1rem)] sm:max-w-[calc(100vw-2rem)] md:max-w-2xl lg:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto p-3 sm:p-4 md:p-6">
        <DialogHeader className="space-y-1 sm:space-y-2 mb-2 sm:mb-4">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
            <Calculator className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
            <span className="line-clamp-1">GPA Calculator</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4 md:space-y-5">
          {/* Add Course Form */}
          <Card className="bg-bg-secondary/50 backdrop-blur border-white/10">
            <CardHeader className="pb-2 sm:pb-3 md:pb-4 px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-6">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Plus className="h-4 w-4 flex-shrink-0" />
                Add Course
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 sm:space-y-3 px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
              <div className="flex flex-col gap-2.5 sm:gap-3">
                <div className="w-full">
                  <Label htmlFor="courseName" className="text-xs mb-1 block">Course Name (Optional)</Label>
                  <Input
                    id="courseName"
                    placeholder="e.g., Mathematics"
                    value={newCourse.name}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, name: e.target.value }))}
                    className="h-10 text-xs sm:text-sm w-full"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div>
                    <Label htmlFor="courseUnit" className="text-xs mb-1 block">Unit</Label>
                    <Input
                      id="courseUnit"
                      type="number"
                      placeholder="3"
                      value={newCourse.unit}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, unit: e.target.value }))}
                      className="h-10 text-xs sm:text-sm w-full"
                    />
                  </div>
                  <div>
                    <Label htmlFor="courseScore" className="text-xs mb-1 block">Score</Label>
                    <Input
                      id="courseScore"
                      type="number"
                      placeholder="85"
                      value={newCourse.score}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, score: e.target.value }))}
                      className="h-10 text-xs sm:text-sm w-full"
                    />
                  </div>
                </div>
              </div>
              <Button onClick={addCourse} className="w-full h-10 text-sm" variant="gradient">
                <Plus className="h-4 w-4 mr-1.5" />
                Add Course
              </Button>
            </CardContent>
          </Card>

          {/* CGPA Calculation Option */}
          {!showCGPA && (
            <Card className="bg-bg-secondary/50 backdrop-blur border-white/10">
              <CardContent className="pt-3 sm:pt-4 pb-3 sm:pb-4 px-3 sm:px-4 md:px-6">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCGPA(true)}
                  className="w-full h-10 text-xs sm:text-sm"
                >
                  <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
                  <span className="line-clamp-1">Calculate CGPA (Add Previous Results)</span>
                </Button>
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
                  <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-6">
                    <CardTitle className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 text-xs sm:text-sm md:text-base">
                        <BookOpen className="h-4 w-4 flex-shrink-0" />
                        <span className="line-clamp-1">Previous Records</span>
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowCGPA(false)}
                        className="h-7 w-7 p-0 flex-shrink-0"
                      >
                        <X className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2.5 sm:space-y-3 px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
                    <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed">
                      Add each semester's TUGP and Units separately
                    </p>
                    
                    {/* Add Semester Form */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <div>
                        <Label htmlFor="semesterTUGP" className="text-xs mb-1 block">Semester TUGP</Label>
                        <Input
                          id="semesterTUGP"
                          type="number"
                          step="0.01"
                          placeholder="37.5"
                          value={newSemester.tugp}
                          onChange={(e) => setNewSemester(prev => ({ ...prev, tugp: e.target.value }))}
                          className="h-10 text-xs sm:text-sm w-full"
                        />
                      </div>
                      <div>
                        <Label htmlFor="semesterUnits" className="text-xs mb-1 block">Semester Units</Label>
                        <Input
                          id="semesterUnits"
                          type="number"
                          placeholder="9"
                          value={newSemester.units}
                          onChange={(e) => setNewSemester(prev => ({ ...prev, units: e.target.value }))}
                          className="h-10 text-xs sm:text-sm w-full"
                        />
                      </div>
                    </div>
                    
                    <Button onClick={addSemester} className="w-full h-10 text-xs sm:text-sm">
                      <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
                      Add Semester
                    </Button>

                    {/* Previous Semesters List */}
                    {semesters.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold">Added Semesters ({semesters.length})</Label>
                        <div className="space-y-1.5 max-h-36 overflow-y-auto">
                          {semesters.map((sem, index) => (
                            <div key={index} className="flex items-center justify-between p-2 rounded bg-bg-primary/50 gap-2">
                              <div className="text-[10px] sm:text-xs flex-1 min-w-0">
                                <span className="font-medium">Sem {index + 1}: </span>
                                <span className="break-words">TUGP: {sem.tugp}, Units: {sem.units}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSemester(index)}
                                className="h-7 w-7 p-0 flex-shrink-0"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <div className="pt-2 border-t border-white/10 text-[10px] sm:text-xs space-y-0.5">
                          <p className="break-words"><strong>Total TUGP:</strong> {semesters.reduce((sum, s) => sum + parseFloat(s.tugp || "0"), 0).toFixed(2)}</p>
                          <p className="break-words"><strong>Total Units:</strong> {semesters.reduce((sum, s) => sum + parseFloat(s.units || "0"), 0)}</p>
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
              <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-6">
                <CardTitle className="flex items-center justify-between gap-2">
                  <span className="text-sm sm:text-base">Courses ({courses.length})</span>
                  <Button variant="destructive" size="sm" onClick={clearAll} className="h-8 text-xs">
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    Clear
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
                <div className="space-y-2">
                  {courses.map((course, index) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center gap-2 p-2 sm:p-3 rounded-lg bg-bg-primary/50"
                    >
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs sm:text-sm break-words line-clamp-1">{course.name}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                          {course.unit}u • {course.score}% • {getGradeLetter(course.gradePoint)}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-brand-green border-brand-green text-[10px] sm:text-xs px-1.5 sm:px-2 flex-shrink-0">
                        {course.gradePoint}GP
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCourse(course.id)}
                        className="text-red-500 hover:text-red-600 h-7 w-7 p-0 flex-shrink-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {courses.length > 0 && (
            <Card className="bg-gradient-primary text-white">
              <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-6">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <Award className="h-4 w-4 flex-shrink-0" />
                  Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
                <div className="flex flex-col gap-2.5 sm:gap-3">
                  <div className="text-center p-3 sm:p-4 rounded-lg bg-white/10">
                    <h3 className="text-xs sm:text-sm font-semibold mb-1">Current GPA</h3>
                    <p className="text-2xl sm:text-3xl md:text-4xl font-bold">{formatGPA(currentGPA)}</p>
                    <p className="text-[10px] sm:text-xs opacity-90 mt-1 break-words px-1">{getClassification(currentGPA)}</p>
                  </div>
                  
                  {cgpa !== null && (
                    <div className="text-center p-3 sm:p-4 rounded-lg bg-white/10">
                      <h3 className="text-xs sm:text-sm font-semibold mb-1">CGPA</h3>
                      <p className="text-2xl sm:text-3xl md:text-4xl font-bold">{formatGPA(cgpa)}</p>
                      <p className="text-[10px] sm:text-xs opacity-90 mt-1 break-words px-1">{getClassification(cgpa)}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-3 text-[10px] sm:text-xs">
                  <div className="p-2 rounded bg-white/5">
                    <span className="opacity-90 block mb-0.5">Units:</span>
                    <p className="font-semibold text-xs sm:text-sm">{courses.reduce((sum, course) => sum + course.unit, 0)}</p>
                  </div>
                  <div className="p-2 rounded bg-white/5">
                    <span className="opacity-90 block mb-0.5">TUGP:</span>
                    <p className="font-semibold text-xs sm:text-sm break-words">{courses.reduce((sum, course) => sum + (course.gradePoint * course.unit), 0).toFixed(2)}</p>
                  </div>
                  {cgpa !== null && (
                    <>
                      <div className="p-2 rounded bg-white/5">
                        <span className="opacity-90 block mb-0.5">Total Units:</span>
                        <p className="font-semibold text-xs sm:text-sm">
                          {courses.reduce((sum, course) => sum + course.unit, 0) + 
                           semesters.reduce((sum, s) => sum + parseFloat(s.units || "0"), 0)}
                        </p>
                      </div>
                      <div className="p-2 rounded bg-white/5">
                        <span className="opacity-90 block mb-0.5">Total TUGP:</span>
                        <p className="font-semibold text-xs sm:text-sm break-words">
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
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-6">
              <CardTitle className="text-xs sm:text-sm md:text-base">Grading System</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
                <p className="font-semibold p-1.5 sm:p-2 rounded bg-bg-primary/30">70-100: A (5)</p>
                <p className="font-semibold p-1.5 sm:p-2 rounded bg-bg-primary/30">60-69: B (4)</p>
                <p className="font-semibold p-1.5 sm:p-2 rounded bg-bg-primary/30">50-59: C (3)</p>
                <p className="font-semibold p-1.5 sm:p-2 rounded bg-bg-primary/30">45-49: D (2)</p>
                <p className="font-semibold p-1.5 sm:p-2 rounded bg-bg-primary/30">40-44: E (1)</p>
                <p className="font-semibold p-1.5 sm:p-2 rounded bg-bg-primary/30">0-39: F (0)</p>
              </div>
              
              <div className="pt-2 sm:pt-3 border-t border-white/10">
                <h4 className="font-semibold mb-1.5 sm:mb-2 text-xs">Classification:</h4>
                <div className="flex flex-col gap-1 sm:gap-1.5 text-[10px] sm:text-xs">
                  <p className="p-1.5 sm:p-2 rounded bg-bg-primary/20">4.50-5.00: First Class</p>
                  <p className="p-1.5 sm:p-2 rounded bg-bg-primary/20">3.50-4.49: 2nd Class (Upper)</p>
                  <p className="p-1.5 sm:p-2 rounded bg-bg-primary/20">2.40-3.49: 2nd Class (Lower)</p>
                  <p className="p-1.5 sm:p-2 rounded bg-bg-primary/20">1.50-2.39: Third Class</p>
                  <p className="p-1.5 sm:p-2 rounded bg-bg-primary/20">1.00-1.49: Pass</p>
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