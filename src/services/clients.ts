import { supabase } from '@/lib/supabase';
import { Client } from '@/types';
import { Database } from '@/types/supabase';

type ClientRow = Database['public']['Tables']['clients']['Row'];

export const mapClient = (row: ClientRow): Client => ({
    id: row.id,
    name: row.name,
    phone: row.phone || '',
    email: row.email || undefined,
    address: row.address || undefined,
    notes: row.notes || undefined,
    preferences: row.preferences || undefined,
    dietaryRestrictions: row.dietary_restrictions || undefined,
    createdAt: new Date(row.created_at),
});

export const getClients = async (): Promise<Client[]> => {
    const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');

    if (error) throw error;
    return data.map(mapClient);
};

export const createClient = async (client: Omit<Client, 'id' | 'createdAt'>): Promise<Client> => {
    const { data, error } = await supabase
        .from('clients')
        .insert({
            name: client.name,
            phone: client.phone,
            email: client.email,
            address: client.address,
            notes: client.notes,
            preferences: client.preferences,
            dietary_restrictions: client.dietaryRestrictions,
        })
        .select()
        .single();

    if (error) throw error;
    return mapClient(data);
};

export const updateClient = async (id: string, client: Partial<Client>): Promise<Client> => {
    const updates: any = {};
    if (client.name) updates.name = client.name;
    if (client.phone) updates.phone = client.phone;
    if (client.email) updates.email = client.email;
    if (client.address) updates.address = client.address;
    if (client.notes) updates.notes = client.notes;
    if (client.preferences) updates.preferences = client.preferences;
    if (client.dietaryRestrictions) updates.dietary_restrictions = client.dietaryRestrictions;

    const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return mapClient(data);
};

export const deleteClient = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

    if (error) throw error;
};
