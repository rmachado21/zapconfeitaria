import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TransactionFormDialog } from '@/components/finances/TransactionFormDialog';
import { DeleteTransactionDialog } from '@/components/finances/DeleteTransactionDialog';
import { FinanceChart } from '@/components/finances/FinanceChart';
import { ExpenseCategoryChart } from '@/components/finances/ExpenseCategoryChart';
import { useTransactions, Transaction, TransactionFormData, PeriodFilter } from '@/hooks/useTransactions';
import { useOrders, formatOrderNumber } from '@/hooks/useOrders';
import { useProducts } from '@/hooks/useProducts';
import { TrendingUp, TrendingDown, Wallet, Plus, ArrowUpRight, ArrowDownRight, Trash2, Loader2, Calendar, ExternalLink, PiggyBank } from 'lucide-react';
import { format, parseISO, startOfWeek, startOfMonth, startOfYear, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const periodLabels: Record<PeriodFilter, string> = {
  week: 'Esta Semana',
  month: 'Este Mês',
  year: 'Este Ano',
  all: 'Todo Período',
};

const Finances = () => {
  const navigate = useNavigate();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [period, setPeriod] = useState<PeriodFilter>('month');

  const { 
    transactions,
    filteredTransactions,
    isLoading, 
    createTransaction, 
    deleteTransaction,
    totalIncome,
    totalExpenses,
    balance,
  } = useTransactions(period);

  const { orders } = useOrders();
  const { products } = useProducts();

  // Calculate estimated profit based on delivered orders in the period
  const estimatedProfit = useMemo(() => {
    // Filter orders by period and delivered status
    const now = new Date();
    let startDate: Date | null = null;
    
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
    }

    const deliveredOrders = orders.filter(order => {
      if (order.status !== 'delivered') return false;
      if (!startDate) return true;
      
      const orderDate = parseISO(order.updated_at);
      return isAfter(orderDate, startDate) || orderDate.getTime() === startDate.getTime();
    });

    // Calculate revenue (total_amount from delivered orders)
    const revenue = deliveredOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);

    // Calculate product costs
    const costs = deliveredOrders.reduce((orderSum, order) => {
      const itemsCost = (order.order_items || []).reduce((itemSum, item) => {
        if (item.is_gift) return itemSum;
        
        // Find product to get cost_price
        const product = products.find(p => p.id === item.product_id);
        const costPrice = product?.cost_price || 0;
        
        return itemSum + (costPrice * item.quantity);
      }, 0);
      
      return orderSum + itemsCost;
    }, 0);

    const profit = revenue - costs;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

    return { profit, margin, revenue, costs };
  }, [orders, products, period]);

  // Map transactions to order numbers for display
  const orderNumberMap = useMemo(() => {
    const map: Record<string, number | null> = {};
    orders.forEach(order => {
      map[order.id] = order.order_number;
    });
    return map;
  }, [orders]);

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

  const handleOrderClick = (orderId: string) => {
    navigate('/orders', { state: { openOrderId: orderId } });
  };

  return (
    <AppLayout>
      <div className="px-5 py-4 md:px-8 md:py-6 space-y-6">
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
          <div className="flex items-center gap-3">
            <Select value={period} onValueChange={(value) => setPeriod(value as PeriodFilter)}>
              <SelectTrigger className="w-[160px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(periodLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="warm" onClick={handleCreate} className="hidden md:flex">
              <Plus className="h-5 w-5" />
              Nova Transação
            </Button>
          </div>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title={`Saldo (${periodLabels[period]})`}
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
          <StatsCard
            title="Lucro Estimado"
            value={formatCurrency(estimatedProfit.profit)}
            subtitle={`Margem: ${estimatedProfit.margin.toFixed(1)}%`}
            icon={PiggyBank}
            variant={estimatedProfit.profit >= 0 ? 'success' : 'warning'}
          />
        </section>

        {/* Charts Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FinanceChart transactions={filteredTransactions} />
          <ExpenseCategoryChart transactions={filteredTransactions} />
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
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>Nenhuma transação no período</p>
                <Button variant="link" className="mt-2" onClick={handleCreate}>
                  Registrar primeira transação
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredTransactions.map((transaction, index) => (
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
                            <Badge 
                              variant="muted" 
                              className="text-[10px] cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
                              onClick={() => handleOrderClick(transaction.order_id!)}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              {orderNumberMap[transaction.order_id] 
                                ? formatOrderNumber(orderNumberMap[transaction.order_id])
                                : 'Pedido'}
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
