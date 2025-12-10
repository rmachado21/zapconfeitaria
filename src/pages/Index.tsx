import { AppLayout } from '@/components/layout/AppLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { StatsCardSkeleton } from '@/components/dashboard/StatsCardSkeleton';
import { KanbanBoard } from '@/components/orders/KanbanBoard';
import { OrdersList } from '@/components/orders/OrdersList';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useOrders } from '@/hooks/useOrders';
import { useClients } from '@/hooks/useClients';
import { useProducts } from '@/hooks/useProducts';
import { useProfile } from '@/hooks/useProfile';
import { OrderStatus } from '@/types';
import { ShoppingBag, TrendingUp, Clock, Plus, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  const { orders, isLoading: ordersLoading, updateOrderStatus, updateDepositPaid } = useOrders();
  const { clients, isLoading: clientsLoading } = useClients();
  const { products, isLoading: productsLoading } = useProducts();
  const { profile, isLoading: profileLoading } = useProfile();

  const isLoading = ordersLoading || clientsLoading || productsLoading || profileLoading;

  // Extract first name from company name
  const firstName = profile?.company_name?.split(' ')[0] || '';

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  // Calculate stats from real data
  const activeOrders = orders.filter(o => o.status !== 'delivered');
  const pendingDeposits = orders
    .filter(o => !o.deposit_paid && o.status !== 'delivered')
    .reduce((sum, o) => sum + (o.total_amount / 2), 0);
  
  const monthlyIncome = orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + o.total_amount, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatus, clientName?: string, totalAmount?: number) => {
    updateOrderStatus.mutate({ id: orderId, status: newStatus, clientName, totalAmount });
  };

  const handleDepositChange = (orderId: string, depositPaid: boolean, clientName?: string, totalAmount?: number, currentStatus?: OrderStatus) => {
    updateDepositPaid.mutate({ id: orderId, depositPaid, clientName, totalAmount, currentStatus });
  };

  return (
    <AppLayout>
      <div className="px-5 py-4 md:px-8 md:py-6 space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between animate-fade-in">
          <div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
              {getGreeting()}{firstName ? `, ${firstName}` : ''}! 👋
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              {new Date().toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </p>
          </div>
          <Button 
            variant="warm" 
            size="lg" 
            className="hidden md:flex animate-fade-in"
            onClick={() => navigate('/orders')}
          >
            <Plus className="h-5 w-5" />
            Novo Pedido
          </Button>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {isLoading ? (
            <>
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
            </>
          ) : (
            <>
              <div className="animate-fade-in stagger-1">
                <StatsCard
                  title="Faturamento do Mês"
                  value={formatCurrency(monthlyIncome)}
                  subtitle={`${orders.filter(o => o.status === 'delivered').length} pedidos entregues`}
                  icon={TrendingUp}
                  variant="primary"
                />
              </div>
              <div className="animate-fade-in stagger-2">
                <StatsCard
                  title="Pedidos Ativos"
                  value={activeOrders.length}
                  subtitle="Em andamento"
                  icon={ShoppingBag}
                />
              </div>
              <div className="animate-fade-in stagger-3">
                <StatsCard
                  title="Sinais Pendentes"
                  value={formatCurrency(pendingDeposits)}
                  subtitle="Aguardando pagamento"
                  icon={Clock}
                  variant="warning"
                />
              </div>
              <div className="animate-fade-in stagger-4">
                <StatsCard
                  title="Cadastros"
                  value={`${clients.length} / ${products.length}`}
                  subtitle="Clientes / Produtos"
                  icon={TrendingUp}
                />
              </div>
            </>
          )}
        </section>

        {/* Orders Section */}
        <section className="animate-fade-in stagger-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-display font-semibold">Seus Pedidos</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/orders')}
              className="text-primary"
            >
              Ver todos
            </Button>
          </div>

          {ordersLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Nenhum pedido cadastrado</p>
              <Button variant="link" className="mt-2" onClick={() => navigate('/orders')}>
                Criar primeiro pedido
              </Button>
            </div>
          ) : (
            <>
              {/* Kanban for Desktop */}
              <KanbanBoard 
                orders={orders} 
                onOrderClick={() => navigate('/orders')}
                onStatusChange={handleStatusChange}
                onDepositChange={handleDepositChange}
              />

              {/* List for Mobile */}
              <OrdersList 
                orders={orders} 
                onOrderClick={() => navigate('/orders')}
                onDepositChange={handleDepositChange}
              />
            </>
          )}
        </section>

        {/* Mobile FAB */}
        <Button
          variant="warm"
          size="icon-lg"
          className="fixed bottom-20 right-4 md:hidden shadow-warm rounded-full z-40"
          onClick={() => navigate('/orders', { state: { openNewOrder: true } })}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </AppLayout>
  );
};

export default Index;
