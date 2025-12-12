-- Add address column to clients table
ALTER TABLE public.clients 
ADD COLUMN address TEXT DEFAULT NULL;