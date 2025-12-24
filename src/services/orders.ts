import { supabase } from '@/lib/supabase';
import { Order, OrderStatus } from '@/types';
import { Database } from '@/types/supabase';
import { getQuoteById } from './quotes';

type OrderRow = Database['public']['Tables']['orders']['Row'];
type OrderHistoryRow = Database['public']['Tables']['order_history']['Row'];

const mapOrder = async (row: OrderRow & { order_history?: OrderHistoryRow[] }): Promise<Order> => {
    const quote = await getQuoteById(row.quote_id || '');

    return {
        id: row.id,
        quoteId: row.quote_id || '',
        quote: quote || undefined,
        status: row.status,
        statusHistory: row.order_history?.map(h => ({
            status: h.status as OrderStatus,
            timestamp: new Date(h.created_at),
            notes: h.notes || undefined,
        })) || [],
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
    };
};

export const getOrders = async (): Promise<Order[]> => {
    const { data, error } = await supabase
        .from('orders')
        .select(`
      *,
      order_history(*)
    `)
        .order('created_at', { ascending: false });

    if (error) throw error;

    // Fetch quotes for each order (could be optimized with a join but quotes service is complex)
    // For now, let's map one by one or rely on the join if we duplicate logic.
    // To reuse logic, we'll map async.
    const orders = await Promise.all(data.map(async (row: any) => mapOrder(row)));
    return orders;
};

export const createOrder = async (quoteId: string): Promise<Order> => {
    // 1. Create Order
    const { data, error } = await supabase
        .from('orders')
        .insert({
            quote_id: quoteId,
            status: 'recebido',
        })
        .select()
        .single();

    if (error) throw error;

    // 2. Add initial history
    await supabase.from('order_history').insert({
        order_id: data.id,
        status: 'recebido',
        notes: 'Pedido criado a partir do orçamento',
    });

    return mapOrder(data);
};

export const updateOrderStatus = async (id: string, status: OrderStatus, notes?: string): Promise<void> => {
    // 1. Update Order
    const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

    if (error) throw error;

    // 2. Add history
    const { error: historyError } = await supabase
        .from('order_history')
        .insert({
            order_id: id,
            status,
            notes,
        });

    if (historyError) throw historyError;
};
