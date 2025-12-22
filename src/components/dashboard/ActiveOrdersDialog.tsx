import { ResponsivePanel } from "@/components/ui/responsive-panel";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Package, Clock, CheckCircle, FileText, XCircle } from "lucide-react";
import { formatOrderNumber } from "@/hooks/useOrders";
import { format, parseISO, differenceInDays, isToday, isPast, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { OrderStatus, ORDER_STATUS_CONFIG } from "@/types";

interface Order {
  id: string;
  order_number: number | null;
  total_amount: number;
  status: OrderStatus;
  delivery_date: string | null;
  delivery_time: string | null;
  created_at: string;
  client?: {
    name: string;
  } | null;
}

interface ActiveOrdersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orders: Order[];
  onOrderClick?: (order: Order) => void;
}

const statusIcons: Record<OrderStatus, React.ElementType> = {
  quote: FileText,
  awaiting_deposit: Clock,
  in_production: Package,
  ready: CheckCircle,
  delivered: CheckCircle,
  cancelled: XCircle,
};

export function ActiveOrdersDialog({
  open,
  onOpenChange,
  orders,
  onOrderClick,
}: ActiveOrdersDialogProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const totalValue = orders.reduce((sum, o) => sum + o.total_amount, 0);

  // Sort by delivery date (earliest first), then by created_at
  const sortedOrders = [...orders].sort((a, b) => {
    if (a.delivery_date && b.delivery_date) {
      return new Date(a.delivery_date).getTime() - new Date(b.delivery_date).getTime();
    }
    if (a.delivery_date) return -1;
    if (b.delivery_date) return 1;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  return (
    <ResponsivePanel
      open={open}
      onOpenChange={onOpenChange}
      title="Pedidos Ativos"
      onInteractOutside={(e) => e.preventDefault()}
    >
      <div className="space-y-4">
        {/* Summary Card */}
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total em Andamento</p>
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(totalValue)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {orders.length} {orders.length === 1 ? "pedido" : "pedidos"} ativos
            </p>
          </div>
        </Card>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ShoppingBag className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhum pedido ativo no momento</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedOrders.map((order) => {
              const config = ORDER_STATUS_CONFIG[order.status];
              const StatusIcon = statusIcons[order.status];

              // Calculate urgency
              const deliveryDate = order.delivery_date ? parseISO(order.delivery_date) : null;
              const today = startOfDay(new Date());
              const daysUntilDelivery = deliveryDate ? differenceInDays(startOfDay(deliveryDate), today) : null;
              const isDeliveryToday = deliveryDate ? isToday(deliveryDate) : false;
              const isOverdue = deliveryDate ? isPast(deliveryDate) && !isToday(deliveryDate) : false;

              // Determine urgency level and colors
              let urgencyText = "";
              let urgencyBgClass = "";
              if (isOverdue) {
                urgencyText = "Atrasado";
                urgencyBgClass = "bg-red-500/50 text-red-900 dark:text-red-100";
              } else if (isDeliveryToday) {
                urgencyText = "Hoje!";
                urgencyBgClass = "bg-red-500/50 text-red-900 dark:text-red-100";
              } else if (daysUntilDelivery === 1) {
                urgencyText = "Amanhã";
                urgencyBgClass = "bg-red-500/50 text-red-900 dark:text-red-100";
              } else if (daysUntilDelivery !== null && daysUntilDelivery >= 2 && daysUntilDelivery <= 3) {
                urgencyText = `${daysUntilDelivery} dias`;
                urgencyBgClass = "bg-yellow-500/50 text-yellow-900 dark:text-yellow-100";
              } else if (daysUntilDelivery !== null && daysUntilDelivery > 3) {
                urgencyText = `${daysUntilDelivery} dias`;
                urgencyBgClass = "bg-muted text-muted-foreground";
              }

              return (
                <Card
                  key={order.id}
                  className="p-3 cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => onOrderClick?.(order)}
                >
                  <div className="flex flex-col gap-2">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm">
                            {formatOrderNumber(order.order_number)}
                          </span>
                          <Badge className={`text-xs px-1.5 py-0.5 ${config.bgColor} ${config.color}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {config.label}
                          </Badge>
                          {urgencyText && (
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${urgencyBgClass}`}>
                              {urgencyText}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-foreground">
                          {order.client?.name || "Cliente não informado"}
                        </p>
                      </div>
                      <span className="font-bold text-foreground">
                        {formatCurrency(order.total_amount)}
                      </span>
                    </div>

                    {/* Delivery info */}
                    <p className="text-xs text-muted-foreground">
                      Entrega:{" "}
                      {order.delivery_date
                        ? `${format(parseISO(order.delivery_date), "dd/MM/yyyy", { locale: ptBR })}${order.delivery_time ? ` às ${order.delivery_time.slice(0, 5)}` : ""}`
                        : "A definir"}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </ResponsivePanel>
  );
}
