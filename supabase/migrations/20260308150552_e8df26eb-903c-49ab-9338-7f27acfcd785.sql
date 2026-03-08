
-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Quiz questions are viewable by everyone" ON quiz_questions;

-- Only authenticated users can read quiz questions
CREATE POLICY "Authenticated users can read quiz questions"
  ON quiz_questions
  FOR SELECT
  TO authenticated
  USING (true);
