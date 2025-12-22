import { format, parseISO, differenceInDays, isToday, isPast, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ResponsivePanel } from "@/components/ui/responsive-panel";
import { ORDER_STATUS_CONFIG, OrderStatus } from "@/types";

interface Order {
  id: string;
  order_number: number | null;
  total_amount: number | null;
  status: string;
  delivery_date: string | null;
  delivery_time: string | null;
  client?: {
    name: string;
    phone?: string | null;
  } | null;
}

interface FullyPaidOrdersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orders: Order[];
  onOrderClick?: (order: Order) => void;
}

export function FullyPaidOrdersDialog({
  open,
  onOpenChange,
  orders,
  onOrderClick,
}: FullyPaidOrdersDialogProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const totalPaid = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);

  // Sort by delivery date
  const sortedOrders = [...orders].sort((a, b) => {
    const dateA = a.delivery_date ? new Date(a.delivery_date).getTime() : Infinity;
    const dateB = b.delivery_date ? new Date(b.delivery_date).getTime() : Infinity;
    return dateA - dateB;
  });

  return (
    <ResponsivePanel
      open={open}
      onOpenChange={onOpenChange}
      title="Pedidos 100% Pagos"
      description="Pedidos que já foram pagos integralmente"
    >
      <div className="space-y-4 p-4 md:p-6">
        {/* Summary Card */}
        <Card className="bg-success/10 border-success/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-success/20">
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Recebido</p>
                  <p className="text-xl font-bold text-success">{formatCurrency(totalPaid)}</p>
                </div>
              </div>
              <Badge variant="outline" className="border-success/30 text-success">
                {orders.length} {orders.length === 1 ? "pedido" : "pedidos"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <div className="space-y-3">
          {sortedOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Nenhum pedido pago antecipadamente</p>
            </div>
          ) : (
            sortedOrders.map((order) => {
              const statusConfig = ORDER_STATUS_CONFIG[order.status as OrderStatus];
              
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
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onOrderClick?.(order)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="font-semibold text-sm">
                            #{order.order_number?.toString().padStart(4, "0")}
                          </span>
                          {statusConfig && (
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1.5 py-0"
                              style={{ 
                                borderColor: statusConfig.color,
                                color: statusConfig.color 
                              }}
                            >
                              {statusConfig.label}
                            </Badge>
                          )}
                          {urgencyText && (
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${urgencyBgClass}`}>
                              {urgencyText}
                            </span>
                          )}
                        </div>

                        {/* Client */}
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
                          <User className="h-3.5 w-3.5" />
                          <span className="truncate">{order.client?.name || "Cliente"}</span>
                        </div>

                        {/* Delivery Info */}
                        <p className="text-xs text-muted-foreground">
                          Entrega:{" "}
                          {order.delivery_date
                            ? `${format(parseISO(order.delivery_date), "dd/MM/yyyy", { locale: ptBR })}${order.delivery_time ? ` às ${order.delivery_time.slice(0, 5)}` : ""}`
                            : "A definir"}
                        </p>
                      </div>

                      {/* Amount */}
                      <div className="text-right">
                        <p className="font-bold text-success">
                          {formatCurrency(order.total_amount || 0)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">100% pago</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </ResponsivePanel>
  );
}
