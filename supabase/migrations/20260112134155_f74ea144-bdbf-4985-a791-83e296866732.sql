-- Fix trigger_rss_fetch to use direct URL instead of vault lookup
-- The Supabase URL is a public endpoint, not a secret

CREATE OR REPLACE FUNCTION public.trigger_rss_fetch()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Call the edge function using pg_net
  PERFORM net.http_post(
    url := 'https://mnzzhsaaxdwbklmqvjrb.supabase.co/functions/v1/fetch-rss',
    headers := jsonb_build_object(
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
END;
$function$;