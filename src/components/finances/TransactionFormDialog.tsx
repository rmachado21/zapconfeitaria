import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { CurrencyInput } from '@/components/shared/CurrencyInput';
import { TransactionFormData } from '@/hooks/useTransactions';

const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  description: z.string().min(2, 'Descrição deve ter pelo menos 2 caracteres').max(200),
  amount: z.coerce.number().positive('Valor deve ser positivo'),
  date: z.string().optional(),
  category: z.string().optional(),
});

const EXPENSE_CATEGORIES = [
  'Insumos',
  'Embalagens',
  'Combustível',
  'Equipamentos',
  'Marketing',
  'Aluguel',
  'Outros',
];

const INCOME_CATEGORIES = [
  'Sinal',
  'Pagamento Final',
  'Venda Avulsa',
  'Outros',
];

interface TransactionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TransactionFormData) => Promise<void>;
  isLoading: boolean;
  defaultType?: 'income' | 'expense';
}

export function TransactionFormDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  defaultType = 'expense',
}: TransactionFormDialogProps) {
  const form = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: defaultType,
      description: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      category: '',
    },
  });

  const transactionType = form.watch('type');
  const categories = transactionType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = async (data: z.infer<typeof transactionSchema>) => {
    const description = data.category 
      ? `${data.category} - ${data.description}`
      : data.description;

    await onSubmit({
      type: data.type,
      description,
      amount: data.amount,
      date: data.date,
    });
    onOpenChange(false);
    form.reset({
      type: defaultType,
      description: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      category: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            {transactionType === 'income' ? (
              <TrendingUp className="h-5 w-5 text-success" />
            ) : (
              <TrendingDown className="h-5 w-5 text-destructive" />
            )}
            Nova Transação
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="income">
                        <span className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-success" />
                          Receita
                        </span>
                      </SelectItem>
                      <SelectItem value="expense">
                        <span className="flex items-center gap-2">
                          <TrendingDown className="h-4 w-4 text-destructive" />
                          Despesa
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Compra de chocolate belga" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor *</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="R$ 0,00"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="overflow-hidden">
                  <FormLabel>Data</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} className="max-w-full" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                variant={transactionType === 'income' ? 'default' : 'destructive'}
                className="w-full sm:w-auto"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Registrar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
