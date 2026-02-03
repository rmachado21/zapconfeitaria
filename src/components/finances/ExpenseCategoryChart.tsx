import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction } from '@/hooks/useTransactions';
import { PieChartIcon } from 'lucide-react';

const COLORS = [
  'hsl(25, 60%, 45%)',   // Primary warm brown
  'hsl(35, 70%, 50%)',   // Golden
  'hsl(15, 65%, 55%)',   // Orange-brown
  'hsl(45, 60%, 45%)',   // Olive
  'hsl(5, 55%, 50%)',    // Reddish
  'hsl(55, 50%, 45%)',   // Yellow-brown
  'hsl(200, 40%, 50%)',  // Blue accent
];

const EXPENSE_CATEGORIES = [
  'Insumos',
  'Embalagens',
  'Combustível',
  'Equipamentos',
  'Marketing',
  'Aluguel',
  'Outros',
];

interface ExpenseCategoryChartProps {
  transactions: Transaction[];
}

export function ExpenseCategoryChart({ transactions }: ExpenseCategoryChartProps) {
  const chartData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    
    const categoryTotals: Record<string, number> = {};
    
    expenses.forEach(expense => {
      // Extract category from description (format: "Category - Description")
      const description = expense.description || '';
      const dashIndex = description.indexOf(' - ');
      const category = dashIndex > 0 
        ? description.substring(0, dashIndex)
        : 'Outros';
      
      // Check if it's a known category
      const normalizedCategory = EXPENSE_CATEGORIES.includes(category) ? category : 'Outros';
      
      categoryTotals[normalizedCategory] = (categoryTotals[normalizedCategory] || 0) + expense.amount;
    });
    
    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const totalExpenses = chartData.reduce((sum, item) => sum + item.value, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = totalExpenses > 0 ? ((data.value / totalExpenses) * 100).toFixed(1) : 0;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-sm">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(data.value)} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-col gap-1.5 mt-2 px-2">
        {payload?.map((entry: any, index: number) => {
          const percentage = totalExpenses > 0 
            ? ((entry.payload.value / totalExpenses) * 100).toFixed(0) 
            : 0;
          return (
            <div 
              key={`legend-${index}`} 
              className="flex items-center gap-2 text-xs"
            >
              <div 
                className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground truncate flex-1 min-w-0">
                {entry.value}
              </span>
              <span className="font-medium text-foreground flex-shrink-0">{percentage}%</span>
            </div>
          );
        })}
      </div>
    );
  };

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <PieChartIcon className="h-4 w-4" />
            Despesas por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
            Nenhuma despesa registrada
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <PieChartIcon className="h-4 w-4" />
          Despesas por Categoria
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="45%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((_, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    className="stroke-background stroke-2"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="text-center mt-2">
          <p className="text-xs text-muted-foreground">Total de Despesas</p>
          <p className="text-lg font-semibold text-destructive">{formatCurrency(totalExpenses)}</p>
        </div>
      </CardContent>
    </Card>
  );
}
