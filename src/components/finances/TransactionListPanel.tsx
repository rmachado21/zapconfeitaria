import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ExternalLink } from 'lucide-react';
import { ResponsivePanel } from '@/components/ui/responsive-panel';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Transaction } from '@/hooks/useTransactions';
import { cn } from '@/lib/utils';

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

interface TransactionListPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'income' | 'expense';
  transactions: Transaction[];
  total: number;
  orderNumberMap: Record<string, number | null>;
  onOrderClick?: (orderId: string) => void;
}

export function TransactionListPanel({
  open,
  onOpenChange,
  type,
  transactions,
  total,
  orderNumberMap,
  onOrderClick,
}: TransactionListPanelProps) {
  const title = type === 'income' ? 'Receitas' : 'Despesas';
  const count = transactions.length;

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

  const parseTransaction = (description: string | null) => {
    if (!description) return { category: null, cleanDescription: 'Sem descrição' };
    const dashIndex = description.indexOf(' - ');
    if (dashIndex > 0) {
      const category = description.substring(0, dashIndex);
      const cleanDescription = description.substring(dashIndex + 3);
      if (Object.keys(CATEGORY_COLORS).includes(category)) {
        return { category, cleanDescription };
      }
    }
    return { category: null, cleanDescription: description };
  };

  const formatOrderNumber = (num: number | null | undefined) => {
    if (!num) return null;
    return `#${String(num).padStart(4, '0')}`;
  };

  return (
    <ResponsivePanel
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={`${count} ${count === 1 ? 'transação' : 'transações'} no período`}
    >
      {/* Summary Card */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className={cn(
                "text-2xl font-bold",
                type === 'income' ? 'text-success' : 'text-warning'
              )}>
                {formatCurrency(total)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Transações</p>
              <p className="text-2xl font-bold">{count}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <div className="space-y-2">
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma {type === 'income' ? 'receita' : 'despesa'} encontrada no período.
          </div>
        ) : (
          transactions.map((transaction) => {
            const { category, cleanDescription } = parseTransaction(transaction.description);
            const categoryColors = category ? CATEGORY_COLORS[category] : null;
            const orderNumber = transaction.order_id ? orderNumberMap[transaction.order_id] : null;

            return (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(transaction.date)}
                    </span>
                    {category && categoryColors && (
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-[10px] px-1.5 py-0 border-0",
                          categoryColors.bg,
                          categoryColors.text
                        )}
                      >
                        {category}
                      </Badge>
                    )}
                    {orderNumber && onOrderClick && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 px-1.5 text-[10px] text-primary hover:text-primary/80"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOrderClick(transaction.order_id!);
                          onOpenChange(false);
                        }}
                      >
                        {formatOrderNumber(orderNumber)}
                        <ExternalLink className="h-3 w-3 ml-0.5" />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm font-medium mt-0.5 truncate">
                    {cleanDescription}
                  </p>
                </div>
                <div className={cn(
                  "text-sm font-semibold tabular-nums ml-3",
                  type === 'income' ? 'text-success' : 'text-warning'
                )}>
                  {formatCurrency(transaction.amount)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </ResponsivePanel>
  );
}
