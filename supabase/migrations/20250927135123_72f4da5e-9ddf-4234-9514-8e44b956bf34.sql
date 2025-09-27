-- Create community_posts table for course discussions
CREATE TABLE public.community_posts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    user_name TEXT NOT NULL,
    user_avatar TEXT,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
    likes INTEGER NOT NULL DEFAULT 0,
    file_url TEXT,
    file_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create community_likes table for tracking post likes
CREATE TABLE public.community_likes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(post_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_likes ENABLE ROW LEVEL SECURITY;

-- Create policies for community_posts
CREATE POLICY "Community posts are viewable by everyone" 
ON public.community_posts 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create posts" 
ON public.community_posts 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own posts" 
ON public.community_posts 
FOR UPDATE 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own posts" 
ON public.community_posts 
FOR DELETE 
USING (auth.uid()::text = user_id::text);

-- Create policies for community_likes
CREATE POLICY "Community likes are viewable by everyone" 
ON public.community_likes 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can like posts" 
ON public.community_likes 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can remove their own likes" 
ON public.community_likes 
FOR DELETE 
USING (auth.uid()::text = user_id::text);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_community_posts_updated_at
    BEFORE UPDATE ON public.community_posts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update post likes count
CREATE OR REPLACE FUNCTION public.update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.community_posts 
        SET likes = likes + 1 
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.community_posts 
        SET likes = likes - 1 
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers to automatically update likes count
CREATE TRIGGER update_likes_count_on_insert
    AFTER INSERT ON public.community_likes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_post_likes_count();

CREATE TRIGGER update_likes_count_on_delete
    AFTER DELETE ON public.community_likes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_post_likes_count();