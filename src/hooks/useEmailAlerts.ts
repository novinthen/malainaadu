import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface EmailAlert {
  id: string;
  user_id: string;
  email: string;
  new_articles: boolean;
  processing_errors: boolean;
  last_alert_sent: string | null;
  alert_cooldown_minutes: number;
  created_at: string;
  updated_at: string;
}

interface AlertLog {
  id: string;
  alert_type: string;
  message: string;
  recipients: string[];
  sent_at: string;
  created_at: string;
}

export function useEmailAlerts() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch current user's email alert settings
  const { data: emailAlert, isLoading: isLoadingAlert } = useQuery({
    queryKey: ['email-alert', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('email_alerts')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as EmailAlert | null;
    },
    enabled: !!user?.id,
  });

  // Fetch all email alerts (admin only)
  const { data: allAlerts, isLoading: isLoadingAllAlerts } = useQuery({
    queryKey: ['all-email-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as EmailAlert[];
    },
  });

  // Fetch alert logs (admin only)
  const { data: alertLogs, isLoading: isLoadingLogs } = useQuery({
    queryKey: ['alert-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alert_logs')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as AlertLog[];
    },
  });

  // Subscribe to alerts
  const subscribe = useMutation({
    mutationFn: async ({ email, newArticles = true, processingErrors = true }: { 
      email: string; 
      newArticles?: boolean; 
      processingErrors?: boolean;
    }) => {
      if (!user?.id) throw new Error('Must be logged in');

      const { data, error } = await supabase
        .from('email_alerts')
        .upsert({
          user_id: user.id,
          email,
          new_articles: newArticles,
          processing_errors: processingErrors,
        }, {
          onConflict: 'user_id',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-alert'] });
      queryClient.invalidateQueries({ queryKey: ['all-email-alerts'] });
    },
  });

  // Update alert settings
  const updateSettings = useMutation({
    mutationFn: async ({ 
      newArticles, 
      processingErrors, 
      cooldownMinutes 
    }: { 
      newArticles?: boolean; 
      processingErrors?: boolean;
      cooldownMinutes?: number;
    }) => {
      if (!user?.id) throw new Error('Must be logged in');

      const updates: Record<string, unknown> = {};
      if (newArticles !== undefined) updates.new_articles = newArticles;
      if (processingErrors !== undefined) updates.processing_errors = processingErrors;
      if (cooldownMinutes !== undefined) updates.alert_cooldown_minutes = cooldownMinutes;

      const { error } = await supabase
        .from('email_alerts')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-alert'] });
      queryClient.invalidateQueries({ queryKey: ['all-email-alerts'] });
    },
  });

  // Unsubscribe
  const unsubscribe = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Must be logged in');

      const { error } = await supabase
        .from('email_alerts')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-alert'] });
      queryClient.invalidateQueries({ queryKey: ['all-email-alerts'] });
    },
  });

  return {
    emailAlert,
    allAlerts,
    alertLogs,
    isLoading: isLoadingAlert || isLoadingAllAlerts || isLoadingLogs,
    subscribe,
    updateSettings,
    unsubscribe,
  };
}
