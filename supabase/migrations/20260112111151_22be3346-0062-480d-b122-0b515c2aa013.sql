-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a function to call the fetch-rss edge function
CREATE OR REPLACE FUNCTION public.trigger_rss_fetch()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  supabase_url text;
  service_key text;
BEGIN
  -- Get the Supabase URL and service key from vault or use project URL
  supabase_url := 'https://mnzzhsaaxdwbklmqvjrb.supabase.co';
  
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

-- Schedule the RSS fetch to run every 15 minutes
SELECT cron.schedule(
  'fetch-rss-schedule',
  '*/15 * * * *',  -- Every 15 minutes
  $$SELECT public.trigger_rss_fetch()$$
);

-- Create a table to log fetch runs (for monitoring)
CREATE TABLE IF NOT EXISTS public.fetch_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  articles_processed INTEGER DEFAULT 0,
  articles_skipped INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'running',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on fetch_logs
ALTER TABLE public.fetch_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view fetch logs
CREATE POLICY "Admins can view fetch logs"
ON public.fetch_logs FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));