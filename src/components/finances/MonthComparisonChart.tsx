import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts';
import { Transaction, MonthFilter } from '@/hooks/useTransactions';
import { format, parseISO, startOfMonth, endOfMonth, subMonths, isAfter, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MonthComparisonChartProps {
  allTransactions: Transaction[];
  selectedMonth?: MonthFilter;
}

export function MonthComparisonChart({ allTransactions, selectedMonth }: MonthComparisonChartProps) {
  const comparisonData = useMemo(() => {
    // Determine current and previous month
    const currentDate = selectedMonth 
      ? new Date(selectedMonth.year, selectedMonth.month, 1)
      : new Date();
    
    const currentMonthStart = startOfMonth(currentDate);
    const currentMonthEnd = endOfMonth(currentDate);
    
    const previousDate = subMonths(currentDate, 1);
    const previousMonthStart = startOfMonth(previousDate);
    const previousMonthEnd = endOfMonth(previousDate);

    // Filter transactions for each month
    const filterByMonth = (start: Date, end: Date) => {
      return allTransactions.filter(t => {
        const date = parseISO(t.date);
        return (isAfter(date, start) || date.getTime() === start.getTime()) &&
               (isBefore(date, end) || date.getTime() === end.getTime());
      });
    };

    const currentMonthTransactions = filterByMonth(currentMonthStart, currentMonthEnd);
    const previousMonthTransactions = filterByMonth(previousMonthStart, previousMonthEnd);

    // Calculate totals
    const calculate = (transactions: Transaction[]) => {
      const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      const expense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      return { income, expense, balance: income - expense };
    };

    const current = calculate(currentMonthTransactions);
    const previous = calculate(previousMonthTransactions);

    // Calculate variation percentages
    const incomeVariation = previous.income > 0 
      ? ((current.income - previous.income) / previous.income) * 100 
      : current.income > 0 ? 100 : 0;
    
    const expenseVariation = previous.expense > 0 
      ? ((current.expense - previous.expense) / previous.expense) * 100 
      : current.expense > 0 ? 100 : 0;

    const balanceVariation = previous.balance !== 0 
      ? ((current.balance - previous.balance) / Math.abs(previous.balance)) * 100 
      : current.balance !== 0 ? 100 : 0;

    // Format month labels
    const currentLabel = format(currentDate, 'MMM', { locale: ptBR });
    const previousLabel = format(previousDate, 'MMM', { locale: ptBR });
    
    const currentLabelFull = format(currentDate, "MMMM 'de' yyyy", { locale: ptBR });
    const previousLabelFull = format(previousDate, "MMMM 'de' yyyy", { locale: ptBR });

    return {
      chartData: [
        {
          category: 'Receitas',
          [previousLabel]: previous.income,
          [currentLabel]: current.income,
          previousLabel,
          currentLabel,
        },
        {
          category: 'Despesas',
          [previousLabel]: previous.expense,
          [currentLabel]: current.expense,
          previousLabel,
          currentLabel,
        },
        {
          category: 'Saldo',
          [previousLabel]: previous.balance,
          [currentLabel]: current.balance,
          previousLabel,
          currentLabel,
        },
      ],
      current,
      previous,
      currentLabel,
      previousLabel,
      currentLabelFull,
      previousLabelFull,
      variations: {
        income: incomeVariation,
        expense: expenseVariation,
        balance: balanceVariation,
      },
    };
  }, [allTransactions, selectedMonth]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatVariation = (value: number) => {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const { chartData, current, previous, currentLabel, previousLabel, currentLabelFull, previousLabelFull, variations } = comparisonData;

  const capitalizeFirst = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg shadow-lg p-3">
          <p className="font-medium text-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p
              key={index}
              className="text-sm"
              style={{ color: entry.fill }}
            >
              {capitalizeFirst(entry.name)}: {formatCurrency(entry.value)}
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <CardTitle className="text-lg">Comparativo Mensal</CardTitle>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-muted-foreground/40" />
              <span className="text-muted-foreground">{capitalizeFirst(previousLabelFull)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-primary" />
              <span className="text-muted-foreground">{capitalizeFirst(currentLabelFull)}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-success/10 border border-success/20">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <TrendingUp className="h-3 w-3" />
              Receitas
            </div>
            <div className="font-semibold text-foreground">{formatCurrency(current.income)}</div>
            <div className={cn(
              "text-xs flex items-center gap-0.5",
              variations.income >= 0 ? "text-success" : "text-destructive"
            )}>
              {variations.income >= 0 ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {formatVariation(variations.income)}
            </div>
          </div>
          
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <TrendingDown className="h-3 w-3" />
              Despesas
            </div>
            <div className="font-semibold text-foreground">{formatCurrency(current.expense)}</div>
            <div className={cn(
              "text-xs flex items-center gap-0.5",
              variations.expense <= 0 ? "text-success" : "text-destructive"
            )}>
              {variations.expense <= 0 ? (
                <ArrowDownRight className="h-3 w-3" />
              ) : (
                <ArrowUpRight className="h-3 w-3" />
              )}
              {formatVariation(variations.expense)}
            </div>
          </div>
          
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              Saldo
            </div>
            <div className="font-semibold text-foreground">{formatCurrency(current.balance)}</div>
            <div className={cn(
              "text-xs flex items-center gap-0.5",
              variations.balance >= 0 ? "text-success" : "text-destructive"
            )}>
              {variations.balance >= 0 ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {formatVariation(variations.balance)}
            </div>
          </div>
        </div>

        {/* Bar chart comparison */}
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData} 
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              barCategoryGap="20%"
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="category"
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey={previousLabel} 
                fill="hsl(var(--muted-foreground))" 
                opacity={0.4}
                radius={[4, 4, 0, 0]} 
              />
              <Bar 
                dataKey={currentLabel} 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
