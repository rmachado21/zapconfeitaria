import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Order as OrderType, OrderStatus, ORDER_STATUS_CONFIG } from '@/types';
import { Order as DBOrder } from '@/hooks/useOrders';
import { OrderCard } from './OrderCard';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface KanbanBoardProps {
  orders: DBOrder[];
  onOrderClick?: (order: DBOrder) => void;
  onStatusChange?: (orderId: string, newStatus: OrderStatus, clientName?: string, totalAmount?: number) => void;
  onDepositChange?: (orderId: string, depositPaid: boolean, clientName?: string, totalAmount?: number) => void;
}

const KANBAN_COLUMNS: OrderStatus[] = [
  'quote',
  'awaiting_deposit',
  'in_production',
  'ready',
  'delivered',
];

export function KanbanBoard({ orders, onOrderClick, onStatusChange, onDepositChange }: KanbanBoardProps) {
  const getOrdersByStatus = (status: OrderStatus) => {
    return orders.filter((order) => order.status === status);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !onStatusChange) return;

    const sourceStatus = result.source.droppableId as OrderStatus;
    const destStatus = result.destination.droppableId as OrderStatus;

    if (sourceStatus === destStatus) return;

    const orderId = result.draggableId;
    const order = orders.find(o => o.id === orderId);
    onStatusChange(orderId, destStatus, order?.client?.name, order?.total_amount);
  };

  const convertToOrderType = (dbOrder: DBOrder): OrderType => ({
    id: dbOrder.id,
    clientId: dbOrder.client_id || '',
    clientName: dbOrder.client?.name || 'Cliente não encontrado',
    clientPhone: dbOrder.client?.phone || '',
    items: (dbOrder.order_items || []).map(item => ({
      id: item.id,
      productId: item.product_id || '',
      productName: item.product_name,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      total: item.quantity * item.unit_price,
    })),
    status: dbOrder.status as OrderStatus,
    deliveryDate: dbOrder.delivery_date || '',
    deliveryAddress: dbOrder.delivery_address || undefined,
    deliveryFee: dbOrder.delivery_fee,
    totalAmount: dbOrder.total_amount,
    depositPaid: dbOrder.deposit_paid,
    depositAmount: dbOrder.total_amount / 2,
    notes: dbOrder.notes || undefined,
    createdAt: dbOrder.created_at,
  });

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="hidden md:flex gap-4 h-[calc(100vh-200px)] overflow-x-auto pb-4 scrollbar-thin">
        {KANBAN_COLUMNS.map((status) => {
          const statusConfig = ORDER_STATUS_CONFIG[status];
          const columnOrders = getOrdersByStatus(status);

          return (
            <Droppable key={status} droppableId={status}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    "flex-shrink-0 w-80 bg-muted/30 rounded-2xl border border-border transition-colors",
                    snapshot.isDraggingOver && "border-primary/50 bg-primary/5"
                  )}
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
                    <div className="p-3 space-y-3 min-h-[100px]">
                      {columnOrders.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                          Arraste pedidos aqui
                        </div>
                      ) : (
                        columnOrders.map((order, index) => (
                          <Draggable key={order.id} draggableId={order.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={cn(
                                  "transition-transform",
                                  snapshot.isDragging && "rotate-2 scale-105"
                                )}
                              >
                                <OrderCard 
                                  order={convertToOrderType(order)} 
                                  onClick={() => onOrderClick?.(order)}
                                  onDepositChange={(paid) => onDepositChange?.(order.id, paid, order.client?.name, order.total_amount)}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </DragDropContext>
  );
}
