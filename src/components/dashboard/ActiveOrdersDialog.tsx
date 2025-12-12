import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Package, Clock, CheckCircle, FileText, XCircle } from "lucide-react";
import { formatOrderNumber } from "@/hooks/useOrders";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { OrderStatus } from "@/types";

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

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
  quote: { label: "Orçamento", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300", icon: FileText },
  awaiting_deposit: { label: "Aguardando Sinal", color: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300", icon: Clock },
  in_production: { label: "Em Produção", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300", icon: Package },
  ready: { label: "Pronto", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300", icon: CheckCircle },
  delivered: { label: "Entregue", color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300", icon: CheckCircle },
  cancelled: { label: "Cancelado", color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300", icon: XCircle },
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
        className="max-w-md mx-4"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Pedidos Ativos
          </DialogTitle>
        </DialogHeader>

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
            <ScrollArea className="max-h-[50vh]">
              <div className="space-y-3 pr-2">
                {sortedOrders.map((order) => {
                  const config = statusConfig[order.status];
                  const StatusIcon = config.icon;

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
                              <Badge className={`text-xs px-1.5 py-0 ${config.color}`}>
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
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
