import { supabase } from '@/lib/supabase';
import { Quote, QuoteItem } from '@/types';
import { Database } from '@/types/supabase';
import { mapClient } from './clients';
import { mapProduct } from './products';

type QuoteRow = Database['public']['Tables']['quotes']['Row'];
type QuoteItemRow = Database['public']['Tables']['quote_items']['Row'];

// Helper to map QuoteItem
const mapQuoteItem = (
    row: QuoteItemRow & {
        product?: Database['public']['Tables']['products']['Row'] | null,
        quote_item_customizations?: { customization_id: string | null }[]
    }
): QuoteItem => ({
    id: row.id,
    productId: row.product_id || '',
    product: row.product ? mapProduct(row.product) : undefined,
    quantity: row.quantity,
    weight: row.weight || undefined,
    customizations: row.quote_item_customizations?.map(c => c.customization_id || '').filter(Boolean) || [],
    notes: row.notes || undefined,
    unitPrice: row.unit_price,
    customizationPrice: row.customization_price,
    totalPrice: row.total_price,
});

// Helper to map Quote
const mapQuote = (
    row: QuoteRow & {
        client?: Database['public']['Tables']['clients']['Row'] | null,
        quote_items?: (QuoteItemRow & {
            product?: Database['public']['Tables']['products']['Row'] | null,
            quote_item_customizations?: { customization_id: string | null }[]
        })[]
    }
): Quote => ({
    id: row.id,
    clientId: row.client_id || '',
    client: row.client ? mapClient(row.client) : undefined,
    items: row.quote_items?.map(mapQuoteItem) || [],
    orderDate: new Date(row.order_date),
    deliveryDate: new Date(row.delivery_date),
    deliveryType: row.delivery_type,
    deliveryAddress: row.delivery_address || undefined,
    paymentMethod: row.payment_method || '',
    notes: row.notes || undefined,
    subtotal: row.subtotal,
    deliveryFee: row.delivery_fee,
    total: row.total,
    status: row.status,
    createdAt: new Date(row.created_at),
});

export const getQuotes = async (): Promise<Quote[]> => {
    const { data, error } = await supabase
        .from('quotes')
        .select(`
      *,
      client:clients(*),
      quote_items:quote_items(
        *,
        product:products(*),
        quote_item_customizations(customization_id)
      )
    `)
        .order('created_at', { ascending: false });

    if (error) throw error;
    // @ts-ignore - Supabase types are complex with joins, casting for simplicity
    return data.map(mapQuote);
};

export const getQuoteById = async (id: string): Promise<Quote | null> => {
    const { data, error } = await supabase
        .from('quotes')
        .select(`
      *,
      client:clients(*),
      quote_items:quote_items(
        *,
        product:products(*),
        quote_item_customizations(customization_id)
      )
    `)
        .eq('id', id)
        .single();

    if (error) return null;
    // @ts-ignore
    return mapQuote(data);
};

export const createQuote = async (quote: Omit<Quote, 'id' | 'createdAt' | 'items'> & { items: Omit<QuoteItem, 'id'>[] }): Promise<Quote> => {
    // 1. Create Quote
    const { data: quoteData, error: quoteError } = await supabase
        .from('quotes')
        .insert({
            client_id: quote.clientId,
            order_date: quote.orderDate.toISOString(),
            delivery_date: quote.deliveryDate.toISOString(),
            delivery_type: quote.deliveryType,
            delivery_address: quote.deliveryAddress,
            payment_method: quote.paymentMethod,
            notes: quote.notes,
            subtotal: quote.subtotal,
            delivery_fee: quote.deliveryFee,
            total: quote.total,
            status: quote.status,
        })
        .select()
        .single();

    if (quoteError) throw quoteError;

    // 2. Create Items
    const itemsToInsert = quote.items.map(item => ({
        quote_id: quoteData.id,
        product_id: item.productId,
        quantity: item.quantity,
        weight: item.weight,
        unit_price: item.unitPrice,
        customization_price: item.customizationPrice,
        total_price: item.totalPrice,
        notes: item.notes,
    }));

    const { data: itemsData, error: itemsError } = await supabase
        .from('quote_items')
        .insert(itemsToInsert)
        .select();

    if (itemsError) throw itemsError;

    // 3. Create Item Customizations
    const customizationsToInsert: { quote_item_id: string; customization_id: string }[] = [];

    quote.items.forEach((item, index) => {
        const createdItem = itemsData[index];
        if (item.customizations && item.customizations.length > 0) {
            item.customizations.forEach(custId => {
                customizationsToInsert.push({
                    quote_item_id: createdItem.id,
                    customization_id: custId,
                });
            });
        }
    });

    if (customizationsToInsert.length > 0) {
        const { error: custError } = await supabase
            .from('quote_item_customizations')
            .insert(customizationsToInsert);

        if (custError) throw custError;
    }

    // Return full object
    const fullQuote = await getQuoteById(quoteData.id);
    if (!fullQuote) throw new Error('Failed to fetch created quote');
    return fullQuote;
};

export const updateQuoteStatus = async (id: string, status: Quote['status']): Promise<void> => {
    const { error } = await supabase
        .from('quotes')
        .update({ status })
        .eq('id', id);

    if (error) throw error;
};
