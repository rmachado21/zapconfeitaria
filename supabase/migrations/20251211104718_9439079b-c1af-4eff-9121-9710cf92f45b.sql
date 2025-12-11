-- Add order_number_start column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN order_number_start INTEGER NOT NULL DEFAULT 1;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.order_number_start IS 'Starting number for order numbering sequence';