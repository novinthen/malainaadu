import { useMemo } from 'react';
import { format } from 'date-fns';
import { ms } from 'date-fns/locale';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface PublishingTrendData {
  date: string;
  published: number;
  pending: number;
}

interface PublishingChartProps {
  data: PublishingTrendData[] | undefined;
  isLoading: boolean;
}

export function PublishingChart({ data, isLoading }: PublishingChartProps) {
  const chartData = useMemo(() => {
    if (!data) return [];
    // Group by week for cleaner visualization
    const weeklyData: Record<string, { published: number; pending: number }> = {};
    
    data.forEach(item => {
      const weekStart = format(new Date(item.date), 'yyyy-ww');
      if (!weeklyData[weekStart]) {
        weeklyData[weekStart] = { published: 0, pending: 0 };
      }
      weeklyData[weekStart].published += item.published;
      weeklyData[weekStart].pending += item.pending;
    });

    return Object.entries(weeklyData)
      .slice(-8) // Last 8 weeks
      .map(([week, counts]) => ({
        week,
        displayWeek: `Minggu ${week.split('-')[1]}`,
        ...counts,
      }));
  }, [data]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trend Penerbitan</CardTitle>
        <CardDescription>Jumlah artikel diterbitkan dan menunggu moderasi</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="displayWeek"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number, name: string) => {
                  if (name === 'published') return [value, 'Diterbitkan'];
                  if (name === 'pending') return [value, 'Menunggu'];
                  return [value, name];
                }}
              />
              <Legend
                formatter={(value) => {
                  if (value === 'published') return 'Diterbitkan';
                  if (value === 'pending') return 'Menunggu';
                  return value;
                }}
              />
              <Bar
                dataKey="published"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
                name="published"
              />
              <Bar
                dataKey="pending"
                fill="hsl(var(--accent))"
                radius={[4, 4, 0, 0]}
                name="pending"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
