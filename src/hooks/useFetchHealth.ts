import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface FetchLog {
  id: string;
  started_at: string;
  completed_at: string | null;
  status: string;
  articles_processed: number | null;
  articles_skipped: number | null;
  error_message: string | null;
}

interface FetchHealth {
  lastFetch: FetchLog | null;
  articlesToday: number;
  isHealthy: boolean;
  recentLogs: FetchLog[];
}

export function useFetchHealth() {
  return useQuery({
    queryKey: ['fetch-health'],
    queryFn: async (): Promise<FetchHealth> => {
      // Get recent fetch logs
      const { data: logs, error: logsError } = await supabase
        .from('fetch_logs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(10);

      if (logsError) throw logsError;

      // Get articles created today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { count: articlesToday, error: countError } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      if (countError) throw countError;

      const recentLogs = (logs || []) as FetchLog[];
      const lastFetch = recentLogs[0] || null;

      // Check if healthy: last successful fetch within 30 minutes
      let isHealthy = false;
      if (lastFetch && lastFetch.status === 'success' && lastFetch.completed_at) {
        const lastFetchTime = new Date(lastFetch.completed_at);
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
        isHealthy = lastFetchTime > thirtyMinutesAgo;
      }

      return {
        lastFetch,
        articlesToday: articlesToday || 0,
        isHealthy,
        recentLogs,
      };
    },
    refetchInterval: 60000, // Refetch every minute
  });
}
