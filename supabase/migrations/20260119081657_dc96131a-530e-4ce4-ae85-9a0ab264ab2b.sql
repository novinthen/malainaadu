-- Create alert_logs table to track sent alerts
CREATE TABLE public.alert_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL,
  message TEXT NOT NULL,
  recipients TEXT[] NOT NULL DEFAULT '{}',
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on alert_logs
ALTER TABLE public.alert_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view alert logs
CREATE POLICY "Admins can view alert logs"
ON public.alert_logs
FOR SELECT
USING (is_admin(auth.uid()));

-- Only service role can insert (from edge function)
CREATE POLICY "Service role can insert alert logs"
ON public.alert_logs
FOR INSERT
WITH CHECK (true);

-- Add columns to email_alerts table for cooldown tracking
ALTER TABLE public.email_alerts
ADD COLUMN IF NOT EXISTS last_alert_sent TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS alert_cooldown_minutes INTEGER NOT NULL DEFAULT 60;