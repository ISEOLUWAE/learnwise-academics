import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, Loader2, Search, FileText, BookOpen, FileQuestion, Link, CloudUpload, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Course {
  id: string;
  code: string;
  title: string;
}

export const FileUploader = () => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [fileType, setFileType] = useState<'textbook' | 'material' | 'past-question'>('textbook');
  const [file, setFile] = useState<File | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [description, setDescription] = useState('');
  const [courseSearch, setCourseSearch] = useState('');
  const [uploadType, setUploadType] = useState<'file' | 'link'>('file');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, code, title')
        .order('code', { ascending: true });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCourse) {
      toast.error("Please select a course");
      return;
    }

    if (uploadType === 'file' && !file) {
      toast.error("Please select a file to upload");
      return;
    }
    
    if (uploadType === 'link' && !description.trim()) {
      toast.error("Please provide a file link");
      return;
    }
    
    if (!title.trim()) {
      toast.error("Please provide a title for the file");
      return;
    }

    try {
      setUploading(true);
      
      let fileUrl = description.trim();
      
      // Check if it's a Google Drive link or URL
      const isUrl = description.startsWith('http://') || description.startsWith('https://');
      
      // Only process file upload if a file is selected
      if (file) {
        // Determine bucket based on file type
        const bucketMap = {
          'textbook': 'textbooks',
          'material': 'materials',
          'past-question': 'past-questions'
        };
        
        const bucket = bucketMap[fileType];
        const filePath = `${Date.now()}_${file.name}`;

        // Upload file to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);

        fileUrl = urlData.publicUrl;
      } else if (!isUrl) {
        toast.error("Please either upload a file or provide a valid link (http:// or https://)");
        setUploading(false);
        return;
      }

      // Insert record into appropriate database table
      if (fileType === 'textbook') {
        const { error: dbError } = await supabase.from('textbooks').insert({
          course_id: selectedCourse,
          title: title.trim(),
          author: author.trim() || 'Admin Upload',
          year: year,
          download_link: fileUrl
        });
        if (dbError) throw dbError;
      } else if (fileType === 'material') {
        const { error: dbError } = await supabase.from('materials').insert({
          course_id: selectedCourse,
          title: title.trim(),
          type: file && file.type.includes('video') ? 'video' : 
                file && file.type.includes('audio') ? 'audio' : 'document',
          duration: description.includes('min') || description.includes('hour') ? description : undefined,
          link: fileUrl
        });
        if (dbError) throw dbError;
      } else if (fileType === 'past-question') {
        const { error: dbError } = await supabase.from('past_questions').insert({
          course_id: selectedCourse,
          year: year,
          semester: description.includes('First') ? 'First' : 
                   description.includes('Second') ? 'Second' : 'Current',
          link: fileUrl
        });
        if (dbError) throw dbError;
      }

      // Log admin action
      await supabase.from('admin_actions').insert({
        admin_id: user?.id,
        action_type: 'upload_file',
        details: { 
          file_type: fileType, 
          file_name: file ? file.name : 'External Link',
          course_id: selectedCourse,
          description,
          file_url: fileUrl
        }
      });

      toast.success(`${file ? 'File' : 'Link'} uploaded successfully and added to course!`);
      
      // Reset form
      setFile(null);
      setSelectedCourse('');
      setDescription('');
      setCourseSearch('');
      setTitle('');
      setAuthor('');
      setYear(new Date().getFullYear());
      (e.target as HTMLFormElement).reset();
      
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload");
    } finally {
      setUploading(false);
    }
  };

  const filteredCourses = courses.filter(course => 
    course.code.toLowerCase().includes(courseSearch.toLowerCase()) ||
    course.title.toLowerCase().includes(courseSearch.toLowerCase())
  );

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'textbook': return <BookOpen className="h-5 w-5" />;
      case 'material': return <FileText className="h-5 w-5" />;
      case 'past-question': return <FileQuestion className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getFileTypeLabel = (type: string) => {
    switch (type) {
      case 'textbook': return 'Textbook';
      case 'material': return 'Course Material';
      case 'past-question': return 'Past Question';
      default: return 'File';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary/5 to-blue-500/5 border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-3 text-2xl">
            <CloudUpload className="h-8 w-8 text-primary" />
            Course File Management
          </CardTitle>
          <CardDescription className="text-base">
            Upload textbooks, materials, or past questions to specific courses. Files will be automatically organized and displayed in the course detail pages.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Upload Form */}
      <Card className="bg-bg-secondary/50 backdrop-blur border-white/10 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getFileTypeIcon(fileType)}
            Upload {getFileTypeLabel(fileType)}
          </CardTitle>
          <CardDescription>
            Select the file type and course, then upload your file or provide a link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="space-y-6">
            {/* File Type Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">File Type</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { value: 'textbook', label: 'Textbook', icon: <BookOpen className="h-4 w-4" /> },
                  { value: 'material', label: 'Material', icon: <FileText className="h-4 w-4" /> },
                  { value: 'past-question', label: 'Past Question', icon: <FileQuestion className="h-4 w-4" /> }
                ].map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    variant={fileType === option.value ? "default" : "outline"}
                    className="flex items-center gap-2 h-12"
                    onClick={() => setFileType(option.value as any)}
                  >
                    {option.icon}
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Course Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Select Course *</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses by code or title..."
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  className="pl-9 mb-3"
                />
              </div>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Choose a course to upload to" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {filteredCourses.length === 0 ? (
                    <div className="p-4 text-sm text-muted-foreground text-center">
                      No courses found
                    </div>
                  ) : (
                    filteredCourses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{course.code}</span>
                          <span className="text-xs text-muted-foreground">{course.title}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Upload Type Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Upload Method</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={uploadType === 'file' ? "default" : "outline"}
                  className="flex items-center gap-2 h-12"
                  onClick={() => setUploadType('file')}
                >
                  <CloudUpload className="h-4 w-4" />
                  Upload File
                </Button>
                <Button
                  type="button"
                  variant={uploadType === 'link' ? "default" : "outline"}
                  className="flex items-center gap-2 h-12"
                  onClick={() => setUploadType('link')}
                >
                  <Link className="h-4 w-4" />
                  External Link
                </Button>
              </div>
            </div>

            {/* File Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter file title"
                  required
                />
              </div>

              {fileType === 'textbook' && (
                <div className="space-y-2">
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Enter author name"
                  />
                </div>
              )}

              {(fileType === 'textbook' || fileType === 'past-question') && (
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    min="2000"
                    max="2030"
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                  />
                </div>
              )}
            </div>

            {/* File Upload or Link Input */}
            {uploadType === 'file' ? (
              <div className="space-y-2">
                <Label htmlFor="file">Select File *</Label>
                <div className="relative">
                  <Input
                    id="file"
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.mp3,.txt"
                    className="h-12"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Supported formats: PDF, DOC, PPT, MP4, MP3, TXT
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="description">External Link *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Paste Google Drive, Dropbox, or any external link (https://...)"
                  rows={3}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Paste any external link (Google Drive, Dropbox, etc.)
                </p>
              </div>
            )}

            {/* Submit Button */}
            <Button 
              type="submit" 
              disabled={uploading || !selectedCourse || !title.trim() || 
                       (uploadType === 'file' && !file) || 
                       (uploadType === 'link' && !description.trim())} 
              className="w-full h-12 text-base font-semibold"
              variant="gradient"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Upload to Course
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Upload Instructions
          </h4>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• <strong>Textbooks:</strong> Upload PDF files or provide links to online textbooks</li>
            <li>• <strong>Materials:</strong> Upload lecture notes, slides, or provide links to course materials</li>
            <li>• <strong>Past Questions:</strong> Upload exam papers or provide links to past question banks</li>
            <li>• Files will be automatically organized and displayed in the respective course detail pages</li>
            <li>• Ensure all uploaded content is relevant and properly titled for easy identification</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
