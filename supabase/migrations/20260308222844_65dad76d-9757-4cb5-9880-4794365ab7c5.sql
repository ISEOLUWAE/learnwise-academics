CREATE TABLE public.theory_quiz_bank (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  question text NOT NULL,
  reference_answer text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.theory_quiz_bank ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Theory quiz bank is viewable by everyone"
ON public.theory_quiz_bank FOR SELECT
USING (true);

CREATE POLICY "Admins can manage theory quiz bank"
ON public.theory_quiz_bank FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));