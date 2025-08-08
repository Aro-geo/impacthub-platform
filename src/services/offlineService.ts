import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type OfflinePackage = Tables<'offline_packages'>;

export const offlineService = {
  // Get all offline packages
  async getOfflinePackages(language = 'en') {
    const { data, error } = await supabase
      .from('offline_packages')
      .select('*')
      .eq('language', language)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get offline package by ID
  async getOfflinePackage(id: string) {
    const { data, error } = await supabase
      .from('offline_packages')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create new offline package
  async createOfflinePackage(packageData: TablesInsert<'offline_packages'>) {
    const { data, error } = await supabase
      .from('offline_packages')
      .insert(packageData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update offline package
  async updateOfflinePackage(id: string, updates: TablesUpdate<'offline_packages'>) {
    const { data, error } = await supabase
      .from('offline_packages')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete offline package
  async deleteOfflinePackage(id: string) {
    const { error } = await supabase
      .from('offline_packages')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};