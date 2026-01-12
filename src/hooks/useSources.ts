import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Source } from '@/types/database';

export function useSources() {
  return useQuery({
    queryKey: ['sources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sources')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as Source[];
    },
  });
}

export function useActiveSources() {
  return useQuery({
    queryKey: ['sources', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sources')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data as Source[];
    },
  });
}
