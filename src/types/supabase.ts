export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            categories: {
                Row: {
                    id: string
                    name: string
                    profit_margin: number
                    default_unit: 'unidade' | 'kg' | 'caixa'
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    profit_margin?: number
                    default_unit: 'unidade' | 'kg' | 'caixa'
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    profit_margin?: number
                    default_unit?: 'unidade' | 'kg' | 'caixa'
                    created_at?: string
                }
            }
            products: {
                Row: {
                    id: string
                    name: string
                    category_id: string | null
                    description: string | null
                    base_price: number
                    unit: 'unidade' | 'kg' | 'caixa'
                    default_weight: number | null
                    serves_count: number | null
                    image: string | null
                    is_active: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    category_id?: string | null
                    description?: string | null
                    base_price?: number
                    unit: 'unidade' | 'kg' | 'caixa'
                    default_weight?: number | null
                    serves_count?: number | null
                    image?: string | null
                    is_active?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    category_id?: string | null
                    description?: string | null
                    base_price?: number
                    unit?: 'unidade' | 'kg' | 'caixa'
                    default_weight?: number | null
                    serves_count?: number | null
                    image?: string | null
                    is_active?: boolean
                    created_at?: string
                }
            }
            customizations: {
                Row: {
                    id: string
                    name: string
                    price_type: 'fixed' | 'per_kg' | 'per_unit'
                    price: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    price_type: 'fixed' | 'per_kg' | 'per_unit'
                    price?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    price_type?: 'fixed' | 'per_kg' | 'per_unit'
                    price?: number
                    created_at?: string
                }
            }
            clients: {
                Row: {
                    id: string
                    name: string
                    phone: string | null
                    email: string | null
                    address: string | null
                    notes: string | null
                    preferences: string | null
                    dietary_restrictions: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    phone?: string | null
                    email?: string | null
                    address?: string | null
                    notes?: string | null
                    preferences?: string | null
                    dietary_restrictions?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    phone?: string | null
                    email?: string | null
                    address?: string | null
                    notes?: string | null
                    preferences?: string | null
                    dietary_restrictions?: string | null
                    created_at?: string
                }
            }
            quotes: {
                Row: {
                    id: string
                    client_id: string | null
                    order_date: string
                    delivery_date: string
                    delivery_type: 'retirada' | 'delivery'
                    delivery_address: string | null
                    payment_method: string | null
                    notes: string | null
                    subtotal: number
                    delivery_fee: number
                    total: number
                    status: 'rascunho' | 'enviado' | 'aprovado' | 'rejeitado'
                    created_at: string
                }
                Insert: {
                    id?: string
                    client_id?: string | null
                    order_date?: string
                    delivery_date: string
                    delivery_type: 'retirada' | 'delivery'
                    delivery_address?: string | null
                    payment_method?: string | null
                    notes?: string | null
                    subtotal?: number
                    delivery_fee?: number
                    total?: number
                    status?: 'rascunho' | 'enviado' | 'aprovado' | 'rejeitado'
                    created_at?: string
                }
                Update: {
                    id?: string
                    client_id?: string | null
                    order_date?: string
                    delivery_date?: string
                    delivery_type?: 'retirada' | 'delivery'
                    delivery_address?: string | null
                    payment_method?: string | null
                    notes?: string | null
                    subtotal?: number
                    delivery_fee?: number
                    total?: number
                    status?: 'rascunho' | 'enviado' | 'aprovado' | 'rejeitado'
                    created_at?: string
                }
            }
            quote_items: {
                Row: {
                    id: string
                    quote_id: string | null
                    product_id: string | null
                    quantity: number
                    weight: number | null
                    unit_price: number
                    customization_price: number
                    total_price: number
                    notes: string | null
                }
                Insert: {
                    id?: string
                    quote_id?: string | null
                    product_id?: string | null
                    quantity?: number
                    weight?: number | null
                    unit_price?: number
                    customization_price?: number
                    total_price?: number
                    notes?: string | null
                }
                Update: {
                    id?: string
                    quote_id?: string | null
                    product_id?: string | null
                    quantity?: number
                    weight?: number | null
                    unit_price?: number
                    customization_price?: number
                    total_price?: number
                    notes?: string | null
                }
            }
            quote_item_customizations: {
                Row: {
                    id: string
                    quote_item_id: string | null
                    customization_id: string | null
                }
                Insert: {
                    id?: string
                    quote_item_id?: string | null
                    customization_id?: string | null
                }
                Update: {
                    id?: string
                    quote_item_id?: string | null
                    customization_id?: string | null
                }
            }
            orders: {
                Row: {
                    id: string
                    quote_id: string | null
                    status: 'recebido' | 'confirmado' | 'em_producao' | 'pronto' | 'saiu_entrega' | 'entregue' | 'cancelado'
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    quote_id?: string | null
                    status?: 'recebido' | 'confirmado' | 'em_producao' | 'pronto' | 'saiu_entrega' | 'entregue' | 'cancelado'
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    quote_id?: string | null
                    status?: 'recebido' | 'confirmado' | 'em_producao' | 'pronto' | 'saiu_entrega' | 'entregue' | 'cancelado'
                    created_at?: string
                    updated_at?: string
                }
            }
            order_history: {
                Row: {
                    id: string
                    order_id: string | null
                    status: string
                    notes: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    order_id?: string | null
                    status: string
                    notes?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    order_id?: string | null
                    status?: string
                    notes?: string | null
                    created_at?: string
                }
            }
        }
    }
}
