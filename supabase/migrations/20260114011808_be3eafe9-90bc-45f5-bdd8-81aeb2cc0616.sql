-- Add column to track previous slugs for 301 redirects
ALTER TABLE articles ADD COLUMN IF NOT EXISTS previous_slugs text[] DEFAULT '{}';

-- Create function to save old slug before update
CREATE OR REPLACE FUNCTION public.save_previous_slug()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  -- If slug is being changed and old slug exists and is different
  IF OLD.slug IS NOT NULL 
     AND OLD.slug != '' 
     AND (NEW.slug IS NULL OR NEW.slug != OLD.slug) THEN
    -- Append old slug to previous_slugs array (avoid duplicates)
    IF NOT (OLD.slug = ANY(COALESCE(NEW.previous_slugs, '{}'))) THEN
      NEW.previous_slugs := array_append(COALESCE(NEW.previous_slugs, '{}'), OLD.slug);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to save previous slugs before update
DROP TRIGGER IF EXISTS save_previous_slug_trigger ON articles;
CREATE TRIGGER save_previous_slug_trigger
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION save_previous_slug();