-- Drop the INSERT policy - only backend/webhooks should create subscriptions
DROP POLICY IF EXISTS "Users can insert own subscription" ON public.subscriptions;

-- Drop the UPDATE policy - only backend/webhooks should update subscriptions
DROP POLICY IF EXISTS "Users can update own subscription" ON public.subscriptions;

-- Add a policy that allows admins to manage all subscriptions (for admin dashboard)
CREATE POLICY "Admins can manage subscriptions"
ON public.subscriptions
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));