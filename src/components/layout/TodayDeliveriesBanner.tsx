import { Link } from 'react-router-dom';
import { Truck, X, ChevronRight, Check, Banknote } from 'lucide-react';
import { useState } from 'react';
import { useOrders } from '@/hooks/useOrders';
import { format } from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

export function TodayDeliveriesBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [confirmOrder, setConfirmOrder] = useState<{ id: string; clientName: string; totalAmount: number } | null>(null);
  const { orders, updateOrderStatus } = useOrders();
  
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const todayOrders = (orders?.filter(order => {
    if (!order.delivery_date) return false;
    // Compare date strings directly to avoid timezone conversion issues
    const orderDate = order.delivery_date.split('T')[0];
    return orderDate === today && order.status !== 'delivered' && order.status !== 'cancelled';
  }) || []).sort((a, b) => {
    // Sort by delivery time (orders without time go to the end)
    if (!a.delivery_time && !b.delivery_time) return 0;
    if (!a.delivery_time) return 1;
    if (!b.delivery_time) return -1;
    return a.delivery_time.localeCompare(b.delivery_time);
  });
  
  if (dismissed || todayOrders.length === 0) {
    return null;
  }
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatTime = (time: string | null) => {
    if (!time) return null;
    return time.slice(0, 5);
  };

  const handleMarkDelivered = (e: React.MouseEvent, order: typeof todayOrders[0]) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmOrder({
      id: order.id,
      clientName: order.client?.name || 'Cliente',
      totalAmount: order.total_amount || 0,
    });
  };

  const confirmDelivery = () => {
    if (confirmOrder) {
      updateOrderStatus.mutate({
        id: confirmOrder.id,
        status: 'delivered',
        clientName: confirmOrder.clientName,
        totalAmount: confirmOrder.totalAmount,
      });
      setConfirmOrder(null);
    }
  };
  
  return (
    <>
      <div className="bg-primary/10 border-b border-primary/20">
        <div className="px-4 py-2 flex items-center justify-between gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 flex-1 min-w-0 text-left">
                <Truck className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm font-medium text-primary truncate">
                  {todayOrders.length === 1 
                    ? '1 pedido para entregar hoje!' 
                    : `${todayOrders.length} pedidos para entregar hoje!`}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
              <div className="p-3 border-b border-border">
                <h4 className="font-semibold text-sm">Entregas de Hoje</h4>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {todayOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors border-b border-border last:border-b-0"
                  >
                    <Link to="/orders" className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {order.client?.name || 'Cliente não informado'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.delivery_time ? `${formatTime(order.delivery_time)} - ` : ''}
                        {formatCurrency(order.total_amount || 0)}
                      </p>
                    </Link>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      className="shrink-0 text-success hover:text-success hover:bg-success/10"
                      onClick={(e) => handleMarkDelivered(e, order)}
                      title="Marcar como entregue"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-border">
                <Link
                  to="/orders"
                  className="block text-center text-xs text-primary hover:underline"
                >
                  Ver todos os pedidos
                </Link>
              </div>
            </PopoverContent>
          </Popover>
          <button 
            onClick={(e) => {
              e.preventDefault();
              setDismissed(true);
            }}
            className="p-1 hover:bg-primary/10 rounded-full shrink-0"
          >
            <X className="h-4 w-4 text-primary" />
          </button>
        </div>
      </div>

      {/* Delivery Confirmation Dialog */}
      <AlertDialog open={!!confirmOrder} onOpenChange={() => setConfirmOrder(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                <Banknote className="h-5 w-5 text-success" />
              </div>
              <AlertDialogTitle>Confirmar Entrega</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pt-2">
              Ao marcar como <strong>Entregue</strong>, o sistema registrará automaticamente o pagamento restante de{' '}
              <strong>{formatCurrency((confirmOrder?.totalAmount || 0) / 2)}</strong> no financeiro.
              <br /><br />
              Deseja confirmar a entrega do pedido de <strong>{confirmOrder?.clientName}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelivery}
              className="bg-success text-success-foreground hover:bg-success/90"
            >
              Confirmar Entrega
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
