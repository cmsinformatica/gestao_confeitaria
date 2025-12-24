import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Badge } from '@/components/ui/badge';
import { Cake, Store, Palette, Clock, Truck, Trash2, Plus, Loader2 } from 'lucide-react';
import { getCategories, createCategory, deleteCategory } from '@/services/categories';
import { getCustomizations, createCustomization, deleteCustomization } from '@/services/customizations';
import { toast } from 'sonner';

const Configuracoes = () => {
  const [deliveryFee, setDeliveryFee] = useState('15');
  const [minOrderHours, setMinOrderHours] = useState('48');
  const queryClient = useQueryClient();

  // Dialog states
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isCustomizationDialogOpen, setIsCustomizationDialogOpen] = useState(false);

  // Form states
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryUnit, setNewCategoryUnit] = useState<'unidade' | 'kg' | 'caixa'>('unidade');
  const [newCategoryMargin, setNewCategoryMargin] = useState('');

  const [newCustomizationName, setNewCustomizationName] = useState('');
  const [newCustomizationType, setNewCustomizationType] = useState<'fixed' | 'per_kg' | 'per_unit'>('fixed');
  const [newCustomizationPrice, setNewCustomizationPrice] = useState('');

  // Queries
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const { data: customizations = [], isLoading: isLoadingCustomizations } = useQuery({
    queryKey: ['customizations'],
    queryFn: getCustomizations,
  });

  // Mutations
  const createCategoryMutation = useMutation({
    mutationFn: () => createCategory({
      name: newCategoryName,
      defaultUnit: newCategoryUnit,
      profitMargin: Number(newCategoryMargin),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsCategoryDialogOpen(false);
      setNewCategoryName('');
      setNewCategoryMargin('');
      toast.success('Categoria criada com sucesso!');
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoria removida com sucesso!');
    },
  });

  const createCustomizationMutation = useMutation({
    mutationFn: () => createCustomization({
      name: newCustomizationName,
      priceType: newCustomizationType,
      price: Number(newCustomizationPrice),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customizations'] });
      setIsCustomizationDialogOpen(false);
      setNewCustomizationName('');
      setNewCustomizationPrice('');
      toast.success('Personalização criada com sucesso!');
    },
  });

  const deleteCustomizationMutation = useMutation({
    mutationFn: deleteCustomization,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customizations'] });
      toast.success('Personalização removida com sucesso!');
    },
  });

  if (isLoadingCategories || isLoadingCustomizations) {
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
          <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground mt-1">
            Personalize as configurações da sua confeitaria
          </p>
        </div>

        <Tabs defaultValue="empresa" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto gap-2">
            <TabsTrigger value="empresa" className="gap-2">
              <Store className="h-4 w-4" />
              <span className="hidden sm:inline">Empresa</span>
            </TabsTrigger>
            <TabsTrigger value="categorias" className="gap-2">
              <Cake className="h-4 w-4" />
              <span className="hidden sm:inline">Categorias</span>
            </TabsTrigger>
            <TabsTrigger value="personalizacoes" className="gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Personalizações</span>
            </TabsTrigger>
            <TabsTrigger value="horarios" className="gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Horários</span>
            </TabsTrigger>
            <TabsTrigger value="entrega" className="gap-2">
              <Truck className="h-4 w-4" />
              <span className="hidden sm:inline">Entrega</span>
            </TabsTrigger>
          </TabsList>

          {/* Empresa */}
          <TabsContent value="empresa">
            <Card>
              <CardHeader>
                <CardTitle>Dados da Confeitaria</CardTitle>
                <CardDescription>
                  Informações que aparecem nos orçamentos e documentos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Nome da Empresa</Label>
                    <Input id="companyName" defaultValue="Jenny Doces Confeitaria" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input id="instagram" defaultValue="@jennydoces" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input id="whatsapp" defaultValue="(11) 99999-9999" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" type="email" defaultValue="contato@jennydoces.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Textarea id="address" defaultValue="Rua das Confeitarias, 123 - Centro" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="about">Sobre a Confeitaria</Label>
                  <Textarea
                    id="about"
                    rows={4}
                    defaultValue="Fazendo sonhos ficarem mais doces desde 2020. Especializada em bolos decorados, doces gourmet e kits para festas."
                  />
                </div>
                <Button>Salvar Alterações</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categorias */}
          <TabsContent value="categorias">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Categorias de Produtos</CardTitle>
                  <CardDescription>
                    Organize seus produtos por categoria
                  </CardDescription>
                </div>
                <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Categoria
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nova Categoria</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Nome</Label>
                        <Input
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder="Ex: Bolos de Pote"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Unidade Padrão</Label>
                        <Select value={newCategoryUnit} onValueChange={(v: any) => setNewCategoryUnit(v)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unidade">Unidade</SelectItem>
                            <SelectItem value="kg">Quilograma (kg)</SelectItem>
                            <SelectItem value="caixa">Caixa</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Margem de Lucro (%)</Label>
                        <Input
                          type="number"
                          value={newCategoryMargin}
                          onChange={(e) => setNewCategoryMargin(e.target.value)}
                          placeholder="Ex: 50"
                        />
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => createCategoryMutation.mutate()}
                        disabled={createCategoryMutation.isPending || !newCategoryName}
                      >
                        {createCategoryMutation.isPending ? 'Salvando...' : 'Salvar Categoria'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Unidade Padrão</TableHead>
                      <TableHead>Margem de Lucro</TableHead>
                      <TableHead className="w-24">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map(category => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{category.defaultUnit}</Badge>
                        </TableCell>
                        <TableCell>{category.profitMargin}%</TableCell>
                        <TableCell>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteCategoryMutation.mutate(category.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Personalizações */}
          <TabsContent value="personalizacoes">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Personalizações</CardTitle>
                  <CardDescription>
                    Opções extras para os produtos (escrita, topper, temas, etc.)
                  </CardDescription>
                </div>
                <Dialog open={isCustomizationDialogOpen} onOpenChange={setIsCustomizationDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Personalização
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nova Personalização</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Nome</Label>
                        <Input
                          value={newCustomizationName}
                          onChange={(e) => setNewCustomizationName(e.target.value)}
                          placeholder="Ex: Topper Personalizado"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Tipo de Cobrança</Label>
                        <Select value={newCustomizationType} onValueChange={(v: any) => setNewCustomizationType(v)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fixed">Valor Fixo</SelectItem>
                            <SelectItem value="per_kg">Por Kg</SelectItem>
                            <SelectItem value="per_unit">Por Unidade</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Preço (R$)</Label>
                        <Input
                          type="number"
                          value={newCustomizationPrice}
                          onChange={(e) => setNewCustomizationPrice(e.target.value)}
                          placeholder="Ex: 15.00"
                        />
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => createCustomizationMutation.mutate()}
                        disabled={createCustomizationMutation.isPending || !newCustomizationName}
                      >
                        {createCustomizationMutation.isPending ? 'Salvando...' : 'Salvar Personalização'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Tipo de Preço</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead className="w-24">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customizations.map(cust => (
                      <TableRow key={cust.id}>
                        <TableCell className="font-medium">{cust.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {cust.priceType === 'fixed' ? 'Fixo' : cust.priceType === 'per_kg' ? 'Por Kg' : 'Por Unidade'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-primary">
                          R$ {cust.price.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteCustomizationMutation.mutate(cust.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Horários */}
          <TabsContent value="horarios">
            <Card>
              <CardHeader>
                <CardTitle>Prazo Mínimo</CardTitle>
                <CardDescription>
                  Configure o tempo mínimo de antecedência para encomendas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2 max-w-xs">
                  <Label htmlFor="minHours">Horas mínimas de antecedência</Label>
                  <Input
                    id="minHours"
                    type="number"
                    value={minOrderHours}
                    onChange={(e) => setMinOrderHours(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Encomendas devem ser feitas com pelo menos {minOrderHours}h de antecedência
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <p className="font-medium">Bloquear datas com agenda cheia</p>
                    <p className="text-sm text-muted-foreground">
                      Impede novas encomendas em dias sem disponibilidade
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Button>Salvar Configurações</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Entrega */}
          <TabsContent value="entrega">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Entrega</CardTitle>
                <CardDescription>
                  Defina taxas e opções de entrega
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2 max-w-xs">
                  <Label htmlFor="deliveryFee">Taxa de Delivery (R$)</Label>
                  <Input
                    id="deliveryFee"
                    type="number"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <p className="font-medium">Permitir retirada no local</p>
                    <p className="text-sm text-muted-foreground">
                      Cliente pode retirar a encomenda na confeitaria
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <p className="font-medium">Delivery disponível</p>
                    <p className="text-sm text-muted-foreground">
                      Oferecer entrega para os clientes
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Button>Salvar Configurações</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Configuracoes;
