import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, Loader2 } from "lucide-react";
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
    
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }

    if (!selectedCourse) {
      toast.error("Please select a course");
      return;
    }

    if (!description.trim()) {
      toast.error("Please add a description");
      return;
    }

    try {
      setUploading(true);
      
      // Determine bucket based on file type
      const bucketMap = {
        'textbook': 'textbooks',
        'material': 'materials',
        'past-question': 'past-questions'
      };
      
      const bucket = bucketMap[fileType];
      const filePath = `${Date.now()}_${file.name}`;

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      // Log admin action
      await supabase.from('admin_actions').insert({
        admin_id: user?.id,
        action_type: 'upload_file',
        details: { 
          file_type: fileType, 
          file_name: file.name,
          course_id: selectedCourse,
          description 
        }
      });

      toast.success(`File uploaded successfully! Description: ${description}`);
      
      // Reset form
      setFile(null);
      setSelectedCourse('');
      setDescription('');
      (e.target as HTMLFormElement).reset();
      
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Upload Course Files</CardTitle>
        <CardDescription>
          Upload textbooks, materials, or past questions to Supabase Storage. 
          After uploading, copy the file URL and add it to the respective database table.
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
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.code} - {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">File Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the file content..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Select File</Label>
            <Input
              id="file"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.mp3"
            />
          </div>

          <Button type="submit" disabled={uploading || !file || !selectedCourse || !description.trim()} className="w-full">
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
