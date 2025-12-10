-- Add hidden_kanban_columns field to profiles table
ALTER TABLE public.profiles ADD COLUMN hidden_kanban_columns text[] DEFAULT '{}';