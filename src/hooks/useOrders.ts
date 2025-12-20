import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type OrderStatus = Database['public']['Enums']['order_status'];

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  unit_type: string;
  is_gift: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  client_id: string | null;
  order_number: number | null;
  status: OrderStatus;
  delivery_date: string | null;
  delivery_time: string | null;
  delivery_address: string | null;
  delivery_fee: number;
  total_amount: number;
  deposit_paid: boolean;
  deposit_amount: number | null;
  full_payment_received: boolean;
  payment_method: string | null;
  payment_fee: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  client?: {
    id: string;
    name: string;
    phone: string | null;
    address: string | null;
  } | null;
  order_items?: OrderItem[];
}

export const formatOrderNumber = (n: number | null | undefined): string => {
  if (n === null || n === undefined) return '';
  return `#${n.toString().padStart(4, '0')}`;
};

export interface OrderFormData {
  client_id: string;
  delivery_date?: string;
  delivery_time?: string;
  delivery_address?: string;
  delivery_fee?: number;
  notes?: string;
  items: {
    product_id: string | null;
    product_name: string;
    quantity: number;
    unit_price: number;
    unit_type: string;
    is_gift?: boolean;
  }[];
}

export function useOrders() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          client:clients(id, name, phone, address),
          order_items(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Order[];
    },
    enabled: !!user,
  });

  const createOrder = useMutation({
    mutationFn: async (formData: OrderFormData) => {
      if (!user) throw new Error('Usuário não autenticado');

      // Only count non-gift items in total
      const totalItems = formData.items.reduce((sum, item) => {
        if (item.is_gift) return sum;
        return sum + (item.quantity * item.unit_price);
      }, 0);
      const totalAmount = totalItems + (formData.delivery_fee || 0);

      // Get user's profile for order_number_start
      const { data: profile } = await supabase
        .from('profiles')
        .select('order_number_start')
        .eq('user_id', user.id)
        .single();

      // Get next order number for this user
      const { data: maxOrderNumber } = await supabase
        .from('orders')
        .select('order_number')
        .eq('user_id', user.id)
        .order('order_number', { ascending: false })
        .limit(1)
        .single();
      
      const orderNumberStart = profile?.order_number_start || 1;
      const nextSequential = maxOrderNumber?.order_number 
        ? maxOrderNumber.order_number + 1 
        : 1;
      const nextOrderNumber = Math.max(nextSequential, orderNumberStart);

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          client_id: formData.client_id,
          delivery_date: formData.delivery_date || null,
          delivery_time: formData.delivery_time || null,
          delivery_address: formData.delivery_address || null,
          delivery_fee: formData.delivery_fee || 0,
          total_amount: totalAmount,
          notes: formData.notes || null,
          status: 'quote',
          deposit_paid: false,
          order_number: nextOrderNumber,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      if (formData.items.length > 0) {
        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(
            formData.items.map(item => ({
              order_id: order.id,
              product_id: item.product_id || null,
              product_name: item.product_name,
              quantity: item.quantity,
              unit_price: item.unit_price,
              unit_type: item.unit_type,
              is_gift: item.is_gift || false,
            }))
          );

        if (itemsError) throw itemsError;
      }

      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: 'Pedido criado!',
        description: 'O pedido foi criado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar pedido',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateOrderStatus = useMutation({
    mutationFn: async ({ id, status, clientName, totalAmount, previousStatus, fullPaymentReceived, deliveryPaymentMethod, deliveryPaymentFee, depositAmount }: { 
      id: string; 
      status: OrderStatus;
      clientName?: string;
      totalAmount?: number;
      previousStatus?: OrderStatus;
      fullPaymentReceived?: boolean;
      deliveryPaymentMethod?: string;
      deliveryPaymentFee?: number;
      depositAmount?: number | null;
    }) => {
      if (!user) throw new Error('Usuário não autenticado');

      // Handle cancellation - remove all transactions and reset deposit/full payment
      if (status === 'cancelled') {
        await supabase
          .from('transactions')
          .delete()
          .eq('order_id', id);

        const { data, error } = await supabase
          .from('orders')
          .update({ status, deposit_paid: false, full_payment_received: false, payment_method: null, payment_fee: 0 })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      }

      // Handle reverting from delivered - remove final payment transaction
      if (previousStatus === 'delivered' && status !== 'delivered') {
        await supabase
          .from('transactions')
          .delete()
          .eq('order_id', id)
          .ilike('description', '%Pagamento Final%');
      }

      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Create transaction for delivered status (final payment) - ONLY if not already paid in full
      if (status === 'delivered' && previousStatus !== 'delivered' && totalAmount && !fullPaymentReceived) {
        // Calculate remaining amount based on deposit
        const actualDeposit = depositAmount ?? (totalAmount / 2);
        const remainingAmount = totalAmount - actualDeposit;
        const netAmount = remainingAmount - (deliveryPaymentFee || 0);
        const paymentMethodLabel = deliveryPaymentMethod === 'pix' ? 'Pix' : deliveryPaymentMethod === 'credit_card' ? 'Cartão' : deliveryPaymentMethod === 'link' ? 'Link' : '';
        const methodSuffix = paymentMethodLabel ? ` (${paymentMethodLabel})` : '';
        await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            order_id: id,
            type: 'income',
            description: `Pagamento Final${methodSuffix} - ${clientName || 'Cliente'}`,
            amount: netAmount,
            date: new Date().toISOString().split('T')[0],
          });
      }

      return { data, fullPaymentReceived };
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      
      if (variables.status === 'cancelled') {
        toast({
          title: 'Pedido cancelado',
          description: 'Transações removidas automaticamente.',
        });
      } else if (variables.status === 'delivered') {
        toast({
          title: 'Pedido entregue!',
          description: variables.fullPaymentReceived ? undefined : 'Pagamento final registrado automaticamente.',
        });
      } else if (variables.previousStatus === 'delivered') {
        toast({
          title: 'Status revertido',
          description: 'Pagamento final removido automaticamente.',
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar status',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateDepositPaid = useMutation({
    mutationFn: async ({ id, depositPaid, clientName, totalAmount, currentStatus, depositAmount, paymentMethod, paymentFee }: { 
      id: string; 
      depositPaid: boolean;
      clientName?: string;
      totalAmount?: number;
      currentStatus?: OrderStatus;
      depositAmount?: number;
      paymentMethod?: string;
      paymentFee?: number;
    }) => {
      if (!user) throw new Error('Usuário não autenticado');

      // When deposit is paid, move to "in_production" if currently in quote or awaiting_deposit
      const shouldUpdateStatus = depositPaid && 
        (currentStatus === 'quote' || currentStatus === 'awaiting_deposit');

      // Use provided depositAmount or default to 50%
      const actualDepositAmount = depositPaid && totalAmount 
        ? (depositAmount ?? (totalAmount / 2)) 
        : null;

      const updateData: { deposit_paid: boolean; status?: OrderStatus; deposit_amount?: number | null } = { 
        deposit_paid: depositPaid,
        deposit_amount: depositPaid ? actualDepositAmount : null,
      };
      
      if (shouldUpdateStatus) {
        updateData.status = 'in_production';
      }

      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Create/delete transaction for deposit
      if (depositPaid && totalAmount && actualDepositAmount) {
        const percentage = totalAmount > 0 ? Math.round((actualDepositAmount / totalAmount) * 100) : 50;
        const netAmount = actualDepositAmount - (paymentFee || 0);
        const paymentMethodLabel = paymentMethod === 'pix' ? 'Pix' : paymentMethod === 'credit_card' ? 'Cartão' : paymentMethod === 'link' ? 'Link' : '';
        const methodSuffix = paymentMethodLabel ? ` (${paymentMethodLabel})` : '';
        await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            order_id: id,
            type: 'income',
            description: `Sinal ${percentage}%${methodSuffix} - ${clientName || 'Cliente'}`,
            amount: netAmount,
            date: new Date().toISOString().split('T')[0],
          });
      } else if (!depositPaid) {
        // Remove deposit transaction if unchecked
        await supabase
          .from('transactions')
          .delete()
          .eq('order_id', id)
          .ilike('description', '%Sinal %');
      }

      return { data, statusUpdated: shouldUpdateStatus, depositAmount };
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      
      if (variables.depositPaid && result.statusUpdated) {
        toast({
          title: 'Sinal recebido! 🎉',
          description: 'Pedido movido para "Em Produção" automaticamente.',
        });
      } else if (variables.depositPaid) {
        toast({
          title: 'Sinal marcado como pago!',
          description: 'Receita registrada automaticamente.',
        });
      } else {
        toast({
          title: 'Sinal desmarcado',
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar sinal',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const markFullPayment = useMutation({
    mutationFn: async ({ 
      orderId, 
      paymentMethod, 
      fee,
      orderNumber,
      clientName,
      totalAmount,
      currentStatus
    }: { 
      orderId: string; 
      paymentMethod: 'pix' | 'credit_card' | 'link';
      fee: number;
      orderNumber: number | null;
      clientName?: string;
      totalAmount: number;
      currentStatus?: OrderStatus;
    }) => {
      if (!user) throw new Error('Usuário não autenticado');

      const netAmount = totalAmount - fee;

      // Should update status to in_production if currently in quote or awaiting_deposit
      const shouldUpdateStatus = currentStatus === 'quote' || currentStatus === 'awaiting_deposit';

      const updateData: { 
        full_payment_received: boolean; 
        payment_method: string;
        payment_fee: number;
        status?: OrderStatus;
      } = { 
        full_payment_received: true,
        payment_method: paymentMethod,
        payment_fee: fee,
      };

      if (shouldUpdateStatus) {
        updateData.status = 'in_production';
      }

      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;

      // Create transaction with net amount
      const paymentMethodLabel = paymentMethod === 'pix' ? 'Pix' : paymentMethod === 'credit_card' ? 'Cartão' : 'Link';
      await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          order_id: orderId,
          type: 'income',
          description: `Pagamento Total (${paymentMethodLabel}) - ${clientName || 'Cliente'}${orderNumber ? ` #${orderNumber.toString().padStart(4, '0')}` : ''}`,
          amount: netAmount,
          date: new Date().toISOString().split('T')[0],
        });

      return { data, statusUpdated: shouldUpdateStatus };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      
      if (result.statusUpdated) {
        toast({
          title: 'Pagamento total recebido! 🎉',
          description: 'Pedido movido para "Em Produção" automaticamente.',
        });
      } else {
        toast({
          title: 'Pagamento total registrado!',
          description: 'Receita registrada automaticamente.',
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Erro ao registrar pagamento',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const undoFullPayment = useMutation({
    mutationFn: async ({ orderId }: { orderId: string }) => {
      if (!user) throw new Error('Usuário não autenticado');

      // Remove the full payment transaction
      await supabase
        .from('transactions')
        .delete()
        .eq('order_id', orderId)
        .ilike('description', '%Pagamento Total%');

      // Reset full payment fields on order
      const { data, error } = await supabase
        .from('orders')
        .update({
          full_payment_received: false,
          payment_method: null,
          payment_fee: 0,
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({
        title: 'Pagamento desfeito',
        description: 'Transação removida automaticamente.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao desfazer pagamento',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteOrder = useMutation({
    mutationFn: async (id: string) => {
      // Delete related transactions first
      await supabase
        .from('transactions')
        .delete()
        .eq('order_id', id);

      // Delete order items
      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', id);

      if (itemsError) throw itemsError;

      // Delete order
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({
        title: 'Pedido excluído!',
        description: 'O pedido foi removido com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao excluir pedido',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateOrder = useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: OrderFormData }) => {
      if (!user) throw new Error('Usuário não autenticado');

      // Only count non-gift items in total
      const totalItems = formData.items.reduce((sum, item) => {
        if (item.is_gift) return sum;
        return sum + (item.quantity * item.unit_price);
      }, 0);
      const totalAmount = totalItems + (formData.delivery_fee || 0);
      // Update order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .update({
          client_id: formData.client_id,
          delivery_date: formData.delivery_date || null,
          delivery_time: formData.delivery_time || null,
          delivery_address: formData.delivery_address || null,
          delivery_fee: formData.delivery_fee || 0,
          total_amount: totalAmount,
          notes: formData.notes || null,
        })
        .eq('id', id)
        .select()
        .single();

      if (orderError) throw orderError;

      // Delete existing order items
      await supabase
        .from('order_items')
        .delete()
        .eq('order_id', id);

      // Create new order items
      if (formData.items.length > 0) {
        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(
            formData.items.map(item => ({
              order_id: id,
              product_id: item.product_id || null,
              product_name: item.product_name,
              quantity: item.quantity,
              unit_price: item.unit_price,
              unit_type: item.unit_type,
              is_gift: item.is_gift || false,
            }))
          );

        if (itemsError) throw itemsError;
      }

      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: 'Pedido atualizado!',
        description: 'O pedido foi atualizado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar pedido',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    orders,
    isLoading,
    error,
    createOrder,
    updateOrder,
    updateOrderStatus,
    updateDepositPaid,
    markFullPayment,
    undoFullPayment,
    deleteOrder,
  };
}
