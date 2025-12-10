-- Add column to store preference for including terms in PDF
ALTER TABLE public.profiles 
ADD COLUMN include_terms_in_pdf boolean NOT NULL DEFAULT true;