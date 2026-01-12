import { TrendingUp, TrendingDown, Eye, Calendar, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface StatsCardsProps {
  totalViews: number | undefined;
  todayViews: number | undefined;
  weeklyGrowth: number | undefined;
  isLoading: boolean;
}

export function AnalyticsStatsCards({
  totalViews,
  todayViews,
  weeklyGrowth,
  isLoading,
}: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20" />
              <Skeleton className="mt-1 h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const isPositiveGrowth = (weeklyGrowth || 0) >= 0;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Jumlah Tontonan (30 Hari)</CardTitle>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(totalViews || 0).toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            Dalam tempoh 30 hari lepas
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Tontonan Hari Ini</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(todayViews || 0).toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            Sejak 12:00 AM hari ini
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Pertumbuhan Mingguan</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={cn(
            "flex items-center gap-1 text-2xl font-bold",
            isPositiveGrowth ? "text-green-600" : "text-red-600"
          )}>
            {isPositiveGrowth ? (
              <TrendingUp className="h-5 w-5" />
            ) : (
              <TrendingDown className="h-5 w-5" />
            )}
            {isPositiveGrowth ? '+' : ''}{weeklyGrowth || 0}%
          </div>
          <p className="text-xs text-muted-foreground">
            Berbanding minggu lepas
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
