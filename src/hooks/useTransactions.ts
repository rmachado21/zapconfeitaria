import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';
import { useMemo } from 'react';
import { startOfWeek, startOfMonth, startOfYear, isAfter, parseISO } from 'date-fns';

type TransactionType = Database['public']['Enums']['transaction_type'];

export type PeriodFilter = 'week' | 'month' | 'year' | 'all';

export interface Transaction {
  id: string;
  user_id: string;
  order_id: string | null;
  type: TransactionType;
  description: string | null;
  amount: number;
  date: string;
  created_at: string;
}

export interface TransactionFormData {
  type: TransactionType;
  description: string;
  amount: number;
  date?: string;
  order_id?: string;
}

export function useTransactions(period: PeriodFilter = 'all') {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading, error } = useQuery({
    queryKey: ['transactions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!user,
  });

  // Filter transactions by period
  const filteredTransactions = useMemo(() => {
    if (period === 'all') return transactions;
    
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'week':
        startDate = startOfWeek(now, { weekStartsOn: 0 });
        break;
      case 'month':
        startDate = startOfMonth(now);
        break;
      case 'year':
        startDate = startOfYear(now);
        break;
      default:
        return transactions;
    }
    
    return transactions.filter(t => {
      const transactionDate = parseISO(t.date);
      return isAfter(transactionDate, startDate) || transactionDate.getTime() === startDate.getTime();
    });
  }, [transactions, period]);

  const createTransaction = useMutation({
    mutationFn: async (formData: TransactionFormData) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: formData.type,
          description: formData.description,
          amount: formData.amount,
          date: formData.date || new Date().toISOString().split('T')[0],
          order_id: formData.order_id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      const isIncome = variables.type === 'income';
      toast({
        title: isIncome ? 'Receita registrada!' : 'Despesa registrada!',
        description: `${variables.description} - R$ ${variables.amount.toFixed(2)}`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao registrar transação',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteTransaction = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({
        title: 'Transação excluída!',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao excluir transação',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Calculate totals based on filtered transactions
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  return {
    transactions,
    filteredTransactions,
    isLoading,
    error,
    createTransaction,
    deleteTransaction,
    totalIncome,
    totalExpenses,
    balance,
  };
}
