import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Product {
  id: string;
  name: string;
  description: string | null;
  cost_price: number;
  sale_price: number;
  unit_type: string;
  photo_url: string | null;
  category_id: string | null;
  category?: {
    id: string;
    name: string;
    emoji: string;
    color: string;
    display_order: number;
  } | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface ProductFormData {
  name: string;
  description?: string;
  cost_price: number;
  sale_price: number;
  unit_type: 'kg' | 'unit' | 'cento';
  photo_url?: string;
  category_id?: string | null;
}

export function useProducts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['products', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:product_categories(id, name, emoji, color, display_order)
        `)
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data as Product[];
    },
    enabled: !!user,
  });

  const createProduct = useMutation({
    mutationFn: async (formData: ProductFormData) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('products')
        .insert({
          name: formData.name,
          description: formData.description || null,
          cost_price: formData.cost_price,
          sale_price: formData.sale_price,
          unit_type: formData.unit_type,
          photo_url: formData.photo_url || null,
          category_id: formData.category_id || null,
          user_id: user.id,
        })
        .select(`
          *,
          category:product_categories(id, name, emoji, color)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Produto cadastrado!',
        description: 'O produto foi adicionado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao cadastrar produto',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateProduct = useMutation({
    mutationFn: async ({ id, ...formData }: ProductFormData & { id: string }) => {
      const { data, error } = await supabase
        .from('products')
        .update({
          name: formData.name,
          description: formData.description || null,
          cost_price: formData.cost_price,
          sale_price: formData.sale_price,
          unit_type: formData.unit_type,
          photo_url: formData.photo_url || null,
          category_id: formData.category_id || null,
        })
        .eq('id', id)
        .select(`
          *,
          category:product_categories(id, name, emoji, color)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Produto atualizado!',
        description: 'Os dados foram salvos com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar produto',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Produto excluído!',
        description: 'O produto foi removido com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao excluir produto',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    products,
    isLoading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}
