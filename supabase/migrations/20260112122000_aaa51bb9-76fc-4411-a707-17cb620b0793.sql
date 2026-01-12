-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage their own email alerts" ON public.email_alerts;
DROP POLICY IF EXISTS "Users can view their own email alerts" ON public.email_alerts;

-- Create updated policies that explicitly require authentication
CREATE POLICY "Users can manage their own email alerts" 
ON public.email_alerts 
FOR ALL 
TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can view their own email alerts" 
ON public.email_alerts 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);