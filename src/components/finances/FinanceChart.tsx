import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import { Transaction } from '@/hooks/useTransactions';
import { format, parseISO, subDays, subMonths, startOfDay, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart3, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FinanceChartProps {
  transactions: Transaction[];
}

type Period = '7d' | '30d' | '90d' | '12m';
type ChartType = 'area' | 'bar';

export function FinanceChart({ transactions }: FinanceChartProps) {
  const [period, setPeriod] = useState<Period>('30d');
  const [chartType, setChartType] = useState<ChartType>('area');

  const chartData = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let groupBy: 'day' | 'week' | 'month';

    switch (period) {
      case '7d':
        startDate = subDays(now, 7);
        groupBy = 'day';
        break;
      case '30d':
        startDate = subDays(now, 30);
        groupBy = 'day';
        break;
      case '90d':
        startDate = subDays(now, 90);
        groupBy = 'week';
        break;
      case '12m':
        startDate = subMonths(now, 12);
        groupBy = 'month';
        break;
    }

    // Filter transactions by period
    const filteredTransactions = transactions.filter(t => {
      const transactionDate = parseISO(t.date);
      return isAfter(transactionDate, startOfDay(startDate));
    });

    // Group transactions by date
    const grouped: Record<string, { income: number; expense: number }> = {};

    filteredTransactions.forEach(t => {
      const date = parseISO(t.date);
      let key: string;

      if (groupBy === 'day') {
        key = format(date, 'dd/MM');
      } else if (groupBy === 'week') {
        key = format(date, "'Sem' w");
      } else {
        key = format(date, 'MMM/yy', { locale: ptBR });
      }

      if (!grouped[key]) {
        grouped[key] = { income: 0, expense: 0 };
      }

      if (t.type === 'income') {
        grouped[key].income += t.amount;
      } else {
        grouped[key].expense += t.amount;
      }
    });

    // Convert to array and calculate balance
    return Object.entries(grouped).map(([name, values]) => ({
      name,
      receitas: values.income,
      despesas: values.expense,
      saldo: values.income - values.expense,
    }));
  }, [transactions, period]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg shadow-lg p-3">
          <p className="font-medium text-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p
              key={index}
              className="text-sm"
              style={{ color: entry.color }}
            >
              {entry.name === 'receitas' ? 'Receitas' : entry.name === 'despesas' ? 'Despesas' : 'Saldo'}:{' '}
              {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-lg">Evolução Financeira</CardTitle>
          <div className="flex items-center gap-2">
            {/* Chart type toggle */}
            <div className="flex rounded-lg border border-border p-1">
              <button
                onClick={() => setChartType('area')}
                className={cn(
                  "p-1.5 rounded transition-colors",
                  chartType === 'area' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <TrendingUp className="h-4 w-4" />
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={cn(
                  "p-1.5 rounded transition-colors",
                  chartType === 'bar' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <BarChart3 className="h-4 w-4" />
              </button>
            </div>

            {/* Period selector */}
            <div className="flex rounded-lg border border-border p-1">
              {(['7d', '30d', '90d', '12m'] as Period[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "px-2 py-1 text-xs rounded transition-colors",
                    period === p
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {p === '7d' ? '7 dias' : p === '30d' ? '30 dias' : p === '90d' ? '90 dias' : '12 meses'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Sem dados para o período selecionado
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'area' ? (
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="name"
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    formatter={(value) =>
                      value === 'receitas' ? 'Receitas' : value === 'despesas' ? 'Despesas' : 'Saldo'
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="receitas"
                    stroke="hsl(var(--success))"
                    fill="url(#incomeGradient)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="despesas"
                    stroke="hsl(var(--destructive))"
                    fill="url(#expenseGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="name"
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    formatter={(value) =>
                      value === 'receitas' ? 'Receitas' : value === 'despesas' ? 'Despesas' : 'Saldo'
                    }
                  />
                  <Bar dataKey="receitas" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="despesas" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}