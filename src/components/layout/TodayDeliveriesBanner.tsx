import { Link } from 'react-router-dom';
import { Truck, X } from 'lucide-react';
import { useState } from 'react';
import { useOrders } from '@/hooks/useOrders';
import { format } from 'date-fns';

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
  
  return (
    <div className="bg-primary/10 border-b border-primary/20">
      <div className="px-4 py-2 flex items-center justify-between gap-2">
        <Link 
          to="/orders" 
          className="flex items-center gap-2 flex-1 min-w-0"
        >
          <Truck className="h-4 w-4 text-primary shrink-0" />
          <span className="text-sm font-medium text-primary truncate">
            {todayOrders.length === 1 
              ? '1 pedido para entregar hoje!' 
              : `${todayOrders.length} pedidos para entregar hoje!`}
          </span>
        </Link>
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
