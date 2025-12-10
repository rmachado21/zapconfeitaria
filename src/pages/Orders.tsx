import { AppLayout } from '@/components/layout/AppLayout';
import { KanbanBoard } from '@/components/orders/KanbanBoard';
import { OrdersList } from '@/components/orders/OrdersList';
import { Button } from '@/components/ui/button';
import { mockOrders } from '@/data/mockData';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Orders = () => {
  const navigate = useNavigate();

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
              Gerencie todos os seus pedidos e orçamentos
            </p>
          </div>
          <Button variant="warm" onClick={() => navigate('/orders/new')}>
            <Plus className="h-5 w-5" />
            Novo Pedido
          </Button>
        </header>

        {/* Kanban for Desktop */}
        <KanbanBoard 
          orders={mockOrders} 
          onOrderClick={(order) => navigate(`/orders/${order.id}`)} 
        />

        {/* List for Mobile */}
        <OrdersList 
          orders={mockOrders} 
          onOrderClick={(order) => navigate(`/orders/${order.id}`)} 
        />

        {/* Mobile FAB */}
        <Button
          variant="warm"
          size="icon-lg"
          className="fixed bottom-20 right-4 md:hidden shadow-warm rounded-full z-40"
          onClick={() => navigate('/orders/new')}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </AppLayout>
  );
};

export default Orders;
