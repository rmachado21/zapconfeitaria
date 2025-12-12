import { Order as DBOrder } from '@/hooks/useOrders';
import { Order, OrderStatus, ORDER_STATUS_CONFIG } from '@/types';
import { OrderCard } from './OrderCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface OrdersListProps {
  orders: DBOrder[];
  onOrderClick?: (order: DBOrder) => void;
  onDepositChange?: (orderId: string, depositPaid: boolean, clientName?: string, totalAmount?: number, currentStatus?: OrderStatus) => void;
}

const STATUS_TABS: { value: 'all' | OrderStatus; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'quote', label: 'Orçamento' },
  { value: 'awaiting_deposit', label: 'Aguardando' },
  { value: 'in_production', label: 'Produção' },
  { value: 'ready', label: 'Pronto' },
  { value: 'delivered', label: 'Entregue' },
  { value: 'cancelled', label: 'Cancelado' },
];

export function OrdersList({ orders, onOrderClick, onDepositChange }: OrdersListProps) {
  const getFilteredOrders = (status: 'all' | OrderStatus) => {
    if (status === 'all') return orders;
    return orders.filter((order) => order.status === status);
  };

  const convertToOrderType = (dbOrder: DBOrder): Order => ({
    id: dbOrder.id,
    orderNumber: dbOrder.order_number ?? undefined,
    clientId: dbOrder.client_id || '',
    clientName: dbOrder.client?.name || 'Cliente não encontrado',
    clientPhone: dbOrder.client?.phone || '',
    items: (dbOrder.order_items || []).map(item => ({
      id: item.id,
      productId: item.product_id || '',
      productName: item.product_name,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      unitType: item.unit_type as 'kg' | 'unit' | 'cento',
      total: item.is_gift ? 0 : item.quantity * item.unit_price,
      isGift: item.is_gift,
    })),
    status: dbOrder.status as OrderStatus,
    deliveryDate: dbOrder.delivery_date || '',
    deliveryTime: dbOrder.delivery_time || undefined,
    deliveryAddress: dbOrder.delivery_address || undefined,
    deliveryFee: dbOrder.delivery_fee,
    totalAmount: dbOrder.total_amount,
    depositPaid: dbOrder.deposit_paid,
    depositAmount: dbOrder.total_amount / 2,
    notes: dbOrder.notes || undefined,
    createdAt: dbOrder.created_at,
  });

  return (
    <div className="md:hidden">
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full h-auto p-1 bg-muted/50 rounded-xl overflow-x-auto flex justify-start gap-1">
          {STATUS_TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className={cn(
                "flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-all",
                "data-[state=active]:bg-card data-[state=active]:border-2 data-[state=active]:border-primary",
                "data-[state=active]:text-primary data-[state=active]:shadow-soft"
              )}
            >
              {tab.label}
              <span className="ml-1.5 text-[10px] opacity-70">
                ({getFilteredOrders(tab.value).length})
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {STATUS_TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-4 space-y-3">
            {getFilteredOrders(tab.value).length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>Nenhum pedido encontrado</p>
              </div>
            ) : (
              getFilteredOrders(tab.value).map((order, index) => (
                <div
                  key={order.id}
                  className={cn("animate-slide-up", `stagger-${Math.min(index + 1, 5)}`)}
                  style={{ opacity: 0, animationFillMode: 'forwards' }}
                >
                  <OrderCard 
                    order={convertToOrderType(order)} 
                    onClick={() => onOrderClick?.(order)}
                    onDepositChange={(paid) => onDepositChange?.(order.id, paid, order.client?.name, order.total_amount, order.status)}
                  />
                </div>
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
