-- Ensure unique email and username constraints on profiles
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_username_unique UNIQUE (username);

-- Create news table with admin management
CREATE TABLE IF NOT EXISTS public.news (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_external BOOLEAN NOT NULL DEFAULT false,
  external_link TEXT,
  google_ads_slot TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create scholarships table with admin management
CREATE TABLE IF NOT EXISTS public.scholarships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  provider TEXT NOT NULL,
  type TEXT NOT NULL,
  level TEXT NOT NULL,
  amount TEXT NOT NULL,
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
  description TEXT NOT NULL,
  apply_link TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  google_ads_slot TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on news and scholarships
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;

-- RLS policies for news
CREATE POLICY "News are viewable by everyone" ON public.news
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert news" ON public.news
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update news" ON public.news
  FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete news" ON public.news
  FOR DELETE USING (is_admin(auth.uid()));

-- RLS policies for scholarships
CREATE POLICY "Scholarships are viewable by everyone" ON public.scholarships
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert scholarships" ON public.scholarships
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update scholarships" ON public.scholarships
  FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete scholarships" ON public.scholarships
  FOR DELETE USING (is_admin(auth.uid()));

-- Add trigger for updated_at on news
CREATE TRIGGER update_news_updated_at
  BEFORE UPDATE ON public.news
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for updated_at on scholarships
CREATE TRIGGER update_scholarships_updated_at
  BEFORE UPDATE ON public.scholarships
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add admin_reply field to community_posts for admin identification
ALTER TABLE public.community_posts
  ADD COLUMN IF NOT EXISTS is_admin_reply BOOLEAN NOT NULL DEFAULT false;