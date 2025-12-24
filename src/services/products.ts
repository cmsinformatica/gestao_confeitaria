import { supabase } from '@/lib/supabase';
import { Product } from '@/types';
import { Database } from '@/types/supabase';

type ProductRow = Database['public']['Tables']['products']['Row'];

export const mapProduct = (row: ProductRow): Product => ({
    id: row.id,
    name: row.name,
    categoryId: row.category_id || '',
    description: row.description || '',
    basePrice: row.base_price,
    unit: row.unit,
    defaultWeight: row.default_weight || undefined,
    servesCount: row.serves_count || undefined,
    image: row.image || undefined,
    isActive: row.is_active,
    createdAt: new Date(row.created_at),
});

export const getProducts = async (): Promise<Product[]> => {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

    if (error) throw error;
    return data.map(mapProduct);
};

export const createProduct = async (product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> => {
    const { data, error } = await supabase
        .from('products')
        .insert({
            name: product.name,
            category_id: product.categoryId,
            description: product.description,
            base_price: product.basePrice,
            unit: product.unit,
            default_weight: product.defaultWeight,
            serves_count: product.servesCount,
            image: product.image,
            is_active: product.isActive,
        })
        .select()
        .single();

    if (error) throw error;
    return mapProduct(data);
};

export const updateProduct = async (id: string, product: Partial<Product>): Promise<Product> => {
    const updates: any = {};
    if (product.name) updates.name = product.name;
    if (product.categoryId) updates.category_id = product.categoryId;
    if (product.description) updates.description = product.description;
    if (product.basePrice) updates.base_price = product.basePrice;
    if (product.unit) updates.unit = product.unit;
    if (product.defaultWeight !== undefined) updates.default_weight = product.defaultWeight;
    if (product.servesCount !== undefined) updates.serves_count = product.servesCount;
    if (product.image) updates.image = product.image;
    if (product.isActive !== undefined) updates.is_active = product.isActive;

    const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return mapProduct(data);
};

export const deleteProduct = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

    if (error) throw error;
};
