-- Update set_article_slug trigger to use original_title for SEO-friendly slugs
CREATE OR REPLACE FUNCTION public.set_article_slug()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    -- Use original_title (Malay/English) for SEO-friendly slugs
    -- Fall back to title if original_title is not available
    NEW.slug := generate_article_slug(COALESCE(NEW.original_title, NEW.title));
  END IF;
  RETURN NEW;
END;
$$;

-- Improve generate_article_slug for better slug generation
CREATE OR REPLACE FUNCTION public.generate_article_slug(title text) 
RETURNS text
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  base_slug text;
  final_slug text;
  random_suffix text;
BEGIN
  -- Convert to lowercase
  base_slug := lower(title);
  
  -- Remove non-ASCII characters (keeps Malay/English)
  base_slug := regexp_replace(base_slug, '[^a-z0-9\s-]', '', 'g');
  
  -- Normalize spaces and hyphens
  base_slug := regexp_replace(base_slug, '\s+', ' ', 'g');
  base_slug := regexp_replace(base_slug, '\s', '-', 'g');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  
  -- Limit length to 60 characters for cleaner URLs
  base_slug := substring(base_slug from 1 for 60);
  base_slug := trim(both '-' from base_slug);
  
  -- Add short unique suffix for uniqueness (8 chars)
  random_suffix := substring(gen_random_uuid()::text from 1 for 8);
  
  -- Handle empty slugs (pure non-ASCII titles)
  IF base_slug = '' OR base_slug IS NULL THEN
    base_slug := 'berita';
  END IF;
  
  final_slug := base_slug || '-' || random_suffix;
  
  RETURN final_slug;
END;
$$;

-- Regenerate slugs for all articles with bad slugs using original_title
UPDATE articles 
SET slug = generate_article_slug(COALESCE(original_title, title)),
    updated_at = now()
WHERE slug ~ '^-?[0-9]+$'
   OR slug IS NULL 
   OR slug = ''
   OR LENGTH(slug) < 5;