-- Ensure RLS is enabled on clients table
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Revoke all public/anon access to the clients table
REVOKE ALL ON public.clients FROM anon;
REVOKE ALL ON public.clients FROM public;

-- Grant access only to authenticated users (RLS policies will still apply)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;

-- Force RLS for table owner as well (extra security)
ALTER TABLE public.clients FORCE ROW LEVEL SECURITY;