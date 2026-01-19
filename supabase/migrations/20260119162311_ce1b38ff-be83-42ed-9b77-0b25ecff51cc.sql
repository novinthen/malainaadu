-- Drop overly permissive policy and create more specific ones
DROP POLICY IF EXISTS "Service role can manage subscribers" ON public.push_subscribers;

-- Only allow SELECT for admins (management via edge function with service role)
CREATE POLICY "Admins can view push subscribers"
ON public.push_subscribers
FOR SELECT
USING (public.is_admin(auth.uid()));