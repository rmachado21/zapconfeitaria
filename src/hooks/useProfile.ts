import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Profile {
  id: string;
  user_id: string;
  company_name: string | null;
  logo_url: string | null;
  pix_key: string | null;
  bank_details: string | null;
  include_terms_in_pdf: boolean;
  custom_terms: string | null;
  hidden_kanban_columns: string[] | null;
  order_number_start: number;
  pwa_install_suggested: boolean;
  google_review_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileFormData {
  company_name?: string;
  logo_url?: string;
  pix_key?: string;
  bank_details?: string;
  include_terms_in_pdf?: boolean;
  custom_terms?: string;
  hidden_kanban_columns?: string[];
  order_number_start?: number;
  pwa_install_suggested?: boolean;
  google_review_url?: string;
}

export function useProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, return null
          return null;
        }
        throw error;
      }
      return data as Profile;
    },
    enabled: !!user,
  });

  const updateProfile = useMutation({
    mutationFn: async (formData: ProfileFormData) => {
      if (!user) throw new Error('Usuário não autenticado');

      const updateData: Record<string, unknown> = {};
      
      if (formData.company_name !== undefined) updateData.company_name = formData.company_name || null;
      if (formData.logo_url !== undefined) updateData.logo_url = formData.logo_url || null;
      if (formData.pix_key !== undefined) updateData.pix_key = formData.pix_key || null;
      if (formData.bank_details !== undefined) updateData.bank_details = formData.bank_details || null;
      if (formData.include_terms_in_pdf !== undefined) updateData.include_terms_in_pdf = formData.include_terms_in_pdf;
      if (formData.custom_terms !== undefined) updateData.custom_terms = formData.custom_terms || null;
      if (formData.hidden_kanban_columns !== undefined) updateData.hidden_kanban_columns = formData.hidden_kanban_columns;
      if (formData.order_number_start !== undefined) updateData.order_number_start = formData.order_number_start;
      if (formData.pwa_install_suggested !== undefined) updateData.pwa_install_suggested = formData.pwa_install_suggested;
      if (formData.google_review_url !== undefined) updateData.google_review_url = formData.google_review_url || null;

      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: 'Perfil atualizado!',
        description: 'Suas informações foram salvas com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar perfil',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    profile,
    isLoading,
    error,
    updateProfile,
  };
}
