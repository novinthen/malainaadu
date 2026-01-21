-- Create facebook_post_logs table for tracking posting attempts
CREATE TABLE public.facebook_post_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  error_message TEXT,
  response_data JSONB DEFAULT '{}'::jsonb,
  attempted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.facebook_post_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all logs
CREATE POLICY "Admins can view facebook post logs"
ON public.facebook_post_logs
FOR SELECT
USING (is_admin(auth.uid()));

-- Service role can insert/update logs (from edge functions)
CREATE POLICY "Service role can manage facebook post logs"
ON public.facebook_post_logs
FOR ALL
USING (true)
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_facebook_post_logs_article_id ON public.facebook_post_logs(article_id);
CREATE INDEX idx_facebook_post_logs_status ON public.facebook_post_logs(status);
CREATE INDEX idx_facebook_post_logs_attempted_at ON public.facebook_post_logs(attempted_at DESC);