-- Add is_gift column to order_items table
ALTER TABLE public.order_items 
ADD COLUMN is_gift boolean NOT NULL DEFAULT false;