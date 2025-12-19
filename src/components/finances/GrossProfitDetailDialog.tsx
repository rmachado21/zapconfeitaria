import { useMemo } from "react";
import { ResponsivePanel } from "@/components/ui/responsive-panel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Package, DollarSign, Percent } from "lucide-react";
import { formatOrderNumber } from "@/hooks/useOrders";

interface OrderWithItems {
  id: string;
  order_number: number | null;
  total_amount: number | null;
  updated_at: string;
  client?: { name: string } | null;
  order_items?: Array<{
    id: string;
    product_id: string | null;
    product_name: string;
    quantity: number;
    unit_price: number;
    is_gift: boolean;
  }>;
}

interface Product {
  id: string;
  cost_price: number;
}

interface GrossProfitDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orders: OrderWithItems[];
  products: Product[];
  totals: {
    profit: number;
    margin: number;
    revenue: number;
    costs: number;
  };
}

export function GrossProfitDetailDialog({
  open,
  onOpenChange,
  orders,
  products,
  totals,
}: GrossProfitDetailDialogProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Calculate profit per order
  const ordersWithProfit = useMemo(() => {
    return orders
      .map((order) => {
        const revenue = order.total_amount || 0;
        const cost = (order.order_items || []).reduce((sum, item) => {
          if (item.is_gift) return sum;
          const product = products.find((p) => p.id === item.product_id);
          const costPrice = product?.cost_price || 0;
          return sum + costPrice * item.quantity;
        }, 0);
        const profit = revenue - cost;
        const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

        return {
          ...order,
          revenue,
          cost,
          profit,
          margin,
        };
      })
      .sort((a, b) => b.profit - a.profit); // Sort by profit descending
  }, [orders, products]);

  return (
    <ResponsivePanel
      open={open}
      onOpenChange={onOpenChange}
      title="Detalhamento do Lucro Bruto"
      onInteractOutside={(e) => e.preventDefault()}
    >
      <div className="space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-primary/10 border-primary/20">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">Faturamento</p>
              <p className="text-lg font-bold text-success">{formatCurrency(totals.revenue)}</p>
            </CardContent>
          </Card>
          <Card className="bg-warning/10 border-warning/20">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">Custo Produtos</p>
              <p className="text-lg font-bold text-warning">{formatCurrency(totals.costs)}</p>
            </CardContent>
          </Card>
          <Card className="bg-success/10 border-success/20">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">Lucro Bruto</p>
              <p className="text-lg font-bold text-primary">{formatCurrency(totals.profit)}</p>
            </CardContent>
          </Card>
          <Card className="bg-muted border-border">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">Margem</p>
              <p className="text-lg font-bold">{totals.margin.toFixed(1)}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Package className="h-4 w-4" />
            Pedidos Entregues ({ordersWithProfit.length})
          </h3>

          <div className="space-y-2">
            {ordersWithProfit.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum pedido entregue no período selecionado
              </p>
            ) : (
              ordersWithProfit.map((order) => (
                <Card key={order.id} className="border">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs">
                            {formatOrderNumber(order.order_number)}
                          </Badge>
                          <span className="text-sm font-medium truncate">
                            {order.client?.name || "Cliente não informado"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {formatCurrency(order.revenue)}
                          </span>
                          <span>-</span>
                          <span className="text-warning">{formatCurrency(order.cost)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${order.profit >= 0 ? "text-success" : "text-destructive"}`}>
                          {formatCurrency(order.profit)}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-0.5 justify-end">
                          <Percent className="h-3 w-3" />
                          {order.margin.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </ResponsivePanel>
  );
}
