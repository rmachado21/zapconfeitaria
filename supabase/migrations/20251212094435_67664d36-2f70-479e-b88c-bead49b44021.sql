-- Add columns for full upfront payment functionality
ALTER TABLE public.orders ADD COLUMN full_payment_received boolean DEFAULT false;
ALTER TABLE public.orders ADD COLUMN payment_method text;
ALTER TABLE public.orders ADD COLUMN payment_fee numeric DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN public.orders.full_payment_received IS 'Indicates if the full payment was received upfront';
COMMENT ON COLUMN public.orders.payment_method IS 'Payment method used: pix, credit_card, or link';
COMMENT ON COLUMN public.orders.payment_fee IS 'Fee charged by payment processor (for credit_card/link)';