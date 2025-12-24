// Types for Jenny Doces Confeitaria System

export interface Category {
  id: string;
  name: string;
  profitMargin: number;
  defaultUnit: 'unidade' | 'kg' | 'caixa';
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  description: string;
  basePrice: number;
  unit: 'unidade' | 'kg' | 'caixa';
  defaultWeight?: number;
  servesCount?: number;
  image?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Customization {
  id: string;
  name: string;
  priceType: 'fixed' | 'per_kg' | 'per_unit';
  price: number;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  preferences?: string;
  dietaryRestrictions?: string;
  createdAt: Date;
}

export interface QuoteItem {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
  weight?: number;
  customizations: string[];
  notes?: string;
  unitPrice: number;
  customizationPrice: number;
  totalPrice: number;
}

export interface Quote {
  id: string;
  clientId: string;
  client?: Client;
  items: QuoteItem[];
  orderDate: Date;
  deliveryDate: Date;
  deliveryType: 'retirada' | 'delivery';
  deliveryAddress?: string;
  paymentMethod: string;
  notes?: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: 'rascunho' | 'enviado' | 'aprovado' | 'rejeitado';
  createdAt: Date;
}

export type OrderStatus = 
  | 'recebido'
  | 'confirmado'
  | 'em_producao'
  | 'pronto'
  | 'saiu_entrega'
  | 'entregue'
  | 'cancelado';

export interface Order {
  id: string;
  quoteId: string;
  quote?: Quote;
  status: OrderStatus;
  statusHistory: {
    status: OrderStatus;
    timestamp: Date;
    notes?: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  recebido: 'Recebido',
  confirmado: 'Confirmado',
  em_producao: 'Em Produção',
  pronto: 'Pronto',
  saiu_entrega: 'Saiu para Entrega',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  recebido: 'bg-muted text-muted-foreground',
  confirmado: 'bg-primary/20 text-primary',
  em_producao: 'bg-accent text-accent-foreground',
  pronto: 'bg-chart-1/20 text-chart-1',
  saiu_entrega: 'bg-chart-2/20 text-chart-2',
  entregue: 'bg-green-100 text-green-700',
  cancelado: 'bg-destructive/20 text-destructive',
};
