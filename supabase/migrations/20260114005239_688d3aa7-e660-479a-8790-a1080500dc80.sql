-- Function to auto-feature the latest published article
CREATE OR REPLACE FUNCTION public.auto_feature_latest_article()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only trigger when status is set to 'published'
  IF NEW.status = 'published' THEN
    -- Unfeature all other articles
    UPDATE articles 
    SET is_featured = false 
    WHERE id != NEW.id AND is_featured = true;
    
    -- Feature this article
    NEW.is_featured := true;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger that fires before insert or update of status
CREATE TRIGGER trigger_auto_feature_latest
  BEFORE INSERT OR UPDATE OF status ON articles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_feature_latest_article();