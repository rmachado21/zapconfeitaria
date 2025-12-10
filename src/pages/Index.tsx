import { AppLayout } from '@/components/layout/AppLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { KanbanBoard } from '@/components/orders/KanbanBoard';
import { OrdersList } from '@/components/orders/OrdersList';
import { Button } from '@/components/ui/button';
import { mockOrders, mockTransactions } from '@/data/mockData';
import { ShoppingBag, TrendingUp, Clock, Plus, CakeSlice } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  // Calculate stats
  const activeOrders = mockOrders.filter(o => o.status !== 'delivered').length;
  const monthlyIncome = mockTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);
  const monthlyExpenses = mockTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);
  const pendingDeposits = mockOrders
    .filter(o => !o.depositPaid && o.status !== 'delivered')
    .reduce((acc, o) => acc + o.depositAmount, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1 md:hidden">
              <div className="w-8 h-8 rounded-lg gradient-warm flex items-center justify-center shadow-warm">
                <CakeSlice className="h-4 w-4 text-primary-foreground" />
              </div>
              <h1 className="font-display font-semibold text-lg">Confeitaria Pro</h1>
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
              Olá! 👋
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
            className="hidden md:flex"
            onClick={() => navigate('/orders/new')}
          >
            <Plus className="h-5 w-5" />
            Novo Pedido
          </Button>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <StatsCard
            title="Faturamento do Mês"
            value={formatCurrency(monthlyIncome)}
            subtitle={`Lucro: ${formatCurrency(monthlyIncome - monthlyExpenses)}`}
            icon={TrendingUp}
            variant="primary"
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="Pedidos Ativos"
            value={activeOrders}
            subtitle="Em andamento"
            icon={ShoppingBag}
          />
          <StatsCard
            title="Sinais Pendentes"
            value={formatCurrency(pendingDeposits)}
            subtitle="Aguardando pagamento"
            icon={Clock}
            variant="warning"
          />
          <StatsCard
            title="Despesas do Mês"
            value={formatCurrency(monthlyExpenses)}
            subtitle="Custos operacionais"
            icon={TrendingUp}
          />
        </section>

        {/* Orders Section */}
        <section>
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
        </section>

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

export default Index;
