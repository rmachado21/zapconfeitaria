-- Add column to store hide cancelled orders preference
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS hide_cancelled_orders boolean NOT NULL DEFAULT false;