import { Link } from 'react-router-dom';
import { Truck, X, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useOrders } from '@/hooks/useOrders';
import { format } from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export function TodayDeliveriesBanner() {
  const [dismissed, setDismissed] = useState(false);
  const { orders } = useOrders();
  
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const todayOrders = orders?.filter(order => {
    if (!order.delivery_date) return false;
    const orderDate = format(new Date(order.delivery_date), 'yyyy-MM-dd');
    return orderDate === today && order.status !== 'delivered';
  }) || [];
  
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
  
  return (
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
                <Link
                  key={order.id}
                  to="/orders"
                  className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors border-b border-border last:border-b-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {order.client?.name || 'Cliente não informado'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.delivery_time ? `${formatTime(order.delivery_time)} - ` : ''}
                      {formatCurrency(order.total_amount || 0)}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </Link>
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
  );
}
