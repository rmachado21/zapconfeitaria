-- Ensure RLS is enabled on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Revoke all public/anon access to the profiles table
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.profiles FROM public;

-- Grant access only to authenticated users (RLS policies will still apply)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;

-- Force RLS for table owner as well (extra security)
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;