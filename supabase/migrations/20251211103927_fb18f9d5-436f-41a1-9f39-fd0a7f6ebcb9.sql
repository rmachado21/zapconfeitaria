-- Add order_number column to orders table
ALTER TABLE public.orders ADD COLUMN order_number INTEGER;

-- Create unique index for order_number per user
CREATE UNIQUE INDEX idx_orders_user_order_number ON public.orders (user_id, order_number);

-- Backfill existing orders with sequential numbers per user
WITH numbered_orders AS (
  SELECT id, user_id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) as rn
  FROM public.orders
)
UPDATE public.orders o
SET order_number = no.rn
FROM numbered_orders no
WHERE o.id = no.id;