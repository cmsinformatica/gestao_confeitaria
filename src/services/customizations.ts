import { supabase } from '@/lib/supabase';
import { Customization } from '@/types';
import { Database } from '@/types/supabase';

type CustomizationRow = Database['public']['Tables']['customizations']['Row'];

export const mapCustomization = (row: CustomizationRow): Customization => ({
    id: row.id,
    name: row.name,
    priceType: row.price_type,
    price: row.price,
});

export const getCustomizations = async (): Promise<Customization[]> => {
    const { data, error } = await supabase
        .from('customizations')
        .select('*')
        .order('name');

    if (error) throw error;
    return data.map(mapCustomization);
};

export const createCustomization = async (customization: Omit<Customization, 'id'>): Promise<Customization> => {
    const { data, error } = await supabase
        .from('customizations')
        .insert({
            name: customization.name,
            price_type: customization.priceType,
            price: customization.price,
        })
        .select()
        .single();

    if (error) throw error;
    return mapCustomization(data);
};

export const updateCustomization = async (id: string, customization: Partial<Customization>): Promise<Customization> => {
    const updates: any = {};
    if (customization.name) updates.name = customization.name;
    if (customization.priceType) updates.price_type = customization.priceType;
    if (customization.price) updates.price = customization.price;

    const { data, error } = await supabase
        .from('customizations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return mapCustomization(data);
};

export const deleteCustomization = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('customizations')
        .delete()
        .eq('id', id);

    if (error) throw error;
};
