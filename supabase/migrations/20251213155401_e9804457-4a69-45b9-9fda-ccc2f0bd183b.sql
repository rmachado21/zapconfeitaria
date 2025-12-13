-- Allow admins to delete subscription records (for GDPR/LGPD compliance)
CREATE POLICY "Admins can delete subscriptions"
ON public.subscriptions
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::app_role));