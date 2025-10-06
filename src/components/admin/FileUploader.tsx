import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, Loader2, Search } from "lucide-react";
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

    if (!description.trim()) {
      toast.error("Please add a description or file link");
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
          title: file ? file.name : description.substring(0, 100),
          author: 'Admin Upload',
          year: new Date().getFullYear(),
          download_link: fileUrl
        });
        if (dbError) throw dbError;
      } else if (fileType === 'material') {
        const { error: dbError } = await supabase.from('materials').insert({
          course_id: selectedCourse,
          title: file ? file.name : description.substring(0, 100),
          type: file && file.type.includes('video') ? 'video' : 'document',
          link: fileUrl
        });
        if (dbError) throw dbError;
      } else if (fileType === 'past-question') {
        const { error: dbError } = await supabase.from('past_questions').insert({
          course_id: selectedCourse,
          year: new Date().getFullYear(),
          semester: 'Current',
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

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Upload Course Files</CardTitle>
        <CardDescription>
          Upload textbooks, materials, or past questions. Files will be automatically added to the course section.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fileType">File Type</Label>
            <Select value={fileType} onValueChange={(value: any) => setFileType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="textbook">Textbook</SelectItem>
                <SelectItem value="material">Material</SelectItem>
                <SelectItem value="past-question">Past Question</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="course">Select Course *</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by code or title..."
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                className="pl-9 mb-2"
              />
            </div>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a course" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {filteredCourses.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground text-center">
                    No courses found
                  </div>
                ) : (
                  filteredCourses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.code} - {course.title}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description / Google Drive Link *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter file description OR paste Google Drive/external link (https://...)"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              You can either upload a file below OR paste a link above
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Select File (Optional if link provided)</Label>
            <Input
              id="file"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.mp3"
            />
          </div>

          <Button type="submit" disabled={uploading || !selectedCourse || !description.trim()} className="w-full">
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
