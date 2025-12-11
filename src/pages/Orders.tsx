import { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { KanbanBoard } from '@/components/orders/KanbanBoard';
import { KanbanColumnSettings } from '@/components/orders/KanbanColumnSettings';
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
import { useProfile } from '@/hooks/useProfile';
import { OrderStatus } from '@/types';
import { Plus, Loader2, Search, ArrowUpDown } from 'lucide-react';

const Orders = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'none'>('asc');

  const { 
    orders, 
    isLoading, 
    createOrder, 
    updateOrder,
    updateOrderStatus, 
    updateDepositPaid,
    deleteOrder,
  } = useOrders();

  // Open form or detail dialog automatically based on navigation state
  useEffect(() => {
    if (location.state?.openNewOrder) {
      setFormOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
    
    // Open order detail if navigated from dashboard
    if (location.state?.openOrderId && orders.length > 0) {
      const order = orders.find(o => o.id === location.state.openOrderId);
      if (order) {
        setSelectedOrder(order);
        setDetailOpen(true);
      }
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname, orders]);

  const { profile, updateProfile } = useProfile();

  const hiddenColumns = (profile?.hidden_kanban_columns || []) as OrderStatus[];

  const handleHiddenColumnsChange = (columns: OrderStatus[]) => {
    updateProfile.mutate({ hidden_kanban_columns: columns });
  };

  const [editOrder, setEditOrder] = useState<Order | null>(null);

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    let result = orders;

    // Filter by client name or order number
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(order => {
        // Match by client name
        const matchesClient = order.client?.name?.toLowerCase().includes(query);
        // Match by order number (with or without #)
        const queryNumber = query.replace('#', '');
        const matchesOrderNumber = order.order_number?.toString().includes(queryNumber);
        return matchesClient || matchesOrderNumber;
      });
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
    setEditOrder(null);
    setFormOpen(true);
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setDetailOpen(true);
  };

  const handleSubmit = async (data: OrderFormData) => {
    if (editOrder) {
      await updateOrder.mutateAsync({ id: editOrder.id, formData: data });
    } else {
      await createOrder.mutateAsync(data);
    }
    setEditOrder(null);
  };

  const handleEdit = (order: Order) => {
    setEditOrder(order);
    setFormOpen(true);
  };

  const handleDelete = (orderId: string) => {
    deleteOrder.mutate(orderId);
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatus, clientName?: string, totalAmount?: number, previousStatus?: OrderStatus) => {
    updateOrderStatus.mutate({ id: orderId, status: newStatus, clientName, totalAmount, previousStatus });
  };

  const handleDepositChange = (orderId: string, depositPaid: boolean, clientName?: string, totalAmount?: number, currentStatus?: OrderStatus) => {
    updateDepositPaid.mutate({ id: orderId, depositPaid, clientName, totalAmount, currentStatus });
  };

  return (
    <AppLayout>
      <div className="px-5 py-4 md:px-8 md:py-6 space-y-6">
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

          {/* Kanban Column Settings - Desktop only */}
          <div className="hidden md:block">
            <KanbanColumnSettings
              hiddenColumns={hiddenColumns}
              onHiddenColumnsChange={handleHiddenColumnsChange}
              isLoading={updateProfile.isPending}
            />
          </div>
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
              hiddenColumns={hiddenColumns}
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
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditOrder(null);
        }}
        onSubmit={handleSubmit}
        isLoading={createOrder.isPending || updateOrder.isPending}
        editOrder={editOrder}
      />

      {/* Detail Dialog */}
      <OrderDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        order={selectedOrder}
        onStatusChange={handleStatusChange}
        onDepositChange={handleDepositChange}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </AppLayout>
  );
};

export default Orders;
