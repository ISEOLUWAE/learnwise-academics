-- Create enum for department space user roles
CREATE TYPE public.department_role AS ENUM ('student', 'class_rep', 'dept_admin');

-- Create department_spaces table
CREATE TABLE public.department_spaces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school TEXT NOT NULL,
  department TEXT NOT NULL,
  level TEXT NOT NULL,
  display_tag TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE(school, department, level)
);

-- Create department_members table (links users to department spaces)
CREATE TABLE public.department_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  department_space_id UUID NOT NULL REFERENCES public.department_spaces(id) ON DELETE CASCADE,
  role department_role NOT NULL DEFAULT 'student',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, department_space_id)
);

-- Create department_announcements table
CREATE TABLE public.department_announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  department_space_id UUID NOT NULL REFERENCES public.department_spaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_urgent BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create department_timetables table
CREATE TABLE public.department_timetables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  department_space_id UUID NOT NULL REFERENCES public.department_spaces(id) ON DELETE CASCADE,
  day_of_week TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  course_code TEXT NOT NULL,
  course_title TEXT NOT NULL,
  venue TEXT,
  lecturer TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create department_votes table for class rep voting
CREATE TABLE public.department_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  department_space_id UUID NOT NULL REFERENCES public.department_spaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Class Representative Election',
  is_active BOOLEAN NOT NULL DEFAULT false,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vote_candidates table
CREATE TABLE public.vote_candidates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vote_id UUID NOT NULL REFERENCES public.department_votes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  manifesto TEXT,
  vote_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(vote_id, user_id)
);

-- Create user_votes table (tracks who voted, not who they voted for - anonymous)
CREATE TABLE public.user_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vote_id UUID NOT NULL REFERENCES public.department_votes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  voted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(vote_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.department_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.department_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.department_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.department_timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.department_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vote_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_votes ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is member of a department space
CREATE OR REPLACE FUNCTION public.is_department_member(_user_id UUID, _department_space_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.department_members
    WHERE user_id = _user_id AND department_space_id = _department_space_id
  )
$$;

-- Helper function to check if user has specific department role
CREATE OR REPLACE FUNCTION public.has_department_role(_user_id UUID, _department_space_id UUID, _role department_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.department_members
    WHERE user_id = _user_id 
      AND department_space_id = _department_space_id 
      AND role = _role
  )
$$;

-- Helper function to check if user can manage department (class_rep or dept_admin)
CREATE OR REPLACE FUNCTION public.can_manage_department(_user_id UUID, _department_space_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.department_members
    WHERE user_id = _user_id 
      AND department_space_id = _department_space_id 
      AND role IN ('class_rep', 'dept_admin')
  )
$$;

-- RLS Policies for department_spaces
CREATE POLICY "Anyone can view department spaces"
  ON public.department_spaces FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create department spaces"
  ON public.department_spaces FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for department_members
CREATE POLICY "Members can view their department members"
  ON public.department_members FOR SELECT
  USING (is_department_member(auth.uid(), department_space_id));

CREATE POLICY "Users can join department spaces"
  ON public.department_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Dept admins can update member roles"
  ON public.department_members FOR UPDATE
  USING (has_department_role(auth.uid(), department_space_id, 'dept_admin'));

CREATE POLICY "Users can leave department spaces"
  ON public.department_members FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for department_announcements
CREATE POLICY "Members can view announcements"
  ON public.department_announcements FOR SELECT
  USING (is_department_member(auth.uid(), department_space_id));

CREATE POLICY "Managers can create announcements"
  ON public.department_announcements FOR INSERT
  WITH CHECK (can_manage_department(auth.uid(), department_space_id));

CREATE POLICY "Managers can update announcements"
  ON public.department_announcements FOR UPDATE
  USING (can_manage_department(auth.uid(), department_space_id));

CREATE POLICY "Managers can delete announcements"
  ON public.department_announcements FOR DELETE
  USING (can_manage_department(auth.uid(), department_space_id));

-- RLS Policies for department_timetables
CREATE POLICY "Members can view timetables"
  ON public.department_timetables FOR SELECT
  USING (is_department_member(auth.uid(), department_space_id));

CREATE POLICY "Managers can create timetables"
  ON public.department_timetables FOR INSERT
  WITH CHECK (can_manage_department(auth.uid(), department_space_id));

CREATE POLICY "Managers can update timetables"
  ON public.department_timetables FOR UPDATE
  USING (can_manage_department(auth.uid(), department_space_id));

CREATE POLICY "Managers can delete timetables"
  ON public.department_timetables FOR DELETE
  USING (can_manage_department(auth.uid(), department_space_id));

-- RLS Policies for department_votes
CREATE POLICY "Members can view votes"
  ON public.department_votes FOR SELECT
  USING (is_department_member(auth.uid(), department_space_id));

CREATE POLICY "Dept admins can create votes"
  ON public.department_votes FOR INSERT
  WITH CHECK (has_department_role(auth.uid(), department_space_id, 'dept_admin'));

CREATE POLICY "Dept admins can update votes"
  ON public.department_votes FOR UPDATE
  USING (has_department_role(auth.uid(), department_space_id, 'dept_admin'));

-- RLS Policies for vote_candidates
CREATE POLICY "Members can view candidates"
  ON public.vote_candidates FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.department_votes dv
    WHERE dv.id = vote_id AND is_department_member(auth.uid(), dv.department_space_id)
  ));

CREATE POLICY "Members can register as candidates"
  ON public.vote_candidates FOR INSERT
  WITH CHECK (auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM public.department_votes dv
    WHERE dv.id = vote_id AND is_department_member(auth.uid(), dv.department_space_id)
  ));

-- RLS Policies for user_votes
CREATE POLICY "Users can see if they voted"
  ON public.user_votes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Members can vote once"
  ON public.user_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM public.department_votes dv
    WHERE dv.id = vote_id 
      AND dv.is_active = true
      AND is_department_member(auth.uid(), dv.department_space_id)
  ));

-- Create indexes for performance
CREATE INDEX idx_department_members_user ON public.department_members(user_id);
CREATE INDEX idx_department_members_space ON public.department_members(department_space_id);
CREATE INDEX idx_department_announcements_space ON public.department_announcements(department_space_id);
CREATE INDEX idx_department_timetables_space ON public.department_timetables(department_space_id);
CREATE INDEX idx_department_votes_space ON public.department_votes(department_space_id);

-- Add trigger for updated_at on announcements
CREATE TRIGGER update_department_announcements_updated_at
  BEFORE UPDATE ON public.department_announcements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for updated_at on timetables
CREATE TRIGGER update_department_timetables_updated_at
  BEFORE UPDATE ON public.department_timetables
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();