-- Add delivery_time column to orders table
ALTER TABLE public.orders ADD COLUMN delivery_time time without time zone DEFAULT NULL;