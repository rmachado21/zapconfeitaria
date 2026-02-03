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
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  
  const { topProducts, deliveredOrdersCount } = useMemo(() => {
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

    const productMap = new Map<string, TopProduct>();
    const productOrders = new Map<string, Set<string>>();

    deliveredOrders.forEach(order => {
      (order.order_items || []).forEach(item => {
        if (item.is_gift) return;
        
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

    const sorted = Array.from(productMap.values())
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, 5);

    return { 
      topProducts: sorted, 
      deliveredOrdersCount: deliveredOrders.length 
    };
  }, [orders, selectedMonth, period]);

  const formatQuantity = (value: number) => {
    if (Number.isInteger(value)) return value.toString();
    return value.toFixed(1);
  };

  const renderOrderCountLabel = (props: any) => {
    const { x, y, width, value, height } = props;
    const label = `${value} ${value === 1 ? 'pedido' : 'pedidos'}`;
    return (
      <text
        x={x + width + 6}
        y={y + (height || 24) / 2 + 4}
        fill="hsl(var(--foreground))"
        fontSize={11}
        fontWeight={600}
      >
        {label}
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
      <CardContent className="px-3 sm:px-6">
        {topProducts.length === 0 ? (
          <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground">
            <Package className="h-12 w-12 mb-3 opacity-50" />
            <p className="text-sm font-medium">Nenhum pedido entregue no período</p>
            <p className="text-xs mt-1">Os produtos mais vendidos aparecerão aqui</p>
          </div>
        ) : (
          <>
            {isMobile ? (
              <div className="space-y-3">
              {topProducts.map((product, index) => {
                  const maxOrders = topProducts[0]?.orderCount || 1;
                  const barWidth = (product.orderCount / maxOrders) * 100;
                  
                  return (
                    <div key={product.productName} className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-muted-foreground w-5">#{index + 1}</span>
                        <span className="text-sm font-medium truncate flex-1">{product.productName}</span>
                        <span className="text-sm font-semibold tabular-nums whitespace-nowrap">
                          {product.orderCount} {product.orderCount === 1 ? 'pedido' : 'pedidos'}
                        </span>
                      </div>
                      <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-300"
                          style={{ 
                            width: `${barWidth}%`,
                            backgroundColor: CHART_COLORS[index],
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topProducts.map((p, i) => ({
                      ...p,
                      displayName: `#${i + 1}  ${p.productName.length > 22 ? p.productName.substring(0, 21) + '…' : p.productName}`,
                      rank: i + 1,
                    }))}
                    layout="vertical"
                    margin={{ top: 5, right: 40, left: 5, bottom: 5 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="displayName"
                      width={180}
                      tick={{ 
                        fill: 'hsl(var(--foreground))', 
                        fontSize: 12,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Bar
                      dataKey="orderCount"
                      radius={[0, 4, 4, 0]}
                      maxBarSize={28}
                    >
                      {topProducts.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index]} />
                      ))}
                      <LabelList
                        dataKey="orderCount"
                        content={renderOrderCountLabel}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="flex items-center justify-center gap-1.5 mt-4 text-xs text-muted-foreground">
              <Package className="h-3.5 w-3.5" />
              <span>Baseado em {deliveredOrdersCount} pedido{deliveredOrdersCount !== 1 ? 's' : ''} entregue{deliveredOrdersCount !== 1 ? 's' : ''}</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
