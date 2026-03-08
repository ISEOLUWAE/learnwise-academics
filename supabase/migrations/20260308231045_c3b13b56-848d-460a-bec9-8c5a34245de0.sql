-- Add content_text column to materials table for storing extracted text from slides/PDFs
-- This allows the AI to answer questions based on actual material content
ALTER TABLE public.materials ADD COLUMN content_text text;

-- Add comment for documentation
COMMENT ON COLUMN public.materials.content_text IS 'Extracted text content from the material file, used by AI for context-aware question generation and grading';