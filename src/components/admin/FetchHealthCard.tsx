import { Rss, RefreshCw, CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFetchHealth } from '@/hooks/useFetchHealth';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ms } from 'date-fns/locale';

type HealthStatus = 'healthy' | 'warning' | 'error';

function getHealthStatus(lastFetch: { status: string; completed_at: string | null } | null): HealthStatus {
  if (!lastFetch) return 'error';
  
  if (lastFetch.status === 'failed') return 'error';
  if (lastFetch.status === 'running') return 'warning';
  
  if (!lastFetch.completed_at) return 'warning';
  
  const lastFetchTime = new Date(lastFetch.completed_at);
  const now = new Date();
  const diffMinutes = (now.getTime() - lastFetchTime.getTime()) / (1000 * 60);
  
  if (diffMinutes <= 30) return 'healthy';
  if (diffMinutes <= 60) return 'warning';
  return 'error';
}

const statusConfig = {
  healthy: {
    icon: CheckCircle2,
    label: 'Sihat',
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950',
    borderColor: 'border-green-200 dark:border-green-900',
    badgeVariant: 'default' as const,
  },
  warning: {
    icon: AlertTriangle,
    label: 'Amaran',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 dark:bg-amber-950',
    borderColor: 'border-amber-200 dark:border-amber-900',
    badgeVariant: 'secondary' as const,
  },
  error: {
    icon: XCircle,
    label: 'Ralat',
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-950',
    borderColor: 'border-red-200 dark:border-red-900',
    badgeVariant: 'destructive' as const,
  },
};

export function FetchHealthCard() {
  const { data, isLoading, refetch } = useFetchHealth();
  const [isTriggering, setIsTriggering] = useState(false);

  const status = getHealthStatus(data?.lastFetch ?? null);
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  const triggerFetch = async () => {
    setIsTriggering(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Sila log masuk untuk mencetuskan pengambilan');
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-rss`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Pengambilan gagal');
      }

      const result = await response.json();
      toast.success(`Pengambilan berjaya: ${result.processed} artikel diproses`);
      refetch();
    } catch (error) {
      console.error('Trigger fetch error:', error);
      toast.error(error instanceof Error ? error.message : 'Pengambilan gagal');
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <Card className={`${config.bgColor} ${config.borderColor}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Rss className="h-4 w-4" />
            Kesihatan Pengambilan RSS
          </CardTitle>
          <Badge variant={config.badgeVariant} className="flex items-center gap-1">
            <StatusIcon className="h-3 w-3" />
            {config.label}
          </Badge>
        </div>
        <CardDescription>
          Status sistem pengambilan berita automatik
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-4 w-3/4 rounded bg-muted" />
            <div className="h-4 w-1/2 rounded bg-muted" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Pengambilan Terakhir</p>
                <p className="font-medium">
                  {data?.lastFetch?.completed_at ? (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(data.lastFetch.completed_at), {
                        addSuffix: true,
                        locale: ms,
                      })}
                    </span>
                  ) : (
                    'Tiada rekod'
                  )}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Artikel Hari Ini</p>
                <p className="font-medium">{data?.articlesToday ?? 0}</p>
              </div>
            </div>

            {data?.lastFetch?.status === 'failed' && data?.lastFetch?.error_message && (
              <div className="rounded-md bg-destructive/10 p-2 text-xs text-destructive">
                <strong>Ralat:</strong> {data.lastFetch.error_message}
              </div>
            )}

            {data?.recentLogs && data.recentLogs.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Log Terkini</p>
                <div className="max-h-24 space-y-1 overflow-y-auto text-xs">
                  {data.recentLogs.slice(0, 3).map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between rounded bg-background/50 px-2 py-1"
                    >
                      <span className={log.status === 'success' ? 'text-green-600' : 'text-red-600'}>
                        {log.status}
                      </span>
                      <span className="text-muted-foreground">
                        {log.articles_processed ?? 0} artikel
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={triggerFetch}
              disabled={isTriggering}
              variant="outline"
              size="sm"
              className="w-full"
            >
              {isTriggering ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Mengambil...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Cetuskan Pengambilan Manual
                </>
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
