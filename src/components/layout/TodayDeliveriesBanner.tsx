import { useNavigate } from 'react-router-dom';
import { Truck, X, Check } from 'lucide-react';
import { useState } from 'react';
import { useOrders, Order } from '@/hooks/useOrders';
import { format } from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { DeliveryConfirmDialog } from '@/components/orders/DeliveryConfirmDialog';

export function TodayDeliveriesBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [confirmOrder, setConfirmOrder] = useState<{ id: string; clientName: string; totalAmount: number; depositAmount: number | null; fullPaymentReceived: boolean } | null>(null);
  const { orders, updateOrderStatus } = useOrders();
  const navigate = useNavigate();
  
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

  const handleMarkDelivered = (e: React.MouseEvent, order: Order) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmOrder({
      id: order.id,
      clientName: order.client?.name || 'Cliente',
      totalAmount: order.total_amount || 0,
      depositAmount: order.deposit_amount,
      fullPaymentReceived: order.full_payment_received ?? false,
    });
  };

  const confirmDelivery = (paymentMethod?: string, paymentFee?: number) => {
    if (confirmOrder) {
      updateOrderStatus.mutate({
        id: confirmOrder.id,
        status: 'delivered',
        clientName: confirmOrder.clientName,
        totalAmount: confirmOrder.totalAmount,
        fullPaymentReceived: confirmOrder.fullPaymentReceived,
        deliveryPaymentMethod: paymentMethod,
        deliveryPaymentFee: paymentFee,
        depositAmount: confirmOrder.depositAmount,
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
                    <div 
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => navigate('/orders', { state: { openOrderId: order.id } })}
                    >
                      <p className="text-sm font-medium truncate">
                        {order.client?.name || 'Cliente não informado'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.delivery_time ? `${formatTime(order.delivery_time)} - ` : ''}
                        {formatCurrency(order.total_amount || 0)}
                      </p>
                    </div>
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
                <button
                  onClick={() => navigate('/orders')}
                  className="w-full text-center text-xs text-primary hover:underline"
                >
                  Ver todos os pedidos
                </button>
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

      {/* Delivery Confirmation Dialog with Payment Method */}
      <DeliveryConfirmDialog
        open={!!confirmOrder}
        onOpenChange={() => setConfirmOrder(null)}
        clientName={confirmOrder?.clientName || ''}
        totalAmount={confirmOrder?.totalAmount || 0}
        depositAmount={confirmOrder?.depositAmount ?? null}
        fullPaymentReceived={confirmOrder?.fullPaymentReceived ?? false}
        onConfirm={confirmDelivery}
      />
    </>
  );
}
