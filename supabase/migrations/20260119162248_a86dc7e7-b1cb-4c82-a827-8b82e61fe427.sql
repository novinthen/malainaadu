-- Create push_subscribers table for mobile push notifications
CREATE TABLE public.push_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_token TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL CHECK (platform IN ('android', 'ios')),
  device_info JSONB DEFAULT '{}',
  categories TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.push_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow anyone to subscribe (insert)
CREATE POLICY "Anyone can subscribe to push notifications"
ON public.push_subscribers
FOR INSERT
WITH CHECK (true);

-- Allow updates/deletes by matching device token (handled via edge function with service role)
CREATE POLICY "Service role can manage subscribers"
ON public.push_subscribers
FOR ALL
USING (true)
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_push_subscribers_device_token ON public.push_subscribers(device_token);
CREATE INDEX idx_push_subscribers_platform ON public.push_subscribers(platform);
CREATE INDEX idx_push_subscribers_is_active ON public.push_subscribers(is_active);

-- Add trigger for updated_at
CREATE TRIGGER update_push_subscribers_updated_at
BEFORE UPDATE ON public.push_subscribers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();