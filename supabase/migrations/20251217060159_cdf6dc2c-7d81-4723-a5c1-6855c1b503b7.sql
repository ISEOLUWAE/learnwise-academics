-- Make the department-files bucket public so everyone can download files
UPDATE storage.buckets SET public = true WHERE id = 'department-files';

-- If bucket doesn't exist, create it
INSERT INTO storage.buckets (id, name, public)
VALUES ('department-files', 'department-files', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Create storage policies for department files bucket
CREATE POLICY "Anyone can view department files"
ON storage.objects FOR SELECT
USING (bucket_id = 'department-files');

CREATE POLICY "Authenticated users can upload department files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'department-files' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own department files"
ON storage.objects FOR DELETE
USING (bucket_id = 'department-files' AND auth.uid()::text = (storage.foldername(name))[1]);