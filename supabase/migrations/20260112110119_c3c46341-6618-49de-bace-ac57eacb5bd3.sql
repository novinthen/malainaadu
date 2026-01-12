-- Create enum for article status
CREATE TYPE public.article_status AS ENUM ('draft', 'pending', 'published', 'rejected');

-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator');

-- Create sources table (RSS feed sources)
CREATE TABLE public.sources (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    rss_url TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create categories table
CREATE TABLE public.categories (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create articles table
CREATE TABLE public.articles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    original_title TEXT,
    content TEXT NOT NULL,
    original_content TEXT,
    excerpt TEXT,
    image_url TEXT,
    source_id UUID REFERENCES public.sources(id) ON DELETE SET NULL,
    original_url TEXT UNIQUE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    status public.article_status NOT NULL DEFAULT 'pending',
    view_count INTEGER NOT NULL DEFAULT 0,
    publish_date TIMESTAMP WITH TIME ZONE,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_breaking BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table for admin management
CREATE TABLE public.user_roles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role public.app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create email_alerts table for notification preferences
CREATE TABLE public.email_alerts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    new_articles BOOLEAN NOT NULL DEFAULT true,
    processing_errors BOOLEAN NOT NULL DEFAULT true,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create article_views table for analytics
CREATE TABLE public.article_views (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE NOT NULL,
    viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    user_agent TEXT,
    ip_hash TEXT
);

-- Enable Row Level Security on all tables
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_views ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user is any admin role
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'moderator')
  )
$$;

-- RLS Policies for sources (public read, admin write)
CREATE POLICY "Sources are viewable by everyone"
ON public.sources FOR SELECT
USING (true);

CREATE POLICY "Admins can manage sources"
ON public.sources FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- RLS Policies for categories (public read, admin write)
CREATE POLICY "Categories are viewable by everyone"
ON public.categories FOR SELECT
USING (true);

CREATE POLICY "Admins can manage categories"
ON public.categories FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- RLS Policies for articles (public read published, admin manage all)
CREATE POLICY "Published articles are viewable by everyone"
ON public.articles FOR SELECT
USING (status = 'published' OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage articles"
ON public.articles FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- RLS Policies for user_roles (admins only)
CREATE POLICY "Admins can view all user roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage user roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for email_alerts (own data only)
CREATE POLICY "Users can view their own email alerts"
ON public.email_alerts FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own email alerts"
ON public.email_alerts FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for article_views (public insert, admin read)
CREATE POLICY "Anyone can record article views"
ON public.article_views FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view article analytics"
ON public.article_views FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_sources_updated_at
BEFORE UPDATE ON public.sources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_articles_updated_at
BEFORE UPDATE ON public.articles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_alerts_updated_at
BEFORE UPDATE ON public.email_alerts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_articles_status ON public.articles(status);
CREATE INDEX idx_articles_category ON public.articles(category_id);
CREATE INDEX idx_articles_source ON public.articles(source_id);
CREATE INDEX idx_articles_publish_date ON public.articles(publish_date DESC);
CREATE INDEX idx_articles_view_count ON public.articles(view_count DESC);
CREATE INDEX idx_article_views_article ON public.article_views(article_id);
CREATE INDEX idx_article_views_viewed_at ON public.article_views(viewed_at);

-- Insert default categories
INSERT INTO public.categories (name, slug) VALUES
    ('Politik', 'politik'),
    ('Sukan', 'sukan'),
    ('Hiburan', 'hiburan'),
    ('Ekonomi', 'ekonomi'),
    ('Jenayah', 'jenayah'),
    ('Nasional', 'nasional'),
    ('Antarabangsa', 'antarabangsa'),
    ('Teknologi', 'teknologi'),
    ('Kesihatan', 'kesihatan'),
    ('Pendidikan', 'pendidikan');

-- Insert initial RSS sources
INSERT INTO public.sources (name, rss_url) VALUES
    ('Sinar Harian', 'https://rss.app/feeds/bzP9UJBRhbFTFdQ1.xml'),
    ('Astro Awani', 'https://rss.app/feeds/fO7UnPjfBnIQNeuK.xml');