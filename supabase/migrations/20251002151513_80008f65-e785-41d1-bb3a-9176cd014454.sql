-- Create storage buckets for course materials
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('textbooks', 'textbooks', false),
  ('materials', 'materials', false),
  ('past-questions', 'past-questions', false);

-- Create RLS policies for textbooks bucket
CREATE POLICY "Authenticated users can view textbooks"
ON storage.objects FOR SELECT
USING (bucket_id = 'textbooks' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can upload textbooks"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'textbooks' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can update textbooks"
ON storage.objects FOR UPDATE
USING (bucket_id = 'textbooks' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can delete textbooks"
ON storage.objects FOR DELETE
USING (bucket_id = 'textbooks' AND auth.role() = 'authenticated');

-- Create RLS policies for materials bucket
CREATE POLICY "Authenticated users can view materials"
ON storage.objects FOR SELECT
USING (bucket_id = 'materials' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can upload materials"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'materials' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can update materials"
ON storage.objects FOR UPDATE
USING (bucket_id = 'materials' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can delete materials"
ON storage.objects FOR DELETE
USING (bucket_id = 'materials' AND auth.role() = 'authenticated');

-- Create RLS policies for past-questions bucket
CREATE POLICY "Authenticated users can view past questions"
ON storage.objects FOR SELECT
USING (bucket_id = 'past-questions' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can upload past questions"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'past-questions' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can update past questions"
ON storage.objects FOR UPDATE
USING (bucket_id = 'past-questions' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can delete past questions"
ON storage.objects FOR DELETE
USING (bucket_id = 'past-questions' AND auth.role() = 'authenticated');

-- Create table to track ad views
CREATE TABLE public.ad_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  video_1_watched BOOLEAN NOT NULL DEFAULT false,
  video_2_watched BOOLEAN NOT NULL DEFAULT false,
  last_watched_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on ad_views
ALTER TABLE public.ad_views ENABLE ROW LEVEL SECURITY;

-- Create policies for ad_views
CREATE POLICY "Users can view their own ad views"
ON public.ad_views FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ad views"
ON public.ad_views FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ad views"
ON public.ad_views FOR UPDATE
USING (auth.uid() = user_id);

-- Add trigger for ad_views updated_at
CREATE TRIGGER update_ad_views_updated_at
BEFORE UPDATE ON public.ad_views
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update Mathematics course to remove "computer science" from description
UPDATE public.courses
SET description = REPLACE(description, 'computer science', 'mathematics')
WHERE code LIKE 'MTH%';

-- Insert new 100 Level First Semester courses (only if they don't exist)
INSERT INTO public.courses (code, title, units, status, level, semester, department, overview, description)
VALUES 
  ('GST 111', 'Communication in English', 2, 'C', '100', 'First', 'General Studies', 'LH: 15, PH: 45', 'General Studies course on Communication in English'),
  ('BIO 101', 'General Biology I', 2, 'C', '100', 'First', 'Biology', 'LH: 30, PH: -', 'Introduction to General Biology I'),
  ('BIO 107', 'General Biology Practical I', 1, 'C', '100', 'First', 'Biology', 'LH: -, PH: 45', 'Practical course for General Biology I'),
  ('CHM-CM101', 'General Chemistry I', 2, 'C', '100', 'First', 'Chemistry', 'LH: 30, PH: -', 'Introduction to General Chemistry I'),
  ('CHM 107', 'General Chemistry Practical I', 1, 'C', '100', 'First', 'Chemistry', 'LH: -, PH: 45', 'Practical course for General Chemistry I'),
  ('MTH 101', 'Elementary Mathematics I', 2, 'C', '100', 'First', 'Mathematics', 'LH: 30, PH: -', 'Introduction to Elementary Mathematics I'),
  ('PHY-CM101', 'General Physics I', 2, 'C', '100', 'First', 'Physics', 'LH: 30, PH: -', 'Introduction to General Physics I'),
  ('PHY-CM103', 'General Physics III', 2, 'C', '100', 'First', 'Physics', 'LH: 30, PH: -', 'Introduction to General Physics III'),
  ('PHY-CM107', 'General Physics Practical I', 1, 'C', '100', 'First', 'Physics', 'LH: -, PH: 45', 'Practical course for General Physics I'),
  ('COS 101', 'Introduction to Computer', 3, 'C', '100', 'First', 'Computer Science', 'LH: 30, PH: 45', 'Introduction to Computer Science'),
  ('ZOO 101', 'The Mammalian body', 2, 'C', '100', 'First', 'Zoology', 'LH: 15, PH: 45', 'Study of the Mammalian body')
ON CONFLICT (code) DO NOTHING;

-- Insert new 100 Level Second Semester courses (only if they don't exist)
INSERT INTO public.courses (code, title, units, status, level, semester, department, overview, description)
VALUES 
  ('GST 112', 'Nigerian Peoples and Culture', 2, 'C', '100', 'Second', 'General Studies', 'LH: 30, PH: -', 'General Studies course on Nigerian Peoples and Culture'),
  ('BIO 102', 'General Biology II', 2, 'C', '100', 'Second', 'Biology', 'LH: 30, PH: -', 'Introduction to General Biology II'),
  ('BIO 108', 'General Biology Practical II', 1, 'C', '100', 'Second', 'Biology', 'LH: -, PH: 45', 'Practical course for General Biology II'),
  ('CHM-CM102', 'General Chemistry II', 2, 'C', '100', 'Second', 'Chemistry', 'LH: 30, PH: -', 'Introduction to General Chemistry II'),
  ('CHM 108', 'General Chemistry Practical II', 1, 'C', '100', 'Second', 'Chemistry', 'LH: -, PH: 45', 'Practical course for General Chemistry II'),
  ('MTH 102', 'Elementary Mathematics II', 2, 'C', '100', 'Second', 'Mathematics', 'LH: 30, PH: -', 'Introduction to Elementary Mathematics II'),
  ('PHY-CM102', 'General Physics II', 2, 'C', '100', 'Second', 'Physics', 'LH: 30, PH: -', 'Introduction to General Physics II'),
  ('PHY-CM104', 'General Physics IV', 2, 'C', '100', 'Second', 'Physics', 'LH: 30, PH: -', 'Introduction to General Physics IV'),
  ('PHY-CM108', 'General Physics Practical II', 1, 'C', '100', 'Second', 'Physics', 'LH: -, PH: 45', 'Practical course for General Physics II'),
  ('ZOO 102', 'Animal Diversity', 2, 'C', '100', 'Second', 'Zoology', 'LH: 15, PH: 45', 'Study of Animal Diversity')
ON CONFLICT (code) DO NOTHING;