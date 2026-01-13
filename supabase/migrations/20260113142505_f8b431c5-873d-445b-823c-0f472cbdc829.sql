-- Drop existing policies on email_alerts
DROP POLICY IF EXISTS "Users can manage their own email alerts" ON public.email_alerts;
DROP POLICY IF EXISTS "Users can view their own email alerts" ON public.email_alerts;

-- Create stricter RLS policies that enforce user ownership
-- SELECT policy - users can only view their own alerts
CREATE POLICY "Users can view own email alerts"
ON public.email_alerts
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- INSERT policy - users can only insert their own alerts
CREATE POLICY "Users can insert own email alerts"
ON public.email_alerts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- UPDATE policy - users can only update their own alerts
CREATE POLICY "Users can update own email alerts"
ON public.email_alerts
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE policy - users can only delete their own alerts
CREATE POLICY "Users can delete own email alerts"
ON public.email_alerts
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Ensure RLS is enabled
ALTER TABLE public.email_alerts ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owner as well (extra protection)
ALTER TABLE public.email_alerts FORCE ROW LEVEL SECURITY;