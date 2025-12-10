-- Add column to store custom terms of service
ALTER TABLE public.profiles 
ADD COLUMN custom_terms text;