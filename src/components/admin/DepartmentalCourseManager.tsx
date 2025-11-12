import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { BookOpen, Loader2, Plus, Trash2, Search, Upload, Download, BarChart3, Calculator, Database } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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
  created_at: string;
}

export const DepartmentalCourseManager = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<DepartmentalCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterSemester, setFilterSemester] = useState('all');
  const [importing, setImporting] = useState(false);

  const [formData, setFormData] = useState({
    department: '',
    level: '',
    semester: '',
    session: '2024/2025',
    course_code: '',
    course_title: '',
    units: 3,
    status: 'C'
  });

  // Available departments
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
  const sessions = ["2023/2024", "2024/2025", "2025/2026"];
  const statusOptions = ["C", "E"];

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('departmental_courses')
        .select('*')
        .order('department', { ascending: true })
        .order('level', { ascending: true })
        .order('course_code', { ascending: true });

      if (error) throw error;
      setCourses(data || []);
    } catch (error: any) {
      console.error('Error fetching departmental courses:', error);
      toast.error('Failed to fetch departmental courses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);

    try {
      const { error } = await supabase
        .from('departmental_courses')
        .insert({
          ...formData,
          course_code: formData.course_code.toUpperCase(),
          semester: formData.semester.toLowerCase(),
          created_by: user?.id
        });

      if (error) throw error;

      // Log admin action
      await supabase.from('admin_actions').insert({
        admin_id: user?.id,
        action_type: 'add_departmental_course',
        details: { 
          department: formData.department,
          course_code: formData.course_code,
          level: formData.level,
          semester: formData.semester
        }
      });

      toast.success('Departmental course added successfully');
      setShowForm(false);
      setFormData({
        department: '',
        level: '',
        semester: '',
        session: '2024/2025',
        course_code: '',
        course_title: '',
        units: 3,
        status: 'C'
      });
      fetchCourses();
    } catch (error: any) {
      console.error('Error adding departmental course:', error);
      toast.error(error.message || 'Failed to add departmental course');
    } finally {
      setAdding(false);
    }
  };

  const deleteCourse = async (id: string, courseCode: string) => {
    if (!confirm(`Are you sure you want to delete course ${courseCode}?`)) return;

    try {
      const { error } = await supabase
        .from('departmental_courses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Log admin action
      await supabase.from('admin_actions').insert({
        admin_id: user?.id,
        action_type: 'delete_departmental_course',
        target_id: id,
        details: { course_code: courseCode }
      });

      toast.success('Departmental course deleted successfully');
      fetchCourses();
    } catch (error: any) {
      console.error('Error deleting departmental course:', error);
      toast.error('Failed to delete departmental course');
    }
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    let successCount = 0;
    let errorCount = 0;

    for (const line of lines) {
      try {
        const [department, level, semester, session, course_code, course_title, units, status] = line.split(',');
        
        if (!department || !level || !semester || !course_code || !course_title) {
          errorCount++;
          continue;
        }

        const { error } = await supabase
          .from('departmental_courses')
          .insert({
            department: department.trim(),
            level: level.trim(),
            semester: semester.trim().toLowerCase(),
            session: session.trim() || '2024/2025',
            course_code: course_code.trim().toUpperCase(),
            course_title: course_title.trim(),
            units: parseInt(units.trim()) || 3,
            status: status.trim() || 'C',
            created_by: user?.id
          });

        if (error) {
          errorCount++;
        } else {
          successCount++;
        }
      } catch (error) {
        errorCount++;
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} courses uploaded successfully`);
      fetchCourses();
    }
    
    if (errorCount > 0) {
      toast.error(`${errorCount} courses failed to upload`);
    }

    // Reset file input
    e.target.value = '';
  };

  const exportCourses = () => {
    const csvContent = [
      ['Department', 'Level', 'Semester', 'Session', 'Course Code', 'Course Title', 'Units', 'Status'],
      ...courses.map(course => [
        course.department,
        course.level,
        course.semester,
        course.session,
        course.course_code,
        course.course_title,
        course.units,
        course.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'departmental_courses.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const importCSCourses = async () => {
    if (!confirm('This will import all Computer Science courses (100-500 level) from the 2024-2025 handbook. Continue?')) {
      return;
    }

    setImporting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('You must be logged in to import courses');
        return;
      }

      const response = await fetch('https://cgfiwjbegervslftrvaz.supabase.co/functions/v1/import-cs-courses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to import courses');
      }

      toast.success(result.message || 'Computer Science courses imported successfully');
      fetchCourses();
    } catch (error: any) {
      console.error('Error importing CS courses:', error);
      toast.error(error.message || 'Failed to import Computer Science courses');
    } finally {
      setImporting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.course_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.course_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = !filterDepartment || filterDepartment === 'all' || course.department === filterDepartment;
    const matchesLevel = !filterLevel || filterLevel === 'all' || course.level === filterLevel;
    const matchesSemester = !filterSemester || filterSemester === 'all' || course.semester === filterSemester.toLowerCase();
    
    return matchesSearch && matchesDepartment && matchesLevel && matchesSemester;
  });

  // Calculate statistics for course counts and total units
  const getCourseStatistics = () => {
    const stats = new Map();
    
    courses.forEach(course => {
      const key = `${course.department}-${course.level}-${course.semester}`;
      
      if (!stats.has(key)) {
        stats.set(key, {
          department: course.department,
          level: course.level,
          semester: course.semester,
          courseCount: 0,
          totalUnits: 0,
          compulsoryCount: 0,
          electiveCount: 0
        });
      }
      
      const stat = stats.get(key);
      stat.courseCount += 1;
      stat.totalUnits += course.units;
      
      if (course.status === 'compulsory') {
        stat.compulsoryCount += 1;
      } else {
        stat.electiveCount += 1;
      }
    });
    
    return Array.from(stats.values()).sort((a, b) => {
      // Sort by department, then level, then semester
      if (a.department !== b.department) return a.department.localeCompare(b.department);
      if (a.level !== b.level) return a.level.localeCompare(b.level);
      return a.semester.localeCompare(b.semester);
    });
  };

  const courseStatistics = getCourseStatistics();

  return (
    <div className="space-y-4 md:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
            <BookOpen className="h-5 w-5" />
            Departmental Course Management
          </CardTitle>
          <CardDescription>
            Manage course listings for different departments, levels, and semesters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 md:space-y-6">
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setShowForm(!showForm)} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              {showForm ? 'Cancel' : 'Add Course'}
            </Button>

            <Button 
              onClick={importCSCourses} 
              disabled={importing}
              variant="default"
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {importing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  Import CS Courses
                </>
              )}
            </Button>

            <div className="relative">
              <input
                type="file"
                accept=".csv"
                onChange={handleBulkUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="bulk-upload"
              />
              <Button variant="outline" className="w-full sm:w-auto" asChild>
                <label htmlFor="bulk-upload" className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Bulk Upload CSV
                </label>
              </Button>
            </div>

            <Button variant="outline" onClick={exportCourses} className="w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by course code, title, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterLevel} onValueChange={setFilterLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {levels.map((level) => (
                    <SelectItem key={level} value={level}>{level} Level</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterSemester} onValueChange={setFilterSemester}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Semesters</SelectItem>
                  {semesters.map((semester) => (
                    <SelectItem key={semester} value={semester}>{semester}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Course Statistics */}
          {courseStatistics.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Course Statistics by Department/Level/Semester</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courseStatistics.map((stat, index) => (
                  <Card key={index} className="border-l-4 border-l-primary">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm text-muted-foreground">
                            {stat.department}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {stat.level} Level
                          </Badge>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground capitalize">
                            {stat.semester}
                          </p>
                          
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              <span className="font-medium">{stat.courseCount}</span>
                              <span className="text-xs text-muted-foreground">courses</span>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <Calculator className="h-3 w-3" />
                              <span className="font-medium">{stat.totalUnits}</span>
                              <span className="text-xs text-muted-foreground">units</span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 text-xs">
                            <Badge variant="secondary" className="h-5">
                              {stat.compulsoryCount} compulsory
                            </Badge>
                            <Badge variant="outline" className="h-5">
                              {stat.electiveCount} elective
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Overall Summary */}
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-primary" />
                      <span className="font-medium">Overall Summary</span>
                    </div>
                    <div className="flex gap-6 text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-lg">{courses.length}</div>
                        <div className="text-xs text-muted-foreground">Total Courses</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-lg">
                          {courses.reduce((sum, course) => sum + course.units, 0)}
                        </div>
                        <div className="text-xs text-muted-foreground">Total Units</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-lg">{courseStatistics.length}</div>
                        <div className="text-xs text-muted-foreground">Dept/Level/Sem</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Add Course Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">Level *</Label>
                  <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map((level) => (
                        <SelectItem key={level} value={level}>{level} Level</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="semester">Semester *</Label>
                  <Select value={formData.semester} onValueChange={(value) => setFormData({ ...formData, semester: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {semesters.map((semester) => (
                        <SelectItem key={semester} value={semester}>{semester}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="session">Session *</Label>
                  <Select value={formData.session} onValueChange={(value) => setFormData({ ...formData, session: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sessions.map((session) => (
                        <SelectItem key={session} value={session}>{session}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="course_code">Course Code *</Label>
                  <Input
                    id="course_code"
                    value={formData.course_code}
                    onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
                    placeholder="e.g., GST111"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="course_title">Course Title *</Label>
                  <Input
                    id="course_title"
                    value={formData.course_title}
                    onChange={(e) => setFormData({ ...formData, course_title: e.target.value })}
                    placeholder="e.g., Use of English"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="units">Units *</Label>
                  <Input
                    id="units"
                    type="number"
                    min="1"
                    max="6"
                    value={formData.units}
                    onChange={(e) => setFormData({ ...formData, units: parseInt(e.target.value) })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status} className="capitalize">
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" disabled={adding} className="w-full">
                {adding ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Course
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Courses Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Session</TableHead>
                  <TableHead>Course Code</TableHead>
                  <TableHead className="hidden md:table-cell">Course Title</TableHead>
                  <TableHead className="hidden lg:table-cell">Units</TableHead>
                  <TableHead className="hidden lg:table-cell">Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.department}</TableCell>
                    <TableCell>{course.level}</TableCell>
                    <TableCell className="capitalize">{course.semester}</TableCell>
                    <TableCell>{course.session}</TableCell>
                    <TableCell className="font-mono">{course.course_code}</TableCell>
                    <TableCell className="hidden md:table-cell">{course.course_title}</TableCell>
                    <TableCell className="hidden lg:table-cell">{course.units}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge variant={course.status === 'compulsory' ? 'default' : 'secondary'}>
                        {course.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteCourse(course.id, course.course_code)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredCourses.length === 0 && !loading && (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">No courses found</p>
              <p className="text-sm text-muted-foreground mt-2">
                Try adjusting your search criteria or add new courses
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

