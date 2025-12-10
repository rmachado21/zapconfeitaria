import { Order, OrderStatus, ORDER_STATUS_CONFIG } from '@/types';
import { OrderCard } from './OrderCard';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface KanbanBoardProps {
  orders: Order[];
  onOrderClick?: (order: Order) => void;
}

const KANBAN_COLUMNS: OrderStatus[] = [
  'quote',
  'awaiting_deposit',
  'in_production',
  'ready',
  'delivered',
];

export function KanbanBoard({ orders, onOrderClick }: KanbanBoardProps) {
  const getOrdersByStatus = (status: OrderStatus) => {
    return orders.filter((order) => order.status === status);
  };

  return (
    <div className="hidden md:flex gap-4 h-[calc(100vh-200px)] overflow-x-auto pb-4 scrollbar-thin">
      {KANBAN_COLUMNS.map((status) => {
        const statusConfig = ORDER_STATUS_CONFIG[status];
        const columnOrders = getOrdersByStatus(status);

        return (
          <div
            key={status}
            className="flex-shrink-0 w-80 bg-muted/30 rounded-2xl border border-border"
          >
            {/* Column Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn("w-3 h-3 rounded-full", statusConfig.bgColor)} />
                  <h3 className="font-semibold text-sm">{statusConfig.label}</h3>
                </div>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {columnOrders.length}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {statusConfig.description}
              </p>
            </div>

            {/* Column Content */}
            <ScrollArea className="h-[calc(100%-80px)]">
              <div className="p-3 space-y-3">
                {columnOrders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    Nenhum pedido
                  </div>
                ) : (
                  columnOrders.map((order, index) => (
                    <div
                      key={order.id}
                      className={cn("animate-slide-up", `stagger-${Math.min(index + 1, 5)}`)}
                      style={{ opacity: 0, animationFillMode: 'forwards' }}
                    >
                      <OrderCard order={order} onClick={() => onOrderClick?.(order)} />
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        );
      })}
    </div>
  );
}
