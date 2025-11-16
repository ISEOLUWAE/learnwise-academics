-- Create storage bucket for community files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('community-files', 'community-files', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for community files
CREATE POLICY "Users can upload their own community files"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'community-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Community files are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'community-files');

CREATE POLICY "Users can update their own community files"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'community-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own community files"
ON storage.objects
FOR DELETE
USING (bucket_id = 'community-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add real-time support for departmental_courses table
ALTER TABLE departmental_courses REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE departmental_courses;