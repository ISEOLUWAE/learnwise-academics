-- Remove all FSC courses
DELETE FROM public.courses WHERE code LIKE 'FSC%';

-- Update course status to standardized format
-- Convert 'Compulsory' to 'C' and 'active' to 'C' (assuming most courses are compulsory)
UPDATE public.courses 
SET status = 'C' 
WHERE status IN ('Compulsory', 'active');

-- Convert any remaining 'Elective' to 'E'
UPDATE public.courses 
SET status = 'E' 
WHERE status = 'Elective';

-- Add some elective courses for demonstration (optional)
-- You can uncomment these if you want some elective courses
/*
INSERT INTO public.courses (code, title, level, semester, units, department, status, description, overview) VALUES
('ENG 201', 'Technical Writing', '200', 'First', 2, 'English', 'E', 'Technical writing for engineers and scientists.', 'Learn to write clear, concise technical documents for professional communication.'),
('PHI 101', 'Introduction to Philosophy', '100', 'Second', 2, 'Philosophy', 'E', 'Introduction to philosophical thinking.', 'Explore fundamental questions about existence, knowledge, and ethics.'),
('HIS 101', 'World History', '100', 'First', 2, 'History', 'E', 'Survey of world history.', 'Study major historical events and civilizations from ancient to modern times.');
*/
