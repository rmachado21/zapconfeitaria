import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { parseISO, startOfWeek, startOfMonth, startOfYear, endOfMonth, isAfter } from "date-fns";
import { Package, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface ProductQuantityChartProps {
  orders: Order[];
  selectedMonth: { month: number; year: number } | null;
  period: "week" | "month" | "year" | "all";
}

interface ProductQuantity {
  productName: string;
  quantity: number;
  unitType: string;
}

const CHART_COLORS = [
  "hsl(var(--primary) / 0.40)",
  "hsl(var(--primary) / 0.32)",
  "hsl(var(--primary) / 0.25)",
  "hsl(var(--primary) / 0.18)",
  "hsl(var(--primary) / 0.12)",
];

const formatQuantity = (qty: number, unitType: string) => {
  if (unitType === "kg") {
    return `${qty.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Kg`;
  }
  if (unitType === "cento") {
    return qty === 1 ? "1 cento" : `${qty} centos`;
  }
  return `${qty} un`;
};

export function ProductQuantityChart({ orders, selectedMonth, period }: ProductQuantityChartProps) {
  const [expanded, setExpanded] = useState(false);

  const { productQuantities, deliveredOrdersCount } = useMemo(() => {
    const now = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    if (selectedMonth) {
      startDate = new Date(selectedMonth.year, selectedMonth.month, 1);
      endDate = endOfMonth(startDate);
    } else {
      switch (period) {
        case "week":
          startDate = startOfWeek(now, { weekStartsOn: 0 });
          break;
        case "month":
          startDate = startOfMonth(now);
          break;
        case "year":
          startDate = startOfYear(now);
          break;
      }
    }

    const deliveredOrders = orders.filter((order) => {
      if (order.status !== "delivered") return false;
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

    const productMap = new Map<string, ProductQuantity>();

    deliveredOrders.forEach((order) => {
      (order.order_items || []).forEach((item) => {
        if (item.is_gift) return;

        const existing = productMap.get(item.product_name);
        const unitType = item.unit_type || "unit";

        if (existing) {
          existing.quantity += item.quantity;
        } else {
          productMap.set(item.product_name, {
            productName: item.product_name,
            quantity: item.quantity,
            unitType,
          });
        }
      });
    });

    const sorted = Array.from(productMap.values()).sort((a, b) => b.quantity - a.quantity);

    return {
      productQuantities: sorted,
      deliveredOrdersCount: deliveredOrders.length,
    };
  }, [orders, selectedMonth, period]);

  const displayedProducts = expanded ? productQuantities : productQuantities.slice(0, 5);
  const hasMoreProducts = productQuantities.length > 5;
  const maxQuantity = productQuantities[0]?.quantity || 1;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Quantidade Vendida
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        {productQuantities.length === 0 ? (
          <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground">
            <Package className="h-12 w-12 mb-3 opacity-50" />
            <p className="text-sm font-medium">Nenhum pedido entregue no período</p>
            <p className="text-xs mt-1">As quantidades vendidas aparecerão aqui</p>
          </div>
        ) : (
          <Collapsible open={expanded} onOpenChange={setExpanded}>
            <div className="space-y-3">
              {displayedProducts.map((product, index) => {
                const barWidth = (product.quantity / maxQuantity) * 100;
                const colorIndex = Math.min(index, CHART_COLORS.length - 1);

                return (
                  <div key={product.productName} className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium truncate flex-1">{product.productName}</span>
                      <span className="text-sm font-semibold tabular-nums whitespace-nowrap">
                        {formatQuantity(product.quantity, product.unitType)}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${barWidth}%`,
                          backgroundColor: CHART_COLORS[colorIndex],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {hasMoreProducts && (
              <>
                <CollapsibleContent className="space-y-3 mt-3">
                  {productQuantities.slice(5).map((product, index) => {
                    const barWidth = (product.quantity / maxQuantity) * 100;

                    return (
                      <div key={product.productName} className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium truncate flex-1">{product.productName}</span>
                          <span className="text-sm font-semibold tabular-nums whitespace-nowrap">
                            {formatQuantity(product.quantity, product.unitType)}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${barWidth}%`,
                              backgroundColor: CHART_COLORS[CHART_COLORS.length - 1],
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </CollapsibleContent>

                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full mt-3 text-muted-foreground hover:text-foreground" size="sm">
                    <ChevronDown
                      className={cn("h-4 w-4 mr-2 transition-transform duration-200", expanded && "rotate-180")}
                    />
                    {expanded ? "Ver menos" : `Ver todos (${productQuantities.length} produtos)`}
                  </Button>
                </CollapsibleTrigger>
              </>
            )}

            <div className="flex items-center justify-center gap-1.5 mt-4 text-xs text-muted-foreground">
              <Package className="h-3 w-3.5" />
              <span>
                Baseado em {deliveredOrdersCount} pedido{deliveredOrdersCount !== 1 ? "s" : ""} entregue
                {deliveredOrdersCount !== 1 ? "s" : ""}
              </span>
            </div>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}
