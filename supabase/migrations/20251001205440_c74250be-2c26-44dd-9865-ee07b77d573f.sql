-- Create quiz_history table to store all quiz attempts
CREATE TABLE IF NOT EXISTS public.quiz_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL,
  time_taken INTEGER, -- in seconds
  questions_data JSONB NOT NULL, -- stores questions, answers, and correct answers
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for quiz_history
ALTER TABLE public.quiz_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quiz_history
CREATE POLICY "Users can view their own quiz history"
ON public.quiz_history
FOR SELECT
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own quiz history"
ON public.quiz_history
FOR INSERT
WITH CHECK (auth.uid()::text = user_id::text);

-- Add index for faster queries
CREATE INDEX idx_quiz_history_user_course ON public.quiz_history(user_id, course_id, created_at DESC);

-- Insert sample courses from Faculty of Science curriculum
INSERT INTO public.courses (code, title, level, semester, units, department, status, description, overview) VALUES
-- 100 Level - 1st Semester
('FSC 111', 'Introductory Biology', '100', 'First', 3, 'Faculty of Science', 'active', 'Introduction to basic biological concepts and principles.', 'This course provides a foundational understanding of biology, covering cell structure, genetics, evolution, and ecology.'),
('FSC 112', 'Introductory Chemistry I', '100', 'First', 3, 'Faculty of Science', 'active', 'Introduction to fundamental concepts of chemistry.', 'This course covers atomic structure, chemical bonding, stoichiometry, and basic chemical reactions.'),
('FSC 113', 'Introductory Computer Science', '100', 'First', 3, 'Faculty of Science', 'active', 'Introduction to computer science and programming fundamentals.', 'Learn the basics of programming, algorithms, data structures, and problem-solving using computers.'),
('FSC 114', 'Introductory Mathematics', '100', 'First', 3, 'Faculty of Science', 'active', 'Foundation course in mathematics.', 'Covers algebra, trigonometry, basic calculus, and mathematical reasoning essential for science students.'),
('FSC 115', 'Introductory Physics I', '100', 'First', 3, 'Faculty of Science', 'active', 'Introduction to classical physics.', 'Study of mechanics, motion, forces, energy, and fundamental physical principles.'),

-- 100 Level - 2nd Semester
('CHM 121', 'Introductory Chemistry II', '100', 'Second', 3, 'Chemistry', 'active', 'Continuation of introductory chemistry.', 'Advanced topics in chemistry including thermodynamics, kinetics, and chemical equilibrium.'),
('CHM 122', 'Experimental Chemistry I', '100', 'Second', 2, 'Chemistry', 'active', 'Laboratory course in chemistry.', 'Hands-on experiments to reinforce theoretical chemistry concepts.'),
('BTN 121', 'General Botany', '100', 'Second', 3, 'Botany', 'active', 'Introduction to plant biology.', 'Study of plant structure, function, classification, and ecology.'),
('CSC 100', 'Computer as a Problem Solving Tool', '100', 'Second', 3, 'Computer Science', 'active', 'Using computers to solve problems.', 'Learn to use programming and computational thinking to solve real-world problems.'),
('MAT 122', 'Calculus', '100', 'Second', 2, 'Mathematics', 'active', 'Introduction to calculus.', 'Study of limits, derivatives, and integrals with applications.'),
('STA 121', 'Statistics for Scientists', '100', 'Second', 3, 'Statistics', 'active', 'Introduction to statistics for science students.', 'Learn data analysis, probability, hypothesis testing, and statistical inference.'),

-- 200 Level Courses
('BCH 211', 'Introductory Biochemistry I', '200', 'First', 2, 'Biochemistry', 'active', 'Introduction to biochemistry.', 'Study of biomolecules, enzymes, and metabolic pathways.'),
('MIC 211', 'Basic Microbiology I', '200', 'First', 3, 'Microbiology', 'active', 'Introduction to microbiology.', 'Study of microorganisms, their structure, function, and importance.'),
('CBG 211', 'Cell Biology', '200', 'First', 3, 'Cell Biology and Genetics', 'active', 'Study of cell structure and function.', 'Detailed examination of cell organelles, cell division, and cellular processes.'),
('CHM 213', 'Basic Organic Chemistry', '200', 'First', 3, 'Chemistry', 'active', 'Introduction to organic chemistry.', 'Study of carbon compounds, reactions, and organic synthesis.'),
('CSC 227', 'Introduction to Information Processing', '200', 'Second', 3, 'Computer Science', 'active', 'Information systems and data processing.', 'Learn about data structures, file processing, and information management systems.'),
('MIC 221', 'Basic Microbiology II', '200', 'Second', 2, 'Microbiology', 'active', 'Advanced microbiology concepts.', 'Continuation of microbiology covering microbial genetics and applied microbiology.'),
('CHM 222', 'Basic Physical Chemistry', '200', 'Second', 2, 'Chemistry', 'active', 'Introduction to physical chemistry.', 'Study of thermodynamics, chemical kinetics, and quantum chemistry.'),

