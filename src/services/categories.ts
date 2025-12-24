import { supabase } from '@/lib/supabase';
import { Category } from '@/types';
import { Database } from '@/types/supabase';

type CategoryRow = Database['public']['Tables']['categories']['Row'];

export const mapCategory = (row: CategoryRow): Category => ({
    id: row.id,
    name: row.name,
    profitMargin: row.profit_margin,
    defaultUnit: row.default_unit,
});

export const getCategories = async (): Promise<Category[]> => {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

    if (error) throw error;
    return data.map(mapCategory);
};

export const createCategory = async (category: Omit<Category, 'id'>): Promise<Category> => {
    const { data, error } = await supabase
        .from('categories')
        .insert({
            name: category.name,
            profit_margin: category.profitMargin,
            default_unit: category.defaultUnit,
        })
        .select()
        .single();

    if (error) throw error;
    return mapCategory(data);
};

export const updateCategory = async (id: string, category: Partial<Category>): Promise<Category> => {
    const updates: any = {};
    if (category.name) updates.name = category.name;
    if (category.profitMargin) updates.profit_margin = category.profitMargin;
    if (category.defaultUnit) updates.default_unit = category.defaultUnit;

    const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return mapCategory(data);
};

export const deleteCategory = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

    if (error) throw error;
};
