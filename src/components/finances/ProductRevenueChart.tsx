import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ShoppingBag } from 'lucide-react';
import { parseISO, startOfWeek, startOfMonth, startOfYear, endOfMonth, isAfter } from 'date-fns';

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  is_gift: boolean;
}

interface Order {
  id: string;
  status: string;
  delivery_date: string | null;
  order_items?: OrderItem[];
}

interface ProductRevenueChartProps {
  orders: Order[];
  selectedMonth: { month: number; year: number } | null;
  period: 'week' | 'month' | 'year' | 'all';
}

interface ProductRevenue {
  name: string;
  value: number;
}

const COLORS = [
  'hsl(155, 60%, 40%)',   // Emerald
  'hsl(165, 55%, 45%)',   // Teal
  'hsl(145, 50%, 50%)',   // Green
  'hsl(175, 45%, 40%)',   // Cyan-green
  'hsl(135, 40%, 55%)',   // Light green
  'hsl(185, 35%, 45%)',   // Blue-green
  'hsl(195, 45%, 50%)',   // Outros (blue-ish)
];

export function ProductRevenueChart({ orders, selectedMonth, period }: ProductRevenueChartProps) {
  const { chartData, totalRevenue, deliveredOrdersCount } = useMemo(() => {
    const now = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = null;
    
    if (selectedMonth) {
      startDate = new Date(selectedMonth.year, selectedMonth.month, 1);
      endDate = endOfMonth(startDate);
    } else {
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
    }

    // Filter delivered orders in the period
    const deliveredOrders = orders.filter(order => {
      if (order.status !== 'delivered') return false;
      if (!order.delivery_date) return false;
      if (!startDate) return true;
      
      const orderDate = parseISO(order.delivery_date);
      const afterStart = isAfter(orderDate, startDate) || orderDate.getTime() === startDate.getTime();
      
      if (endDate) {
        const beforeEnd = orderDate.getTime() <= endDate.getTime();
        return afterStart && beforeEnd;
      }
      
      return afterStart;
    });

    // Aggregate revenue by product
    const productMap = new Map<string, number>();

    deliveredOrders.forEach(order => {
      (order.order_items || []).forEach(item => {
        if (item.is_gift) return;
        
        const revenue = item.unit_price * item.quantity;
        const existing = productMap.get(item.product_name) || 0;
        productMap.set(item.product_name, existing + revenue);
      });
    });

    // Sort by revenue and limit to top 6
    const sorted = Array.from(productMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    let finalData: ProductRevenue[];
    
    if (sorted.length > 6) {
      const top6 = sorted.slice(0, 6);
      const othersValue = sorted.slice(6).reduce((sum, item) => sum + item.value, 0);
      finalData = [...top6, { name: 'Outros', value: othersValue }];
    } else {
      finalData = sorted;
    }

    const total = finalData.reduce((sum, item) => sum + item.value, 0);

    return { chartData: finalData, totalRevenue: total, deliveredOrdersCount: deliveredOrders.length };
  }, [orders, selectedMonth, period]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = totalRevenue > 0 
        ? ((data.value / totalRevenue) * 100).toFixed(1) 
        : 0;
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
          const percentage = totalRevenue > 0 
            ? ((entry.payload.value / totalRevenue) * 100).toFixed(0) 
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
            <DollarSign className="h-4 w-4" />
            Receitas por Produto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
            Nenhuma receita registrada
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          Receitas por Produto
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
          <p className="text-xs text-muted-foreground">Total de Receitas</p>
          <p className="text-lg font-semibold" style={{ color: COLORS[0] }}>{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-muted-foreground">
          <ShoppingBag className="h-3.5 w-3.5" />
          <span>Baseado em {deliveredOrdersCount} pedido{deliveredOrdersCount !== 1 ? 's' : ''} entregue{deliveredOrdersCount !== 1 ? 's' : ''}</span>
        </div>
      </CardContent>
    </Card>
  );
}
