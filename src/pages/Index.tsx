import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RecentOrders } from '@/components/dashboard/RecentOrders';
import { UpcomingDeliveries } from '@/components/dashboard/UpcomingDeliveries';
import { Cake, Users, FileText, ClipboardList, TrendingUp, DollarSign, Loader2 } from 'lucide-react';
import { getProducts } from '@/services/products';
import { getClients } from '@/services/clients';
import { getQuotes } from '@/services/quotes';
import { getOrders } from '@/services/orders';

const Dashboard = () => {
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  const { data: clients = [], isLoading: isLoadingClients } = useQuery({
    queryKey: ['clients'],
    queryFn: getClients,
  });

  const { data: quotes = [], isLoading: isLoadingQuotes } = useQuery({
    queryKey: ['quotes'],
    queryFn: getQuotes,
  });

  const { data: orders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
  });

  const activeProducts = products.filter(p => p.isActive).length;
  const totalClients = clients.length;
  const pendingQuotes = quotes.filter(q => q.status === 'enviado').length;
  const activeOrders = orders.filter(o => !['entregue', 'cancelado'].includes(o.status)).length;
  const monthlyRevenue = quotes
    .filter(q => q.status === 'aprovado')
    .reduce((sum, q) => sum + q.total, 0);

  if (isLoadingProducts || isLoadingClients || isLoadingQuotes || isLoadingOrders) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[calc(100vh-100px)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Bem-vinda à Jenny Doces! Aqui está o resumo do seu negócio.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Produtos Ativos"
            value={activeProducts}
            description={`${products.length} produtos cadastrados`}
            icon={Cake}
          />
          <StatsCard
            title="Clientes"
            value={totalClients}
            icon={Users}
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="Orçamentos Pendentes"
            value={pendingQuotes}
            description="Aguardando aprovação"
            icon={FileText}
          />
          <StatsCard
            title="Pedidos em Andamento"
            value={activeOrders}
            description="Em produção ou entrega"
            icon={ClipboardList}
          />
        </div>

        {/* Revenue Card */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatsCard
            title="Faturamento do Mês"
            value={`R$ ${monthlyRevenue.toFixed(2)}`}
            icon={DollarSign}
            trend={{ value: 8, isPositive: true }}
            className="md:col-span-1"
          />
          <div className="md:col-span-2">
            <div className="rounded-xl bg-gradient-to-r from-primary to-accent p-6 text-primary-foreground">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-6 w-6" />
                <h3 className="font-semibold text-lg">Dica do Dia</h3>
              </div>
              <p className="text-sm opacity-90">
                Não se esqueça de confirmar os pedidos com antecedência mínima de 48h.
                Isso garante tempo suficiente para produção e evita imprevistos!
              </p>
            </div>
          </div>
        </div>

        {/* Orders and Deliveries */}
        <div className="grid gap-6 lg:grid-cols-2">
          <RecentOrders />
          <UpcomingDeliveries />
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
