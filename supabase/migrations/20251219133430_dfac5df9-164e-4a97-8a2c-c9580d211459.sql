-- Add deposit_amount column to store the actual deposit value received
ALTER TABLE public.orders 
ADD COLUMN deposit_amount numeric DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.orders.deposit_amount IS 'Actual deposit amount received (may differ from 50% of total)';