import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { BookOpen, Loader2, Plus, Trash2, Search, Edit, Eye, Users, GraduationCap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Course {
  id: string;
  code: string;
  title: string;
  level: string;
  semester: string;
  status: string;
  units: number;
  department: string;
  description: string;
  overview: string;
}

export const CourseManager = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    code: '',
    title: '',
    level: '',
    semester: '',
    status: 'C',
    units: 3,
    department: '',
    description: '',
    overview: ''
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('code', { ascending: true });

      if (error) throw error;
      setCourses(data || []);
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);

    try {
      const { error } = await supabase
        .from('courses')
        .insert({
          ...formData,
          code: formData.code.toUpperCase()
        });

      if (error) throw error;

      // Log admin action
      await supabase.from('admin_actions').insert({
        admin_id: user?.id,
        action_type: 'add_course',
        details: { course_code: formData.code, course_title: formData.title }
      });

      toast.success('Course added successfully');
      setShowForm(false);
      setFormData({
        code: '',
        title: '',
        level: '',
        semester: '',
        status: 'C',
        units: 3,
        department: '',
        description: '',
        overview: ''
      });
      fetchCourses();
    } catch (error: any) {
      console.error('Error adding course:', error);
      toast.error(error.message || 'Failed to add course');
    } finally {
      setAdding(false);
    }
  };

  const deleteCourse = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to delete course ${code}? This will also remove all associated files and materials.`)) return;

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Log admin action
      await supabase.from('admin_actions').insert({
        admin_id: user?.id,
        action_type: 'delete_course',
        target_id: id,
        details: { course_code: code }
      });

      toast.success('Course deleted successfully - changes will reflect immediately');
      fetchCourses();
    } catch (error: any) {
      console.error('Error deleting course:', error);
      toast.error('Failed to delete course');
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

  const filteredCourses = courses.filter(course =>
    course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary/5 to-blue-500/5 border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-3 text-2xl">
            <GraduationCap className="h-8 w-8 text-primary" />
            Course Management System
          </CardTitle>
          <CardDescription className="text-base">
            Add, edit, and manage all courses in the system. Changes will be reflected immediately on the courses page.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <Card className="bg-bg-secondary/50 backdrop-blur border-white/10 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <BookOpen className="h-6 w-6" />
            Course Management
          </CardTitle>
          <CardDescription>Add and manage courses in the system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={() => setShowForm(!showForm)} 
              className="w-full sm:w-auto h-12"
              variant={showForm ? "outline" : "default"}
            >
              <Plus className="h-5 w-5 mr-2" />
              {showForm ? 'Cancel' : 'Add New Course'}
            </Button>

            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by course code or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-12"
              />
            </div>
          </div>

          {showForm && (
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add New Course
                </CardTitle>
                <CardDescription>
                  Fill in the course details below. All fields marked with * are required.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Course Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g., CSC101"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Course Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Introduction to Computer Science"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">Level *</Label>
                  <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100">100 Level</SelectItem>
                      <SelectItem value="200">200 Level</SelectItem>
                      <SelectItem value="300">300 Level</SelectItem>
                      <SelectItem value="400">400 Level</SelectItem>
                      <SelectItem value="500">500 Level</SelectItem>
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
                      <SelectItem value="first">First Semester</SelectItem>
                      <SelectItem value="second">Second Semester</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="C">Compulsory</SelectItem>
                      <SelectItem value="E">Elective</SelectItem>
                    </SelectContent>
                  </Select>
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

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="department">Department *</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="e.g., Computer Science"
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the course"
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="overview">Course Overview *</Label>
                  <Textarea
                    id="overview"
                    value={formData.overview}
                    onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                    placeholder="Detailed course overview"
                    rows={4}
                    required
                  />
                </div>
              </div>

                  <Button type="submit" disabled={adding} className="w-full h-12 text-base font-semibold" variant="gradient">
                    {adding ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Adding Course...
                      </>
                    ) : (
                      <>
                        <Plus className="h-5 w-5 mr-2" />
                        Add Course
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Courses Table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">All Courses ({filteredCourses.length})</h3>
              <div className="text-sm text-muted-foreground">
                {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead className="text-muted-foreground font-semibold">Course Code</TableHead>
                    <TableHead className="text-muted-foreground font-semibold">Title</TableHead>
                    <TableHead className="text-muted-foreground font-semibold hidden md:table-cell">Level</TableHead>
                    <TableHead className="text-muted-foreground font-semibold hidden md:table-cell">Semester</TableHead>
                    <TableHead className="text-muted-foreground font-semibold hidden lg:table-cell">Status</TableHead>
                    <TableHead className="text-muted-foreground font-semibold hidden lg:table-cell">Units</TableHead>
                    <TableHead className="text-muted-foreground font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.map((course) => (
                    <TableRow key={course.id} className="border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell className="font-mono font-semibold text-primary">
                        {course.code}
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="max-w-xs truncate" title={course.title}>
                          {course.title}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline" className="text-xs">
                          {course.level} Level
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize hidden md:table-cell">
                        {course.semester}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge variant={course.status === "C" || course.status === "Compulsory" ? "default" : "secondary"}>
                          {course.status === "C" ? "Compulsory" : course.status === "E" ? "Elective" : course.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell font-medium">
                        {course.units}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`/course/${encodeURIComponent(course.code)}`, '_blank')}
                            className="h-8 w-8 p-0"
                            title="View Course"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteCourse(course.id, course.code)}
                            className="h-8 w-8 p-0"
                            title="Delete Course"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredCourses.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No courses found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? 'No courses match your search criteria.' : 'No courses have been added yet.'}
                </p>
                {!searchQuery && (
                  <Button onClick={() => setShowForm(true)} variant="default">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Course
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};