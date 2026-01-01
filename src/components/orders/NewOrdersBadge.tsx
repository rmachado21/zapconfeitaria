import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sparkles, Calendar, Clock } from "lucide-react";
import { Order } from "@/hooks/useOrders";
import { format, parseISO, isAfter, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface NewOrdersBadgeProps {
  orders: Order[];
  onOrderClick: (order: Order) => void;
}

export const NewOrdersBadge = ({ orders, onOrderClick }: NewOrdersBadgeProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  // Get orders created in the last 7 days
  const recentOrders = useMemo(() => {
    const sevenDaysAgo = subDays(new Date(), 7);
    return orders
      .filter((order) => {
        const createdAt = parseISO(order.created_at);
        return isAfter(createdAt, sevenDaysAgo);
      })
      .sort((a, b) => {
        // Sort by created_at descending (newest first)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [orders]);

  const newOrdersCount = recentOrders.length;

  if (newOrdersCount === 0) return null;

  const handleOrderClick = (order: Order) => {
    setDialogOpen(false);
    onOrderClick(order);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setDialogOpen(true)}
        className="h-8 gap-1.5 text-xs font-medium text-primary hover:text-primary hover:bg-primary/10"
      >
        <Sparkles className="h-3.5 w-3.5" />
        <span>{newOrdersCount} {newOrdersCount === 1 ? 'novo' : 'novos'}</span>
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Pedidos Criados Recentemente
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {newOrdersCount} {newOrdersCount === 1 ? 'pedido criado' : 'pedidos criados'} nos últimos 7 dias
            </p>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {recentOrders.map((order) => (
              <button
                key={order.id}
                onClick={() => handleOrderClick(order)}
                className="w-full p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors text-left"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        #{order.order_number?.toString().padStart(3, '0')}
                      </span>
                      <span className="text-sm text-muted-foreground truncate">
                        {order.client?.name || 'Cliente não informado'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Criado {format(parseISO(order.created_at), "dd/MM 'às' HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                    
                    {order.delivery_date && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Entrega: {format(parseISO(order.delivery_date), "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right shrink-0">
                    <span className="font-semibold text-foreground">
                      {(order.total_amount || 0).toLocaleString('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL' 
                      })}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
