-- Update the trigger_rss_fetch function to use vault for Supabase URL
CREATE OR REPLACE FUNCTION public.trigger_rss_fetch()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  supabase_url text;
BEGIN
  -- Get the Supabase URL from vault secrets
  SELECT decrypted_secret INTO supabase_url 
  FROM vault.decrypted_secrets 
  WHERE name = 'SUPABASE_URL';
  
  -- Fallback check if URL not found
  IF supabase_url IS NULL THEN
    RAISE EXCEPTION 'SUPABASE_URL not found in vault secrets';
  END IF;
  
  -- Call the edge function using pg_net
  PERFORM net.http_post(
    url := supabase_url || '/functions/v1/fetch-rss',
    headers := jsonb_build_object(
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
END;
$$;

-- Add comment documenting the configuration
COMMENT ON FUNCTION public.trigger_rss_fetch() IS 
'Triggers RSS feed fetching via edge function. 
Requires SUPABASE_URL to be configured in vault secrets.
Called by pg_cron scheduled job every 15 minutes.';