import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Search, FileText, Trash2, Calculator, Loader2 } from 'lucide-react';
import { getQuotes, createQuote } from '@/services/quotes';
import { getClients } from '@/services/clients';
import { getProducts } from '@/services/products';
import { getCustomizations } from '@/services/customizations';
import { QuoteItem } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

const statusLabels: Record<string, string> = {
  rascunho: 'Rascunho',
  enviado: 'Enviado',
  aprovado: 'Aprovado',
  rejeitado: 'Rejeitado',
};

const statusColors: Record<string, string> = {
  rascunho: 'bg-muted text-muted-foreground',
  enviado: 'bg-primary/20 text-primary',
  aprovado: 'bg-green-100 text-green-700',
  rejeitado: 'bg-destructive/20 text-destructive',
};

const Orcamentos = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Data Fetching
  const { data: quotes = [], isLoading: isLoadingQuotes } = useQuery({
    queryKey: ['quotes'],
    queryFn: getQuotes,
  });

  const { data: clients = [], isLoading: isLoadingClients } = useQuery({
    queryKey: ['clients'],
    queryFn: getClients,
  });

  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  const { data: customizations = [], isLoading: isLoadingCustomizations } = useQuery({
    queryKey: ['customizations'],
    queryFn: getCustomizations,
  });

  // Form state for new quote
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [weight, setWeight] = useState('1');
  const [selectedCustomizations, setSelectedCustomizations] = useState<string[]>([]);
  const [deliveryType, setDeliveryType] = useState<'retirada' | 'delivery'>('retirada');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [items, setItems] = useState<QuoteItem[]>([]);

  const createQuoteMutation = useMutation({
    mutationFn: () => {
      const { subtotal, deliveryFee, total } = getTotalQuote();
      return createQuote({
        clientId: selectedClient,
        deliveryDate: new Date(deliveryDate),
        deliveryType,
        status: 'rascunho',
        items,
        total,
        subtotal,
        deliveryFee,
        orderDate: new Date(),
        paymentMethod: 'pending', // Default or add field if needed
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      setIsDialogOpen(false);
      resetForm();
      toast.success('Orçamento criado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao criar orçamento.');
    }
  });

  const resetForm = () => {
    setSelectedClient('');
    setSelectedProduct('');
    setQuantity('1');
    setWeight('1');
    setSelectedCustomizations([]);
    setDeliveryType('retirada');
    setDeliveryDate('');
    setItems([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createQuoteMutation.mutate();
  };

  const filteredQuotes = quotes.filter(quote =>
    quote.client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.id.includes(searchTerm)
  );

  const calculateItemPrice = () => {
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return 0;

    const qty = parseFloat(quantity) || 1;
    const wgt = parseFloat(weight) || 1;

    let baseTotal = product.unit === 'kg'
      ? product.basePrice * wgt
      : product.basePrice * qty;

    let customizationTotal = 0;
    selectedCustomizations.forEach(custId => {
      const cust = customizations.find(c => c.id === custId);
      if (cust) {
        if (cust.priceType === 'fixed') {
          customizationTotal += cust.price;
        } else if (cust.priceType === 'per_kg') {
          customizationTotal += cust.price * wgt;
        } else {
          customizationTotal += cust.price * qty;
        }
      }
    });

    return baseTotal + customizationTotal;
  };

  const addItem = () => {
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    const qty = parseFloat(quantity) || 1;
    const wgt = parseFloat(weight) || 1;
    const total = calculateItemPrice();

    const newItem: QuoteItem = {
      id: Date.now().toString(),
      productId: selectedProduct,
      product,
      quantity: qty,
      weight: product.unit === 'kg' ? wgt : undefined,
      customizations: selectedCustomizations,
      unitPrice: product.basePrice * (product.unit === 'kg' ? wgt : qty),
      customizationPrice: total - (product.basePrice * (product.unit === 'kg' ? wgt : qty)),
      totalPrice: total,
    };

    setItems([...items, newItem]);
    setSelectedProduct('');
    setQuantity('1');
    setWeight('1');
    setSelectedCustomizations([]);
  };

  const removeItem = (itemId: string) => {
    setItems(items.filter(i => i.id !== itemId));
  };

  const getTotalQuote = () => {
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const deliveryFee = deliveryType === 'delivery' ? 15 : 0;
    return { subtotal, deliveryFee, total: subtotal + deliveryFee };
  };

  if (isLoadingQuotes || isLoadingClients || isLoadingProducts || isLoadingCustomizations) {
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Orçamentos</h1>
            <p className="text-muted-foreground mt-1">
              Crie e gerencie orçamentos e encomendas
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Orçamento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Orçamento</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                {/* Client Selection */}
                <div className="space-y-2">
                  <Label>Cliente *</Label>
                  <Select value={selectedClient} onValueChange={setSelectedClient} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Delivery Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data de Entrega *</Label>
                    <Input
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo de Entrega *</Label>
                    <Select value={deliveryType} onValueChange={(v) => setDeliveryType(v as 'retirada' | 'delivery')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="retirada">Retirada</SelectItem>
                        <SelectItem value="delivery">Delivery (+R$ 15)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Add Item Section */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Adicionar Item</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Produto</Label>
                      <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um produto" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.filter(p => p.isActive).map(product => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} - R$ {product.basePrice.toFixed(2)}/{product.unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedProduct && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          {products.find(p => p.id === selectedProduct)?.unit === 'kg' ? (
                            <div className="space-y-2">
                              <Label>Peso (kg)</Label>
                              <Input
                                type="number"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                min="0.5"
                                step="0.5"
                              />
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Label>Quantidade</Label>
                              <Input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                min="1"
                              />
                            </div>
                          )}
                          <div className="flex items-end">
                            <div className="flex items-center gap-2 text-lg font-semibold text-primary">
                              <Calculator className="h-5 w-5" />
                              R$ {calculateItemPrice().toFixed(2)}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Personalizações</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {customizations.map(cust => (
                              <div key={cust.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={cust.id}
                                  checked={selectedCustomizations.includes(cust.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedCustomizations([...selectedCustomizations, cust.id]);
                                    } else {
                                      setSelectedCustomizations(selectedCustomizations.filter(id => id !== cust.id));
                                    }
                                  }}
                                />
                                <label htmlFor={cust.id} className="text-sm">
                                  {cust.name} (+R$ {cust.price.toFixed(2)})
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <Button type="button" onClick={addItem} className="w-full">
                          Adicionar ao Orçamento
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Items List */}
                {items.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Itens do Orçamento</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {items.map(item => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div>
                              <p className="font-medium">{item.product?.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.weight ? `${item.weight}kg` : `${item.quantity}un`}
                                {item.customizations.length > 0 && (
                                  <> • {item.customizations.length} personalização(ões)</>
                                )}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-semibold">R$ {item.totalPrice.toFixed(2)}</span>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => removeItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 pt-4 border-t border-border space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Subtotal</span>
                          <span>R$ {getTotalQuote().subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Taxa de Entrega</span>
                          <span>R$ {getTotalQuote().deliveryFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-lg">
                          <span>Total</span>
                          <span className="text-primary">R$ {getTotalQuote().total.toFixed(2)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={items.length === 0 || !selectedClient || createQuoteMutation.isPending}>
                    {createQuoteMutation.isPending ? 'Salvando...' : 'Salvar Orçamento'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente ou número..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Quotes List */}
        <div className="space-y-4">
          {filteredQuotes.map(quote => (
            <Card key={quote.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">
                          Orçamento #{quote.id.slice(0, 8)}
                        </h3>
                        <Badge className={statusColors[quote.status]}>
                          {statusLabels[quote.status]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {quote.client?.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Entrega: {format(new Date(quote.deliveryDate), "dd 'de' MMMM", { locale: ptBR })} •{' '}
                        {quote.deliveryType === 'delivery' ? 'Delivery' : 'Retirada'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{quote.items.length} item(s)</p>
                      <p className="text-xl font-bold text-primary">
                        R$ {quote.total.toFixed(2)}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredQuotes.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground">Nenhum orçamento encontrado</h3>
            <p className="text-muted-foreground">
              Crie um novo orçamento para começar.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Orcamentos;
