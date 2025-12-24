import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, ClipboardList, ChevronRight, Truck, Package, CheckCircle, Loader2 } from 'lucide-react';
import { getOrders, updateOrderStatus } from '@/services/orders';
import { OrderStatus, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

const statusFlow: OrderStatus[] = [
  'recebido',
  'confirmado',
  'em_producao',
  'pronto',
  'saiu_entrega',
  'entregue',
];

const Pedidos = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Status do pedido atualizado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao atualizar status do pedido.');
    }
  });

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.quote?.client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const currentIndex = statusFlow.indexOf(currentStatus);
    if (currentIndex === -1 || currentIndex === statusFlow.length - 1) return null;
    return statusFlow[currentIndex + 1];
  };

  const advanceStatus = (orderId: string, currentStatus: OrderStatus) => {
    const nextStatus = getNextStatus(currentStatus);
    if (nextStatus) {
      updateStatusMutation.mutate({ id: orderId, status: nextStatus });
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pronto':
        return <Package className="h-5 w-5" />;
      case 'saiu_entrega':
        return <Truck className="h-5 w-5" />;
      case 'entregue':
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <ClipboardList className="h-5 w-5" />;
    }
  };

  if (isLoading) {
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
          <h1 className="text-3xl font-bold text-foreground">Pedidos</h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe o status de produção e entrega
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente ou número..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              {statusFlow.map(status => (
                <SelectItem key={status} value={status}>
                  {ORDER_STATUS_LABELS[status]}
                </SelectItem>
              ))}
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {statusFlow.slice(0, 6).map(status => {
            const count = orders.filter(o => o.status === status).length;
            return (
              <Card
                key={status}
                className={`cursor-pointer transition-all ${statusFilter === status ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
              >
                <CardContent className="p-3 text-center">
                  <p className="text-2xl font-bold text-foreground">{count}</p>
                  <p className="text-xs text-muted-foreground">{ORDER_STATUS_LABELS[status]}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map(order => {
            const nextStatus = getNextStatus(order.status);
            return (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0 ${ORDER_STATUS_COLORS[order.status]}`}>
                        {getStatusIcon(order.status)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">
                            Pedido #{order.id.slice(0, 8)}
                          </h3>
                          <Badge className={ORDER_STATUS_COLORS[order.status]}>
                            {ORDER_STATUS_LABELS[order.status]}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-foreground">
                          {order.quote?.client?.name}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {order.quote?.items.slice(0, 2).map((item, idx) => (
                            <span key={idx} className="text-xs bg-muted px-2 py-1 rounded">
                              {item.product?.name}
                            </span>
                          ))}
                          {order.quote?.items && order.quote.items.length > 2 && (
                            <span className="text-xs bg-muted px-2 py-1 rounded">
                              +{order.quote.items.length - 2} mais
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="text-sm">
                        <p className="text-muted-foreground">Entrega</p>
                        <p className="font-medium text-foreground">
                          {order.quote?.deliveryDate
                            ? format(new Date(order.quote.deliveryDate), "dd/MM/yyyy", { locale: ptBR })
                            : 'N/A'
                          }
                        </p>
                      </div>
                      <div className="text-sm">
                        <p className="text-muted-foreground">Total</p>
                        <p className="font-semibold text-primary">
                          R$ {order.quote?.total.toFixed(2)}
                        </p>
                      </div>
                      {nextStatus && order.status !== 'cancelado' && (
                        <Button
                          onClick={() => advanceStatus(order.id, order.status)}
                          className="gap-2"
                          disabled={updateStatusMutation.isPending}
                        >
                          {ORDER_STATUS_LABELS[nextStatus]}
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Status Timeline */}
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                      {order.statusHistory.map((history, idx) => (
                        <div key={idx} className="flex items-center flex-shrink-0">
                          <div className="text-center">
                            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-1">
                              <CheckCircle className="h-4 w-4 text-primary" />
                            </div>
                            <p className="text-xs font-medium">{ORDER_STATUS_LABELS[history.status]}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(history.timestamp), "dd/MM HH:mm")}
                            </p>
                          </div>
                          {idx < order.statusHistory.length - 1 && (
                            <div className="w-8 h-0.5 bg-primary/30 mx-2" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground">Nenhum pedido encontrado</h3>
            <p className="text-muted-foreground">
              Quando um orçamento for aprovado, ele aparecerá aqui.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Pedidos;
