import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Client {
  id: string;
  name: string;
  phone: string | null;
  cpf_cnpj: string | null;
  email: string | null;
  birthday: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  order_count?: number;
}

export interface ClientFormData {
  name: string;
  phone?: string;
  cpf_cnpj?: string;
  email?: string;
  birthday?: string;
  address?: string;
}

export function useClients() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: clients = [], isLoading, error } = useQuery({
    queryKey: ['clients', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Fetch clients
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .order('name', { ascending: true });
      
      if (clientsError) throw clientsError;

      // Fetch order counts per client
      const { data: orderCounts, error: ordersError } = await supabase
        .from('orders')
        .select('client_id');
      
      if (ordersError) throw ordersError;

      // Count orders per client
      const countMap = new Map<string, number>();
      orderCounts?.forEach(order => {
        if (order.client_id) {
          countMap.set(order.client_id, (countMap.get(order.client_id) || 0) + 1);
        }
      });

      // Add order_count to each client
      return clientsData.map(client => ({
        ...client,
        order_count: countMap.get(client.id) || 0,
      })) as Client[];
    },
    enabled: !!user,
  });

  const createClient = useMutation({
    mutationFn: async (formData: ClientFormData) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('clients')
        .insert({
          name: formData.name,
          phone: formData.phone || null,
          cpf_cnpj: formData.cpf_cnpj || null,
          email: formData.email || null,
          birthday: formData.birthday || null,
          address: formData.address || null,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({
        title: 'Cliente cadastrado!',
        description: 'O cliente foi adicionado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao cadastrar cliente',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateClient = useMutation({
    mutationFn: async ({ id, ...formData }: ClientFormData & { id: string }) => {
      const { data, error } = await supabase
        .from('clients')
        .update({
          name: formData.name,
          phone: formData.phone || null,
          cpf_cnpj: formData.cpf_cnpj || null,
          email: formData.email || null,
          birthday: formData.birthday || null,
          address: formData.address || null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({
        title: 'Cliente atualizado!',
        description: 'Os dados foram salvos com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar cliente',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteClient = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({
        title: 'Cliente excluído!',
        description: 'O cliente foi removido com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao excluir cliente',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    clients,
    isLoading,
    error,
    createClient,
    updateClient,
    deleteClient,
  };
}
