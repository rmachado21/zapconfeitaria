import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { KanbanBoard } from '@/components/orders/KanbanBoard';
import { OrdersList } from '@/components/orders/OrdersList';
import { OrderFormDialog } from '@/components/orders/OrderFormDialog';
import { OrderDetailDialog } from '@/components/orders/OrderDetailDialog';
import { Button } from '@/components/ui/button';
import { useOrders, OrderFormData, Order } from '@/hooks/useOrders';
import { OrderStatus } from '@/types';
import { Plus, Loader2 } from 'lucide-react';

const Orders = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { 
    orders, 
    isLoading, 
    createOrder, 
    updateOrderStatus, 
    updateDepositPaid 
  } = useOrders();

  const handleCreate = () => {
    setSelectedOrder(null);
    setFormOpen(true);
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setDetailOpen(true);
  };

  const handleSubmit = async (data: OrderFormData) => {
    await createOrder.mutateAsync(data);
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatus, clientName?: string, totalAmount?: number) => {
    updateOrderStatus.mutate({ id: orderId, status: newStatus, clientName, totalAmount });
  };

  const handleDepositChange = (orderId: string, depositPaid: boolean, clientName?: string, totalAmount?: number, currentStatus?: OrderStatus) => {
    updateDepositPaid.mutate({ id: orderId, depositPaid, clientName, totalAmount, currentStatus });
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
              Pedidos
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {orders.length} pedidos • Arraste para mudar o status
            </p>
          </div>
          <Button variant="warm" onClick={handleCreate}>
            <Plus className="h-5 w-5" />
            Novo Pedido
          </Button>
        </header>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Nenhum pedido cadastrado</p>
            <Button variant="link" className="mt-2" onClick={handleCreate}>
              Criar primeiro pedido
            </Button>
          </div>
        ) : (
          <>
            {/* Kanban for Desktop */}
            <KanbanBoard 
              orders={orders} 
              onOrderClick={handleOrderClick}
              onStatusChange={handleStatusChange}
              onDepositChange={handleDepositChange}
            />

            {/* List for Mobile */}
            <OrdersList 
              orders={orders} 
              onOrderClick={handleOrderClick}
              onDepositChange={handleDepositChange}
            />
          </>
        )}

        {/* Mobile FAB */}
        <Button
          variant="warm"
          size="icon-lg"
          className="fixed bottom-20 right-4 md:hidden shadow-warm rounded-full z-40"
          onClick={handleCreate}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Form Dialog */}
      <OrderFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
        isLoading={createOrder.isPending}
      />

      {/* Detail Dialog */}
      <OrderDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        order={selectedOrder}
      />
    </AppLayout>
  );
};

export default Orders;
