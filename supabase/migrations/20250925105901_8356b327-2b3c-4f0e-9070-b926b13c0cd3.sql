-- Create courses table
CREATE TABLE public.courses (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    level TEXT NOT NULL,
    semester TEXT NOT NULL,
    units INTEGER NOT NULL,
    department TEXT NOT NULL,
    status TEXT NOT NULL,
    description TEXT NOT NULL,
    overview TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create textbooks table
CREATE TABLE public.textbooks (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    year INTEGER NOT NULL,
    download_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create materials table
CREATE TABLE public.materials (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    duration TEXT,
    pages INTEGER,
    link TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create past_questions table
CREATE TABLE public.past_questions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    semester TEXT NOT NULL,
    link TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quiz_questions table
CREATE TABLE public.quiz_questions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer INTEGER NOT NULL,
    explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create leaderboard table
CREATE TABLE public.leaderboard (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(course_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.textbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.past_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- Create policies for courses (public read access)
CREATE POLICY "Courses are viewable by everyone" 
ON public.courses 
FOR SELECT 
USING (true);

-- Create policies for textbooks (public read access)
CREATE POLICY "Textbooks are viewable by everyone" 
ON public.textbooks 
FOR SELECT 
USING (true);

-- Create policies for materials (public read access)
CREATE POLICY "Materials are viewable by everyone" 
ON public.materials 
FOR SELECT 
USING (true);

-- Create policies for past_questions (public read access)
CREATE POLICY "Past questions are viewable by everyone" 
ON public.past_questions 
FOR SELECT 
USING (true);

-- Create policies for quiz_questions (public read access)
CREATE POLICY "Quiz questions are viewable by everyone" 
ON public.quiz_questions 
FOR SELECT 
USING (true);

-- Create policies for leaderboard (read by everyone, update by authenticated users)
CREATE POLICY "Leaderboard is viewable by everyone" 
ON public.leaderboard 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own leaderboard score" 
ON public.leaderboard 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their existing score" 
ON public.leaderboard 
FOR UPDATE 
USING (auth.uid()::text = user_id::text);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_courses_updated_at
    BEFORE UPDATE ON public.courses
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leaderboard_updated_at
    BEFORE UPDATE ON public.leaderboard
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample course data
INSERT INTO public.courses (code, title, level, semester, units, department, status, description, overview) VALUES
('MTH 101', 'Elementary Mathematics I', '100', 'First', 2, 'Mathematics', 'Compulsory', 
 'This course covers fundamental mathematical concepts including algebra, trigonometry, and basic calculus. Students will develop problem-solving skills essential for computer science applications.',
 'Elementary Mathematics I is designed to provide students with a solid foundation in mathematical concepts. The course emphasizes practical applications in computer science and prepares students for advanced mathematical courses.'),
('COS 101', 'Introduction to Computing Sciences', '100', 'First', 3, 'Computer Science', 'Compulsory',
 'Introduction to fundamental computing concepts, programming basics, and computer systems.',
 'This course introduces students to the world of computing, covering basic programming concepts, computer systems, and computational thinking.');

-- Insert sample textbooks
INSERT INTO public.textbooks (course_id, title, author, year, download_link) VALUES
((SELECT id FROM public.courses WHERE code = 'MTH 101'), 'Mathematics for Computer Science', 'John Smith', 2023, '#'),
((SELECT id FROM public.courses WHERE code = 'MTH 101'), 'Algebra and Trigonometry', 'Jane Doe', 2022, '#'),
((SELECT id FROM public.courses WHERE code = 'COS 101'), 'Introduction to Computer Science', 'Robert Williams', 2023, '#');

-- Insert sample materials
INSERT INTO public.materials (course_id, type, title, duration, pages, link) VALUES
((SELECT id FROM public.courses WHERE code = 'MTH 101'), 'video', 'Introduction to Algebra', '45 min', NULL, '#'),
((SELECT id FROM public.courses WHERE code = 'MTH 101'), 'slides', 'Trigonometric Functions', NULL, 32, '#'),
((SELECT id FROM public.courses WHERE code = 'MTH 101'), 'notes', 'Course Notes - Week 1', NULL, NULL, '#'),
((SELECT id FROM public.courses WHERE code = 'COS 101'), 'video', 'Programming Fundamentals', '60 min', NULL, '#'),
((SELECT id FROM public.courses WHERE code = 'COS 101'), 'slides', 'Computer Systems Overview', NULL, 45, '#');

-- Insert sample past questions
INSERT INTO public.past_questions (course_id, year, semester, link) VALUES
((SELECT id FROM public.courses WHERE code = 'MTH 101'), 2023, 'First', '#'),
((SELECT id FROM public.courses WHERE code = 'MTH 101'), 2022, 'First', '#'),
((SELECT id FROM public.courses WHERE code = 'MTH 101'), 2021, 'First', '#'),
((SELECT id FROM public.courses WHERE code = 'COS 101'), 2023, 'First', '#'),
((SELECT id FROM public.courses WHERE code = 'COS 101'), 2022, 'First', '#');

-- Insert sample quiz questions
INSERT INTO public.quiz_questions (course_id, question, options, correct_answer, explanation) VALUES
((SELECT id FROM public.courses WHERE code = 'MTH 101'), 'What is the value of sin(90°)?', '["0", "1", "-1", "0.5"]', 1, 'sin(90°) = 1 because at 90 degrees, the y-coordinate on the unit circle is 1.'),
((SELECT id FROM public.courses WHERE code = 'MTH 101'), 'What is 2 + 2?', '["3", "4", "5", "6"]', 1, 'Basic arithmetic: 2 + 2 = 4'),
((SELECT id FROM public.courses WHERE code = 'COS 101'), 'What does CPU stand for?', '["Central Processing Unit", "Computer Personal Unit", "Central Program Unit", "Computer Processing Unit"]', 0, 'CPU stands for Central Processing Unit, which is the main processor of a computer.');

-- Insert sample leaderboard data
INSERT INTO public.leaderboard (course_id, user_id, name, score, avatar) VALUES
((SELECT id FROM public.courses WHERE code = 'MTH 101'), gen_random_uuid(), 'John Doe', 98, 'JD'),
((SELECT id FROM public.courses WHERE code = 'MTH 101'), gen_random_uuid(), 'Jane Smith', 95, 'JS'),
((SELECT id FROM public.courses WHERE code = 'MTH 101'), gen_random_uuid(), 'Mike Johnson', 92, 'MJ'),
((SELECT id FROM public.courses WHERE code = 'COS 101'), gen_random_uuid(), 'Sarah Connor', 97, 'SC'),
((SELECT id FROM public.courses WHERE code = 'COS 101'), gen_random_uuid(), 'Tom Brady', 94, 'TB'),
((SELECT id FROM public.courses WHERE code = 'COS 101'), gen_random_uuid(), 'Lisa Johnson', 91, 'LJ');