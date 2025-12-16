-- Create department files table for shared files with AI integration
CREATE TABLE public.department_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  department_space_id UUID NOT NULL REFERENCES public.department_spaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cohort quizzes table
CREATE TABLE public.cohort_quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  department_space_id UUID NOT NULL REFERENCES public.department_spaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_id UUID REFERENCES public.department_files(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cohort quiz questions table
CREATE TABLE public.cohort_quiz_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.cohort_quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer INTEGER NOT NULL,
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cohort quiz results table
CREATE TABLE public.cohort_quiz_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.cohort_quizzes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL,
  answers JSONB NOT NULL DEFAULT '[]',
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(quiz_id, user_id)
);

-- Enable RLS
ALTER TABLE public.department_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cohort_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cohort_quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cohort_quiz_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for department_files
CREATE POLICY "Members can view department files"
  ON public.department_files FOR SELECT
  USING (is_department_member(auth.uid(), department_space_id));

CREATE POLICY "Managers can upload files"
  ON public.department_files FOR INSERT
  WITH CHECK (can_manage_department(auth.uid(), department_space_id));

CREATE POLICY "Managers can delete files"
  ON public.department_files FOR DELETE
  USING (can_manage_department(auth.uid(), department_space_id));

-- RLS Policies for cohort_quizzes
CREATE POLICY "Members can view cohort quizzes"
  ON public.cohort_quizzes FOR SELECT
  USING (is_department_member(auth.uid(), department_space_id));

CREATE POLICY "Managers can create quizzes"
  ON public.cohort_quizzes FOR INSERT
  WITH CHECK (can_manage_department(auth.uid(), department_space_id));

CREATE POLICY "Managers can update quizzes"
  ON public.cohort_quizzes FOR UPDATE
  USING (can_manage_department(auth.uid(), department_space_id));

CREATE POLICY "Managers can delete quizzes"
  ON public.cohort_quizzes FOR DELETE
  USING (can_manage_department(auth.uid(), department_space_id));

-- RLS Policies for cohort_quiz_questions
CREATE POLICY "Members can view quiz questions"
  ON public.cohort_quiz_questions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.cohort_quizzes cq 
    WHERE cq.id = quiz_id AND is_department_member(auth.uid(), cq.department_space_id)
  ));

CREATE POLICY "Managers can manage quiz questions"
  ON public.cohort_quiz_questions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.cohort_quizzes cq 
    WHERE cq.id = quiz_id AND can_manage_department(auth.uid(), cq.department_space_id)
  ));

-- RLS Policies for cohort_quiz_results
CREATE POLICY "Users can view their own results"
  ON public.cohort_quiz_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can submit their results"
  ON public.cohort_quiz_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Managers can view all results"
  ON public.cohort_quiz_results FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.cohort_quizzes cq 
    WHERE cq.id = quiz_id AND can_manage_department(auth.uid(), cq.department_space_id)
  ));

-- Create storage bucket for department files
INSERT INTO storage.buckets (id, name, public) VALUES ('department-files', 'department-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for department files
CREATE POLICY "Members can view department files storage"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'department-files');

CREATE POLICY "Managers can upload department files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'department-files' AND auth.uid() IS NOT NULL);

CREATE POLICY "Managers can delete department files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'department-files' AND auth.uid() IS NOT NULL);