-- 300 Level Courses
('BCH 311', 'Introductory Enzymology', '300', 'First', 3, 'Biochemistry', 'active', 'Study of enzymes and their functions.', 'Detailed examination of enzyme kinetics, mechanisms, and regulation.'),
('CBG 312', 'Genetics I', '300', 'First', 4, 'Cell Biology and Genetics', 'active', 'Introduction to genetics.', 'Study of heredity, gene expression, and genetic variation.'),
('STA 314', 'Statistics for Biologists', '300', 'First', 3, 'Statistics', 'active', 'Statistical methods for biological sciences.', 'Advanced statistical techniques for analyzing biological data.'),
('CHM 313', 'Experimental Chemistry V', '300', 'First', 2, 'Chemistry', 'active', 'Advanced laboratory chemistry.', 'Advanced experimental techniques in chemistry.'),
('BCH 320', 'Principles of Endocrinology', '300', 'Second', 2, 'Biochemistry', 'active', 'Study of hormones and endocrine system.', 'Examination of hormone synthesis, secretion, and mechanisms of action.'),
('BCH 321', 'Principles of Immunology', '300', 'Second', 2, 'Biochemistry', 'active', 'Introduction to immunology.', 'Study of immune system, antibodies, and immune responses.'),
('BCH 322', 'Chemistry and Metabolism of Amino acids and Proteins', '300', 'Second', 2, 'Biochemistry', 'active', 'Protein chemistry and metabolism.', 'Detailed study of amino acids, protein structure, and protein metabolism.'),

-- 400 Level Courses
('BCH 410', 'Advanced Biochemical Methods', '400', 'First', 2, 'Biochemistry', 'active', 'Advanced techniques in biochemistry.', 'Learn modern biochemical research methods and instrumentation.'),
('BCH 411', 'Enzymology', '400', 'First', 2, 'Biochemistry', 'active', 'Advanced enzymology.', 'In-depth study of enzyme mechanisms and applications.'),
('BCH 423', 'Molecular Biology', '400', 'Second', 3, 'Biochemistry', 'active', 'Study of molecular biology.', 'Examination of DNA, RNA, and protein synthesis at the molecular level.'),
('BCH 428', 'Bioinformatics', '400', 'Second', 2, 'Biochemistry', 'active', 'Introduction to bioinformatics.', 'Learn to use computational tools for biological data analysis.'),
('BCH 429', 'Genetic Engineering', '400', 'Second', 2, 'Biochemistry', 'active', 'Techniques in genetic engineering.', 'Study of recombinant DNA technology and genetic manipulation.'),

-- Botany Courses
('BTN 211', 'Variety of Plants I', '200', 'First', 3, 'Botany', 'active', 'Plant diversity and classification.', 'Study of different plant groups and their characteristics.'),
('BTN 221', 'Variety of Plants II', '200', 'Second', 3, 'Botany', 'active', 'Advanced plant diversity.', 'Continuation of plant classification and evolution.'),
('BTN 222', 'Introductory Ecology', '200', 'Second', 3, 'Botany', 'active', 'Introduction to ecology.', 'Study of ecosystems, populations, and environmental interactions.'),
('BTN 311', 'Plant Physiology', '300', 'First', 3, 'Botany', 'active', 'Study of plant functions.', 'Examination of plant metabolism, growth, and development.'),
('BTN 313', 'Mycology I', '300', 'First', 3, 'Botany', 'active', 'Study of fungi.', 'Introduction to fungal biology, classification, and ecology.'),

-- Zoology Courses
('ZLY 111', 'Introductory Zoology I', '100', 'First', 2, 'Zoology', 'active', 'Introduction to animal biology.', 'Study of animal diversity, structure, and function.'),
('ZLY 121', 'Introductory Zoology II', '100', 'Second', 2, 'Zoology', 'active', 'Continuation of zoology.', 'Advanced topics in animal biology.'),
('ZLY 221', 'Animal Structure and Function', '200', 'Second', 3, 'Zoology', 'active', 'Study of animal anatomy and physiology.', 'Detailed examination of animal organ systems.'),
('ZLY 222', 'Man and the Environment', '200', 'Second', 2, 'Zoology', 'active', 'Human impact on environment.', 'Study of environmental issues and conservation.')
ON CONFLICT (code) DO NOTHING;