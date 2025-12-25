-- Add google_review_url column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN google_review_url text;