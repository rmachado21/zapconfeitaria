import { useState, useMemo, useCallback } from 'react';
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
import { 
  TrendingUp, TrendingDown, Wallet, Plus, ArrowUpRight, ArrowDownRight, 
  Trash2, Loader2, Calendar, ExternalLink, PiggyBank, Pencil, Download,
  ChevronLeft, ChevronRight, Filter, X
} from 'lucide-react';
import { format, parseISO, startOfWeek, startOfMonth, startOfYear, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const periodLabels: Record<PeriodFilter, string> = {
  week: 'Esta Semana',
  month: 'Este Mês',
  year: 'Este Ano',
  all: 'Todo Período',
};

const ALL_CATEGORIES = [
  'Insumos',
  'Embalagens',
  'Combustível',
  'Equipamentos',
  'Marketing',
  'Aluguel',
  'Sinal',
  'Pagamento Final',
  'Venda Avulsa',
  'Outros',
];

// Category colors for badges
const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  'Insumos': { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300' },
  'Embalagens': { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300' },
  'Combustível': { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300' },
  'Equipamentos': { bg: 'bg-slate-100 dark:bg-slate-800/50', text: 'text-slate-700 dark:text-slate-300' },
  'Marketing': { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300' },
  'Aluguel': { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300' },
  'Sinal': { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300' },
  'Pagamento Final': { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300' },
  'Venda Avulsa': { bg: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-700 dark:text-teal-300' },
  'Outros': { bg: 'bg-gray-100 dark:bg-gray-800/50', text: 'text-gray-600 dark:text-gray-400' },
};

type TypeFilter = 'all' | 'income' | 'expense';

const ITEMS_PER_PAGE = 20;

const Finances = () => {
  const navigate = useNavigate();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [period, setPeriod] = useState<PeriodFilter>('month');
  const [currentPage, setCurrentPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const { 
    transactions,
    filteredTransactions,
    isLoading, 
    createTransaction,
    updateTransaction,
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

  // Extract category and clean description
  const parseTransaction = (description: string | null) => {
    if (!description) return { category: null, cleanDescription: 'Sem descrição' };
    const dashIndex = description.indexOf(' - ');
    if (dashIndex > 0) {
      const category = description.substring(0, dashIndex);
      const cleanDescription = description.substring(dashIndex + 3);
      if (ALL_CATEGORIES.includes(category)) {
        return { category, cleanDescription };
      }
    }
    return { category: null, cleanDescription: description };
  };

  // Filter transactions by type and category
  const listFilteredTransactions = useMemo(() => {
    return filteredTransactions.filter(t => {
      // Filter by type
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      
      // Filter by category
      if (categoryFilter !== 'all') {
        const { category } = parseTransaction(t.description);
        if (category !== categoryFilter) return false;
      }
      
      return true;
    });
  }, [filteredTransactions, typeFilter, categoryFilter]);

  // Pagination - now uses listFilteredTransactions
  const totalPages = Math.ceil(listFilteredTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return listFilteredTransactions.slice(start, start + ITEMS_PER_PAGE);
  }, [listFilteredTransactions, currentPage]);

  // Reset page when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [period, typeFilter, categoryFilter]);

  // Get available categories from current transactions
  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    filteredTransactions.forEach(t => {
      const { category } = parseTransaction(t.description);
      if (category) categories.add(category);
    });
    return Array.from(categories).sort();
  }, [filteredTransactions]);

  const hasActiveFilters = typeFilter !== 'all' || categoryFilter !== 'all';

  const clearFilters = () => {
    setTypeFilter('all');
    setCategoryFilter('all');
  };

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
    setEditingTransaction(null);
    setFormOpen(true);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormOpen(true);
  };

  const handleDelete = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDeleteOpen(true);
  };

  const handleSubmit = async (data: TransactionFormData) => {
    if (editingTransaction) {
      await updateTransaction.mutateAsync({ id: editingTransaction.id, formData: data });
    } else {
      await createTransaction.mutateAsync(data);
    }
    setEditingTransaction(null);
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

  const handleExportCSV = useCallback(() => {
    const headers = ['Data', 'Tipo', 'Descrição', 'Valor', 'Pedido Vinculado'];
    const rows = filteredTransactions.map(t => [
      t.date,
      t.type === 'income' ? 'Receita' : 'Despesa',
      t.description || '',
      t.amount.toFixed(2).replace('.', ','),
      t.order_id ? (orderNumberMap[t.order_id] ? formatOrderNumber(orderNumberMap[t.order_id]) : 'Sim') : '',
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(';'))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transacoes_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [filteredTransactions, orderNumberMap]);

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
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Transações</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              disabled={listFilteredTransactions.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </CardHeader>
          
          {/* Filters */}
          <div className="px-4 pb-3 flex flex-wrap items-center gap-2 border-b border-border">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as TypeFilter)}>
              <SelectTrigger className="w-[130px] h-8 text-sm">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="income">
                  <span className="flex items-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5 text-success" />
                    Receitas
                  </span>
                </SelectItem>
                <SelectItem value="expense">
                  <span className="flex items-center gap-2">
                    <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                    Despesas
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[150px] h-8 text-sm">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas categorias</SelectItem>
                {availableCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-8 px-2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                Limpar
              </Button>
            )}

            <span className="text-xs text-muted-foreground ml-auto">
              {listFilteredTransactions.length} resultado{listFilteredTransactions.length !== 1 ? 's' : ''}
            </span>
          </div>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : listFilteredTransactions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>{hasActiveFilters ? 'Nenhuma transação encontrada com esses filtros' : 'Nenhuma transação no período'}</p>
                {hasActiveFilters ? (
                  <Button variant="link" className="mt-2" onClick={clearFilters}>
                    Limpar filtros
                  </Button>
                ) : (
                  <Button variant="link" className="mt-2" onClick={handleCreate}>
                    Registrar primeira transação
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="divide-y divide-border">
                  {paginatedTransactions.map((transaction, index) => (
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
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-sm truncate">
                              {parseTransaction(transaction.description).cleanDescription}
                            </p>
                            {(() => {
                              const { category } = parseTransaction(transaction.description);
                              if (!category) return null;
                              const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS['Outros'];
                              return (
                                <span className={cn(
                                  "text-[10px] px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap",
                                  colors.bg,
                                  colors.text
                                )}>
                                  {category}
                                </span>
                              );
                            })()}
                          </div>
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
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground hover:bg-muted"
                          onClick={() => handleEdit(transaction)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Página {currentPage} de {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        {currentPage} de {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
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
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingTransaction(null);
        }}
        onSubmit={handleSubmit}
        isLoading={createTransaction.isPending || updateTransaction.isPending}
        transaction={editingTransaction}
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
