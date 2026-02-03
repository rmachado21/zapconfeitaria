import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import { parseISO, startOfWeek, startOfMonth, startOfYear, endOfMonth, isAfter } from 'date-fns';
import { Package, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  is_gift: boolean;
  unit_type: string | null;
}

interface Order {
  id: string;
  status: string;
  delivery_date: string | null;
  order_items?: OrderItem[];
}

interface TopProductsChartProps {
  orders: Order[];
  selectedMonth: { month: number; year: number } | null;
  period: 'week' | 'month' | 'year' | 'all';
}

interface TopProduct {
  productName: string;
  quantity: number;
  revenue: number;
  orderCount: number;
}

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--primary) / 0.85)',
  'hsl(var(--primary) / 0.7)',
  'hsl(var(--primary) / 0.55)',
  'hsl(var(--primary) / 0.4)',
];

export function TopProductsChart({ orders, selectedMonth, period }: TopProductsChartProps) {
  const { topProducts, deliveredOrdersCount } = useMemo(() => {
    const now = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = null;
    
    // If a specific month is selected, use that
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

    // Filter orders: delivered only, within period
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

    // Group items by product name
    const productMap = new Map<string, TopProduct>();
    const productOrders = new Map<string, Set<string>>();

    deliveredOrders.forEach(order => {
      (order.order_items || []).forEach(item => {
        if (item.is_gift) return; // Skip gifts
        
        const existing = productMap.get(item.product_name);
        const orderSet = productOrders.get(item.product_name) || new Set();
        orderSet.add(order.id);
        productOrders.set(item.product_name, orderSet);

        if (existing) {
          existing.quantity += item.quantity;
          existing.revenue += item.unit_price * item.quantity;
          existing.orderCount = orderSet.size;
        } else {
          productMap.set(item.product_name, {
            productName: item.product_name,
            quantity: item.quantity,
            revenue: item.unit_price * item.quantity,
            orderCount: 1,
          });
        }
      });
    });

    // Sort by quantity and get top 5
    const sorted = Array.from(productMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return { 
      topProducts: sorted, 
      deliveredOrdersCount: deliveredOrders.length 
    };
  }, [orders, selectedMonth, period]);

  // Format quantity with unit
  const formatQuantity = (value: number) => {
    if (Number.isInteger(value)) return value.toString();
    return value.toFixed(1);
  };

  // Truncate product name for chart
  const truncateName = (name: string, maxLength: number = 18) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength - 1) + '…';
  };

  // Custom label component for quantity
  const renderCustomLabel = (props: any) => {
    const { x, y, width, value } = props;
    return (
      <text
        x={x + width + 8}
        y={y + 12}
        fill="hsl(var(--foreground))"
        fontSize={12}
        fontWeight={600}
      >
        {formatQuantity(value)}
      </text>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Top 5 Produtos
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {topProducts.length === 0 ? (
          <div className="h-[280px] flex flex-col items-center justify-center text-muted-foreground">
            <Package className="h-12 w-12 mb-3 opacity-50" />
            <p className="text-sm font-medium">Nenhum pedido entregue no período</p>
            <p className="text-xs mt-1">Os produtos mais vendidos aparecerão aqui</p>
          </div>
        ) : (
          <>
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topProducts.map((p, i) => ({
                    ...p,
                    displayName: `#${i + 1} ${truncateName(p.productName)}`,
                    rank: i + 1,
                  }))}
                  layout="vertical"
                  margin={{ top: 5, right: 50, left: 10, bottom: 5 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="displayName"
                    width={140}
                    tick={{ 
                      fill: 'hsl(var(--foreground))', 
                      fontSize: 12,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Bar
                    dataKey="quantity"
                    radius={[0, 4, 4, 0]}
                    maxBarSize={32}
                  >
                    {topProducts.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index]} />
                    ))}
                    <LabelList
                      dataKey="quantity"
                      content={renderCustomLabel}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-1.5 mt-2 text-xs text-muted-foreground">
              <Package className="h-3.5 w-3.5" />
              <span>Baseado em {deliveredOrdersCount} pedido{deliveredOrdersCount !== 1 ? 's' : ''} entregue{deliveredOrdersCount !== 1 ? 's' : ''}</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
