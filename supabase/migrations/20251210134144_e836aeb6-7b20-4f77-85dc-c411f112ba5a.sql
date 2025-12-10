-- Add cpf_cnpj column to clients table
ALTER TABLE public.clients 
ADD COLUMN cpf_cnpj TEXT;