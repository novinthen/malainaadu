-- Create a function to clean up old article view tracking data
-- Retains data for 90 days only
CREATE OR REPLACE FUNCTION public.cleanup_old_article_views()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.article_views
  WHERE viewed_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Add comment documenting the retention policy
COMMENT ON FUNCTION public.cleanup_old_article_views() IS 
'Data retention policy: Deletes article view tracking data older than 90 days. 
Should be called periodically via scheduled job or manual trigger.
This protects user privacy by limiting how long behavioral data is stored.';