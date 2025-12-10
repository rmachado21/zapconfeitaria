-- Remove the old check constraint and add a new one that includes 'cento'
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_unit_type_check;
ALTER TABLE public.products ADD CONSTRAINT products_unit_type_check CHECK (unit_type IN ('kg', 'unit', 'cento'));