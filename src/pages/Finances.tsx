import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TransactionFormDialog } from '@/components/finances/TransactionFormDialog';
import { DeleteTransactionDialog } from '@/components/finances/DeleteTransactionDialog';
import { useTransactions, Transaction, TransactionFormData } from '@/hooks/useTransactions';
import { TrendingUp, TrendingDown, Wallet, Plus, ArrowUpRight, ArrowDownRight, Trash2, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const Finances = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const { 
    transactions, 
    isLoading, 
    createTransaction, 
    deleteTransaction,
    totalIncome,
    totalExpenses,
    balance,
  } = useTransactions();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd 'de' MMM", { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  const handleCreate = () => {
    setFormOpen(true);
  };

  const handleDelete = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDeleteOpen(true);
  };

  const handleSubmit = async (data: TransactionFormData) => {
    await createTransaction.mutateAsync(data);
  };

  const handleConfirmDelete = async () => {
    if (selectedTransaction) {
      await deleteTransaction.mutateAsync(selectedTransaction.id);
      setDeleteOpen(false);
      setSelectedTransaction(null);
    }
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
              Financeiro
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Acompanhe suas receitas e despesas
            </p>
          </div>
          <Button variant="warm" onClick={handleCreate}>
            <Plus className="h-5 w-5" />
            Nova Transação
          </Button>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            title="Saldo do Mês"
            value={formatCurrency(balance)}
            icon={Wallet}
            variant={balance >= 0 ? 'primary' : 'warning'}
          />
          <StatsCard
            title="Receitas"
            value={formatCurrency(totalIncome)}
            icon={TrendingUp}
            variant="success"
          />
          <StatsCard
            title="Despesas"
            value={formatCurrency(totalExpenses)}
            icon={TrendingDown}
            variant="warning"
          />
        </section>

        {/* Transactions List */}
        <Card>
          <CardHeader>
            <CardTitle>Últimas Transações</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>Nenhuma transação registrada</p>
                <Button variant="link" className="mt-2" onClick={handleCreate}>
                  Registrar primeira transação
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {transactions.map((transaction, index) => (
                  <div
                    key={transaction.id}
                    className={cn(
                      "flex items-center justify-between p-4 hover:bg-muted/50 transition-colors group",
                      "animate-slide-up",
                      `stagger-${Math.min(index + 1, 5)}`
                    )}
                    style={{ opacity: 0, animationFillMode: 'forwards' }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        transaction.type === 'income' 
                          ? 'bg-success/10 text-success' 
                          : 'bg-destructive/10 text-destructive'
                      )}>
                        {transaction.type === 'income' ? (
                          <ArrowUpRight className="h-5 w-5" />
                        ) : (
                          <ArrowDownRight className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{transaction.description || 'Sem descrição'}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {transaction.order_id && (
                            <Badge variant="muted" className="text-[10px]">
                              Pedido
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatDate(transaction.date)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "font-semibold",
                        transaction.type === 'income' ? 'text-success' : 'text-destructive'
                      )}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(transaction)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mobile FAB */}
        <Button
          variant="warm"
          size="icon-lg"
          className="fixed bottom-20 right-4 md:hidden shadow-warm rounded-full z-40"
          onClick={handleCreate}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Form Dialog */}
      <TransactionFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
        isLoading={createTransaction.isPending}
      />

      {/* Delete Dialog */}
      <DeleteTransactionDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        description={selectedTransaction?.description || ''}
        onConfirm={handleConfirmDelete}
        isLoading={deleteTransaction.isPending}
      />
    </AppLayout>
  );
};

export default Finances;
