import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getOrders } from '@/services/orders';
import { getQuotes } from '@/services/quotes';
import { getClients } from '@/services/clients';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';

export function RecentOrders() {
  const { data: orders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
  });

  const { data: quotes = [] } = useQuery({
    queryKey: ['quotes'],
    queryFn: getQuotes,
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: getClients,
  });

  const recentOrders = orders
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map(order => {
      const quote = quotes.find(q => q.id === order.quoteId);
      const client = clients.find(c => c.id === quote?.clientId);
      return { ...order, quote, client };
    });

  if (isLoadingOrders) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Pedidos Recentes</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Pedidos Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum pedido recente
            </p>
          ) : (
            recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="space-y-1">
                  <p className="font-medium text-foreground">
                    {order.client?.name || 'Cliente não encontrado'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Entrega: {order.quote?.deliveryDate
                      ? format(new Date(order.quote.deliveryDate), "dd 'de' MMM", { locale: ptBR })
                      : 'N/A'
                    }
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <Badge className={ORDER_STATUS_COLORS[order.status]}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </Badge>
                  <p className="text-sm font-medium text-foreground">
                    R$ {order.quote?.total?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
