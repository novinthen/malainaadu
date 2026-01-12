-- Add slug column to articles
ALTER TABLE public.articles 
ADD COLUMN slug text;

-- Create unique index for URL lookups
CREATE UNIQUE INDEX articles_slug_unique ON public.articles(slug) WHERE slug IS NOT NULL;

-- Create index for fast slug lookups
CREATE INDEX articles_slug_idx ON public.articles(slug);

-- Create slug generation function
CREATE OR REPLACE FUNCTION public.generate_article_slug(title text)
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  -- Convert to lowercase and replace spaces/special chars with hyphens
  base_slug := lower(title);
  -- Remove special characters, keep alphanumeric and spaces
  base_slug := regexp_replace(base_slug, '[^a-z0-9\s-]', '', 'g');
  -- Replace multiple spaces with single space
  base_slug := regexp_replace(base_slug, '\s+', ' ', 'g');
  -- Replace spaces with hyphens
  base_slug := regexp_replace(base_slug, '\s', '-', 'g');
  -- Remove multiple consecutive hyphens
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  -- Trim hyphens from start and end
  base_slug := trim(both '-' from base_slug);
  -- Limit length to 80 characters
  base_slug := substring(base_slug from 1 for 80);
  
  -- Check for uniqueness and add suffix if needed
  final_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM articles WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

-- Create trigger function for auto-slug generation
CREATE OR REPLACE FUNCTION public.set_article_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_article_slug(NEW.title);
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER article_slug_trigger
BEFORE INSERT ON public.articles
FOR EACH ROW
EXECUTE FUNCTION set_article_slug();

-- Backfill existing articles with slugs
UPDATE public.articles 
SET slug = public.generate_article_slug(title) 
WHERE slug IS NULL;