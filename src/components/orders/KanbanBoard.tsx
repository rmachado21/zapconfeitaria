import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Order as OrderType, OrderStatus, ORDER_STATUS_CONFIG } from '@/types';
import { Order as DBOrder } from '@/hooks/useOrders';
import { OrderCard } from './OrderCard';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface KanbanBoardProps {
  orders: DBOrder[];
  onOrderClick?: (order: DBOrder) => void;
  onStatusChange?: (orderId: string, newStatus: OrderStatus, clientName?: string, totalAmount?: number, previousStatus?: OrderStatus) => void;
  onDepositChange?: (orderId: string, depositPaid: boolean, clientName?: string, totalAmount?: number, currentStatus?: OrderStatus) => void;
}

const KANBAN_COLUMNS: OrderStatus[] = [
  'quote',
  'awaiting_deposit',
  'in_production',
  'ready',
  'delivered',
  'cancelled',
];

export function KanbanBoard({ orders, onOrderClick, onStatusChange, onDepositChange }: KanbanBoardProps) {
  const getOrdersByStatus = (status: OrderStatus) => {
    return orders.filter((order) => order.status === status);
  };

  const getColumnTotal = (status: OrderStatus) => {
    return getOrdersByStatus(status).reduce((sum, order) => sum + (order.total_amount || 0), 0);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !onStatusChange) return;

    const sourceStatus = result.source.droppableId as OrderStatus;
    const destStatus = result.destination.droppableId as OrderStatus;

    if (sourceStatus === destStatus) return;

    const orderId = result.draggableId;
    const order = orders.find(o => o.id === orderId);
    onStatusChange(orderId, destStatus, order?.client?.name, order?.total_amount, sourceStatus);
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
      unitType: item.unit_type as 'kg' | 'unit' | 'cento',
      total: item.is_gift ? 0 : item.quantity * item.unit_price,
      isGift: item.is_gift,
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
                    "flex-shrink-0 w-80 rounded-2xl border transition-all duration-200",
                    statusConfig.columnBg,
                    statusConfig.columnBorder,
                    snapshot.isDraggingOver && "ring-2 ring-primary/50 border-primary/50"
                  )}
                >
                  {/* Column Header */}
                  <div className={cn("p-4 rounded-t-2xl", statusConfig.headerBg)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-3 h-3 rounded-full", statusConfig.dotColor)} />
                        <h3 className="font-semibold text-sm">{statusConfig.label}</h3>
                      </div>
                      <span className={cn(
                        "text-xs font-medium px-2.5 py-1 rounded-full",
                        statusConfig.bgColor,
                        statusConfig.color
                      )}>
                        {columnOrders.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <p className="text-xs text-muted-foreground">
                        {statusConfig.description}
                      </p>
                      <p className="text-xs font-semibold text-primary">
                        {formatCurrency(getColumnTotal(status))}
                      </p>
                    </div>
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
                                  onDepositChange={(paid) => onDepositChange?.(order.id, paid, order.client?.name, order.total_amount, order.status)}
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
