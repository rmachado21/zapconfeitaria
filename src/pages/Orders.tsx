import { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { KanbanBoard } from '@/components/orders/KanbanBoard';
import { OrdersList } from '@/components/orders/OrdersList';
import { OrderFormDialog } from '@/components/orders/OrderFormDialog';
import { OrderDetailDialog } from '@/components/orders/OrderDetailDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useOrders, OrderFormData, Order } from '@/hooks/useOrders';
import { OrderStatus } from '@/types';
import { Plus, Loader2, Search, ArrowUpDown } from 'lucide-react';

const Orders = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [formOpen, setFormOpen] = useState(false);

  // Open form automatically if navigated with openNewOrder state
  useEffect(() => {
    if (location.state?.openNewOrder) {
      setFormOpen(true);
      // Clear the state to prevent reopening on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'none'>('asc');

  const { 
    orders, 
    isLoading, 
    createOrder, 
    updateOrderStatus, 
    updateDepositPaid 
  } = useOrders();

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    let result = orders;

    // Filter by client name
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(order => 
        order.client?.name?.toLowerCase().includes(query)
      );
    }

    // Sort by delivery date
    if (sortOrder !== 'none') {
      result = [...result].sort((a, b) => {
        const dateA = a.delivery_date ? new Date(a.delivery_date).getTime() : 0;
        const dateB = b.delivery_date ? new Date(b.delivery_date).getTime() : 0;
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
    }

    return result;
  }, [orders, searchQuery, sortOrder]);

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
              {filteredOrders.length} pedidos {searchQuery && `encontrados`}
            </p>
          </div>
          <Button variant="warm" onClick={handleCreate} className="hidden md:flex">
            <Plus className="h-5 w-5" />
            Novo Pedido
          </Button>
        </header>

        {/* Search and Sort Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as 'asc' | 'desc' | 'none')}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Data: mais próxima</SelectItem>
              <SelectItem value="desc">Data: mais distante</SelectItem>
              <SelectItem value="none">Sem ordenação</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>{searchQuery ? 'Nenhum pedido encontrado' : 'Nenhum pedido cadastrado'}</p>
            {!searchQuery && (
              <Button variant="link" className="mt-2" onClick={handleCreate}>
                Criar primeiro pedido
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Kanban for Desktop */}
            <KanbanBoard 
              orders={filteredOrders} 
              onOrderClick={handleOrderClick}
              onStatusChange={handleStatusChange}
              onDepositChange={handleDepositChange}
            />

            {/* List for Mobile */}
            <OrdersList 
              orders={filteredOrders} 
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
        onStatusChange={handleStatusChange}
      />
    </AppLayout>
  );
};

export default Orders;
