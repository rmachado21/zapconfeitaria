import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ProductCategory {
  id: string;
  name: string;
  emoji: string;
  color: string;
  display_order: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CategoryFormData {
  name: string;
  emoji: string;
  color: string;
}

export const CATEGORY_COLORS = [
  { value: 'pink', label: 'Rosa', bg: 'bg-pink-100', text: 'text-pink-700', darkBg: 'dark:bg-pink-950', darkText: 'dark:text-pink-300' },
  { value: 'amber', label: 'Âmbar', bg: 'bg-amber-100', text: 'text-amber-700', darkBg: 'dark:bg-amber-950', darkText: 'dark:text-amber-300' },
  { value: 'orange', label: 'Laranja', bg: 'bg-orange-100', text: 'text-orange-700', darkBg: 'dark:bg-orange-950', darkText: 'dark:text-orange-300' },
  { value: 'emerald', label: 'Verde', bg: 'bg-emerald-100', text: 'text-emerald-700', darkBg: 'dark:bg-emerald-950', darkText: 'dark:text-emerald-300' },
  { value: 'blue', label: 'Azul', bg: 'bg-blue-100', text: 'text-blue-700', darkBg: 'dark:bg-blue-950', darkText: 'dark:text-blue-300' },
  { value: 'purple', label: 'Roxo', bg: 'bg-purple-100', text: 'text-purple-700', darkBg: 'dark:bg-purple-950', darkText: 'dark:text-purple-300' },
  { value: 'gray', label: 'Cinza', bg: 'bg-gray-100', text: 'text-gray-700', darkBg: 'dark:bg-gray-800', darkText: 'dark:text-gray-300' },
];

export const CATEGORY_EMOJIS = ['🎂', '🍰', '🧁', '🍪', '🍬', '🍫', '🥧', '🥮', '🍩', '🍮', '🥟', '🥐', '🍞', '☕', '🥤', '📦', '🎁', '⭐', '🍕', '🥗'];

export const SUGGESTED_CATEGORIES: CategoryFormData[] = [
  { name: 'Bolos', emoji: '🎂', color: 'pink' },
  { name: 'Doces', emoji: '🍬', color: 'amber' },
  { name: 'Salgados', emoji: '🥟', color: 'orange' },
  { name: 'Bebidas', emoji: '🥤', color: 'blue' },
  { name: 'Kits/Combos', emoji: '📦', color: 'purple' },
];

export function getCategoryColorClasses(color: string) {
  const colorConfig = CATEGORY_COLORS.find(c => c.value === color) || CATEGORY_COLORS[6];
  return `${colorConfig.bg} ${colorConfig.text} ${colorConfig.darkBg} ${colorConfig.darkText}`;
}

export function useProductCategories() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ['product-categories', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .order('display_order', { ascending: true })
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data as ProductCategory[];
    },
    enabled: !!user,
  });

  const createCategory = useMutation({
    mutationFn: async (formData: CategoryFormData) => {
      if (!user) throw new Error('Usuário não autenticado');

      const maxOrder = categories.length > 0 
        ? Math.max(...categories.map(c => c.display_order)) + 1 
        : 0;

      const { data, error } = await supabase
        .from('product_categories')
        .insert({
          name: formData.name,
          emoji: formData.emoji,
          color: formData.color,
          display_order: maxOrder,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
      toast({
        title: 'Categoria criada!',
        description: 'A categoria foi adicionada com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar categoria',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, ...formData }: CategoryFormData & { id: string }) => {
      const { data, error } = await supabase
        .from('product_categories')
        .update({
          name: formData.name,
          emoji: formData.emoji,
          color: formData.color,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Categoria atualizada!',
        description: 'Os dados foram salvos com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar categoria',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('product_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Categoria excluída!',
        description: 'A categoria foi removida com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao excluir categoria',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    categories,
    isLoading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
