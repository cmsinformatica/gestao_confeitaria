import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, Clock, Loader2 } from 'lucide-react';
import { getQuotes } from '@/services/quotes';
import { getClients } from '@/services/clients';
import { format, isAfter, startOfToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function UpcomingDeliveries() {
  const { data: quotes = [], isLoading: isLoadingQuotes } = useQuery({
    queryKey: ['quotes'],
    queryFn: getQuotes,
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: getClients,
  });

  const today = startOfToday();
  const upcomingQuotes = quotes
    .filter(q => q.status === 'aprovado' && isAfter(new Date(q.deliveryDate), today))
    .sort((a, b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime())
    .slice(0, 5)
    .map(quote => {
      const client = clients.find(c => c.id === quote.clientId);
      return { ...quote, client };
    });

  if (isLoadingQuotes) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Próximas Entregas</CardTitle>
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
        <CardTitle className="text-lg font-semibold">Próximas Entregas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingQuotes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma entrega programada
            </p>
          ) : (
            upcomingQuotes.map((quote) => (
              <div
                key={quote.id}
                className="p-3 rounded-lg border border-border bg-card"
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="font-medium text-foreground">
                    {quote.client?.name}
                  </p>
                  <span className="text-sm font-semibold text-primary">
                    R$ {quote.total.toFixed(2)}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(new Date(quote.deliveryDate), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {quote.deliveryType === 'delivery' ? (
                      <>
                        <MapPin className="h-4 w-4" />
                        <span>{quote.deliveryAddress || 'Endereço não informado'}</span>
                      </>
                    ) : (
                      <>
                        <Clock className="h-4 w-4" />
                        <span>Retirada no local</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
