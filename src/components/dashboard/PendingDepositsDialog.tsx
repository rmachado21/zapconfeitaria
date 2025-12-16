import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, Check } from "lucide-react";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import { formatOrderNumber } from "@/hooks/useOrders";
import { openWhatsAppWithTemplate } from "@/lib/whatsapp";
import { useProfile } from "@/hooks/useProfile";
import { differenceInDays, parseISO, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { OrderStatus } from "@/types";

interface Order {
  id: string;
  order_number: number | null;
  total_amount: number;
  deposit_paid: boolean;
  status: OrderStatus;
  created_at: string;
  delivery_date?: string | null;
  delivery_time?: string | null;
  client?: {
    name: string;
    phone?: string | null;
  } | null;
}

interface PendingDepositsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orders: Order[];
  onDepositPaid: (
    orderId: string,
    depositPaid: boolean,
    clientName?: string,
    totalAmount?: number,
    currentStatus?: OrderStatus
  ) => void;
}

export function PendingDepositsDialog({
  open,
  onOpenChange,
  orders,
  onDepositPaid,
}: PendingDepositsDialogProps) {
  const { profile } = useProfile();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const totalPending = orders.reduce((sum, o) => sum + o.total_amount / 2, 0);

  // Sort by oldest first
  const sortedOrders = [...orders].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const handleMarkAsPaid = (order: Order) => {
    onDepositPaid(
      order.id,
      true,
      order.client?.name,
      order.total_amount,
      order.status
    );
  };

  const handleWhatsApp = (order: Order) => {
    if (!order.client?.phone) return;
    
    openWhatsAppWithTemplate(order.client.phone, 'deposit_collection', {
      clientName: order.client.name,
      companyName: profile?.company_name || undefined,
      orderNumber: order.order_number,
      totalAmount: order.total_amount,
      deliveryDate: order.delivery_date,
      deliveryTime: order.delivery_time,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md mx-4 max-h-[90dvh] flex flex-col overflow-hidden"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            Sinais Pendentes
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary Card */}
          <Card className="p-4 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Pendente</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {formatCurrency(totalPending)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {orders.length} {orders.length === 1 ? "pedido" : "pedidos"} aguardando
              </p>
            </div>
          </Card>

          {/* Orders List */}
          {orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Check className="h-12 w-12 mx-auto mb-2 text-green-500" />
              <p>Nenhum sinal pendente!</p>
            </div>
          ) : (
            <ScrollArea className="flex-1 min-h-0">
              <div className="space-y-3 pr-2">
                {sortedOrders.map((order) => {
                  const daysPending = differenceInDays(
                    new Date(),
                    parseISO(order.created_at)
                  );
                  const isOverdue = daysPending > 7;
                  const depositValue = order.total_amount / 2;

                  return (
                    <Card
                      key={order.id}
                      className={`p-3 ${isOverdue ? "border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20" : ""}`}
                    >
                      <div className="flex flex-col gap-2">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm">
                                {formatOrderNumber(order.order_number)}
                              </span>
                              {isOverdue && (
                                <Badge variant="destructive" className="text-xs px-1.5 py-0">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  {daysPending}d
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-foreground">
                              {order.client?.name || "Cliente não informado"}
                            </p>
                          </div>
                          <span className="font-bold text-amber-600 dark:text-amber-400">
                            {formatCurrency(depositValue)}
                          </span>
                        </div>

                        {/* Date info */}
                        <p className="text-xs text-muted-foreground">
                          Criado em{" "}
                          {format(parseISO(order.created_at), "dd/MM/yyyy", {
                            locale: ptBR,
                          })}{" "}
                          · há {daysPending} {daysPending === 1 ? "dia" : "dias"}
                        </p>

                        {/* Actions */}
                        <div className="flex gap-2 mt-1">
                          {order.client?.phone && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 text-xs"
                              onClick={() => handleWhatsApp(order)}
                            >
                              <WhatsAppIcon className="h-3.5 w-3.5 mr-1" />
                              Cobrar
                            </Button>
                          )}
                          <Button
                            variant="default"
                            size="sm"
                            className="flex-1 text-xs"
                            onClick={() => handleMarkAsPaid(order)}
                          >
                            <Check className="h-3.5 w-3.5 mr-1" />
                            Marcar Pago
                          </Button>
                        </div>
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
