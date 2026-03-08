
-- Allow admins to manage courses
CREATE POLICY "Admins can insert courses" ON public.courses FOR INSERT TO authenticated WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admins can update courses" ON public.courses FOR UPDATE TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admins can delete courses" ON public.courses FOR DELETE TO authenticated USING (is_admin(auth.uid()));

-- Allow admins to delete leaderboard entries
CREATE POLICY "Admins can delete leaderboard entries" ON public.leaderboard FOR DELETE TO authenticated USING (is_admin(auth.uid()));

-- Create theory quiz tables
CREATE TABLE public.theory_quiz_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  ai_score INTEGER DEFAULT 0,
  ai_feedback TEXT,
  max_score INTEGER DEFAULT 10,
  graded BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.theory_quiz_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own theory submissions" ON public.theory_quiz_submissions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own theory submissions" ON public.theory_quiz_submissions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all theory submissions" ON public.theory_quiz_submissions FOR SELECT TO authenticated USING (is_admin(auth.uid()));
