import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { ScrollAreaWithIndicator } from "@/components/ui/scroll-area-with-indicator";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Package, Clock, CheckCircle, FileText, XCircle } from "lucide-react";
import { formatOrderNumber } from "@/hooks/useOrders";
import { format, parseISO } from "date-fns";
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md max-h-[90dvh] flex flex-col overflow-hidden"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Pedidos Ativos
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col flex-1 min-h-0 space-y-4">
          {/* Summary Card */}
          <Card className="shrink-0 p-4 bg-primary/5 border-primary/20">
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
            <ScrollAreaWithIndicator className="pr-4">
              <div className="space-y-3 pr-4">
                {sortedOrders.map((order) => {
                  const config = ORDER_STATUS_CONFIG[order.status];
                  const StatusIcon = statusIcons[order.status];

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
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm">
                                {formatOrderNumber(order.order_number)}
                              </span>
                              <Badge className={`text-xs px-1.5 py-0.5 ${config.bgColor} ${config.color}`}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {config.label}
                              </Badge>
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
                        {order.delivery_date && (
                          <p className="text-xs text-muted-foreground">
                            Entrega:{" "}
                            {format(parseISO(order.delivery_date), "dd/MM/yyyy", {
                              locale: ptBR,
                            })}
                            {order.delivery_time && ` às ${order.delivery_time.slice(0, 5)}`}
                          </p>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </ScrollAreaWithIndicator>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
