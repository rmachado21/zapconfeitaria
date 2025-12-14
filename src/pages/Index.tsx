import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { StatsCardSkeleton } from "@/components/dashboard/StatsCardSkeleton";
import { PendingDepositsDialog } from "@/components/dashboard/PendingDepositsDialog";
import { ActiveOrdersDialog } from "@/components/dashboard/ActiveOrdersDialog";
import { GrossProfitDetailDialog } from "@/components/finances/GrossProfitDetailDialog";
import { KanbanBoard } from "@/components/orders/KanbanBoard";
import { OrdersList } from "@/components/orders/OrdersList";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOrders } from "@/hooks/useOrders";
import { useClients } from "@/hooks/useClients";
import { useProducts } from "@/hooks/useProducts";
import { useProfile } from "@/hooks/useProfile";
import { OrderStatus } from "@/types";
import { ShoppingBag, TrendingUp, Clock, Plus, Loader2, CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { subDays, subMonths, subYears, isAfter, parseISO, startOfWeek, startOfMonth, startOfYear } from "date-fns";
type PeriodFilter = "week" | "month" | "year" | "all";
const periodLabels: Record<PeriodFilter, string> = {
  week: "Esta Semana",
  month: "Este Mês",
  year: "Este Ano",
  all: "Todo Período",
};
const Index = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<PeriodFilter>("month");
  const [pendingDepositsOpen, setPendingDepositsOpen] = useState(false);
  const [activeOrdersOpen, setActiveOrdersOpen] = useState(false);
  const [grossProfitDialogOpen, setGrossProfitDialogOpen] = useState(false);
  const { orders, isLoading: ordersLoading, updateOrderStatus, updateDepositPaid } = useOrders();
  const { clients, isLoading: clientsLoading } = useClients();
  const { products, isLoading: productsLoading } = useProducts();
  const { profile, isLoading: profileLoading } = useProfile();
  const isLoading = ordersLoading || clientsLoading || productsLoading || profileLoading;

  // Extract first name from company name
  const firstName = profile?.company_name?.split(" ")[0] || "";

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Bom dia";
    if (hour >= 12 && hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  // Hidden Kanban columns from profile
  const hiddenColumns = (profile?.hidden_kanban_columns || []) as OrderStatus[];

  // Get cutoff date based on period filter
  const getCutoffDate = (p: PeriodFilter): Date | null => {
    const now = new Date();
    switch (p) {
      case "week":
        return subDays(now, 7);
      case "month":
        return subMonths(now, 1);
      case "year":
        return subYears(now, 1);
      case "all":
        return null;
    }
  };

  // Filter orders by period
  const filteredOrders = useMemo(() => {
    const cutoff = getCutoffDate(period);
    if (!cutoff) return orders;
    return orders.filter((o) => isAfter(parseISO(o.created_at), cutoff));
  }, [orders, period]);

  // Calculate stats from filtered data
  const activeOrders = filteredOrders.filter((o) => o.status !== "delivered" && o.status !== "cancelled");
  const pendingDepositOrders = filteredOrders.filter(
    (o) => !o.deposit_paid && o.status !== "delivered" && o.status !== "cancelled",
  );
  const pendingDeposits = pendingDepositOrders.reduce((sum, o) => sum + o.total_amount / 2, 0);
  const periodIncome = filteredOrders
    .filter((o) => o.status === "delivered")
    .reduce((sum, o) => sum + o.total_amount, 0);

  // Calculate gross profit data for delivered orders
  const { grossProfitTotals, deliveredOrdersForProfit } = useMemo(() => {
    const now = new Date();
    let startDate: Date | null = null;

    switch (period) {
      case "week":
        startDate = startOfWeek(now, { weekStartsOn: 0 });
        break;
      case "month":
        startDate = startOfMonth(now);
        break;
      case "year":
        startDate = startOfYear(now);
        break;
    }

    const deliveredOrders = orders.filter((order) => {
      if (order.status !== "delivered") return false;
      if (!startDate) return true;

      const orderDate = parseISO(order.updated_at);
      return isAfter(orderDate, startDate) || orderDate.getTime() === startDate.getTime();
    });

    const revenue = deliveredOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);

    const costs = deliveredOrders.reduce((orderSum, order) => {
      const itemsCost = (order.order_items || []).reduce((itemSum, item) => {
        if (item.is_gift) return itemSum;
        const product = products.find((p) => p.id === item.product_id);
        const costPrice = product?.cost_price || 0;
        return itemSum + costPrice * item.quantity;
      }, 0);
      return orderSum + itemsCost;
    }, 0);

    const profit = revenue - costs;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

    return {
      grossProfitTotals: { profit, margin, revenue, costs },
      deliveredOrdersForProfit: deliveredOrders,
    };
  }, [orders, products, period]);
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };
  const handleStatusChange = (orderId: string, newStatus: OrderStatus, clientName?: string, totalAmount?: number) => {
    updateOrderStatus.mutate({
      id: orderId,
      status: newStatus,
      clientName,
      totalAmount,
    });
  };
  const handleDepositChange = (
    orderId: string,
    depositPaid: boolean,
    clientName?: string,
    totalAmount?: number,
    currentStatus?: OrderStatus,
  ) => {
    updateDepositPaid.mutate({
      id: orderId,
      depositPaid,
      clientName,
      totalAmount,
      currentStatus,
    });
  };
  return (
    <AppLayout>
      <div className="px-5 py-4 md:px-8 md:py-6 space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between animate-fade-in">
          <div>
            <h2 className="text-2xl font-display font-bold text-foreground md:text-2xl">
              {getGreeting()}
              {firstName ? `, ${firstName}` : ""}! 👋
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              {new Date().toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
          </div>
          <Button
            variant="warm"
            size="lg"
            className="hidden md:flex animate-fade-in"
            onClick={() => navigate("/orders", { state: { openNewOrder: true } })}
          >
            <Plus className="h-5 w-5" />
            Novo Pedido
          </Button>
        </header>

        {/* Period Filter + Stats Grid */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <Select value={period} onValueChange={(v) => setPeriod(v as PeriodFilter)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(periodLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
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
                    title={`Faturamento <br />(${periodLabels[period]})`}
                    value={formatCurrency(periodIncome)}
                    subtitle={`${filteredOrders.filter((o) => o.status === "delivered").length} pedidos entregues`}
                    icon={TrendingUp}
                    variant="primary"
                    onClick={() => setGrossProfitDialogOpen(true)}
                  />
                </div>
                <div className="animate-fade-in stagger-2">
                  <StatsCard
                    title="Pedidos Ativos"
                    value={activeOrders.length}
                    subtitle="Em andamento"
                    icon={ShoppingBag}
                    onClick={() => setActiveOrdersOpen(true)}
                  />
                </div>
                <div className="animate-fade-in stagger-3">
                  <StatsCard
                    title="Sinais Pendentes"
                    value={formatCurrency(pendingDeposits)}
                    subtitle="Aguardando pagamento"
                    icon={Clock}
                    variant="warning"
                    onClick={() => setPendingDepositsOpen(true)}
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
          </div>
        </section>

        {/* Orders Section */}
        <section className="animate-fade-in stagger-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-display font-semibold">Seus Pedidos</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate("/orders")} className="text-primary">
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
              <Button variant="link" className="mt-2" onClick={() => navigate("/orders")}>
                Criar primeiro pedido
              </Button>
            </div>
          ) : (
            <>
              {/* Kanban for Desktop */}
              <KanbanBoard
                orders={orders}
                onOrderClick={(order) => navigate("/orders", { state: { openOrderId: order.id } })}
                onStatusChange={handleStatusChange}
                onDepositChange={handleDepositChange}
                hiddenColumns={hiddenColumns}
              />

              {/* List for Mobile */}
              <OrdersList
                orders={orders}
                onOrderClick={(order) => navigate("/orders", { state: { openOrderId: order.id } })}
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
          onClick={() =>
            navigate("/orders", {
              state: {
                openNewOrder: true,
              },
            })
          }
        >
          <Plus className="h-6 w-6" />
        </Button>

        {/* Pending Deposits Dialog */}
        <PendingDepositsDialog
          open={pendingDepositsOpen}
          onOpenChange={setPendingDepositsOpen}
          orders={pendingDepositOrders}
          onDepositPaid={handleDepositChange}
        />

        {/* Active Orders Dialog */}
        <ActiveOrdersDialog
          open={activeOrdersOpen}
          onOpenChange={setActiveOrdersOpen}
          orders={activeOrders}
          onOrderClick={(order) => {
            setActiveOrdersOpen(false);
            navigate("/orders", { state: { openOrderId: order.id } });
          }}
        />

        {/* Gross Profit Detail Dialog */}
        <GrossProfitDetailDialog
          open={grossProfitDialogOpen}
          onOpenChange={setGrossProfitDialogOpen}
          orders={deliveredOrdersForProfit}
          products={products}
          totals={grossProfitTotals}
        />
      </div>
    </AppLayout>
  );
};
export default Index;
