import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface SourceData {
  name: string;
  count: number;
  views: number;
}

interface SourceChartProps {
  data: SourceData[] | undefined;
  isLoading: boolean;
}

export function SourceChart({ data, isLoading }: SourceChartProps) {
  const chartData = useMemo(() => {
    if (!data) return [];
    return data.slice(0, 8).map(item => ({
      ...item,
      shortName: item.name.length > 15 ? item.name.substring(0, 12) + '...' : item.name,
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
        <CardTitle>Sumber Berita</CardTitle>
        <CardDescription>Prestasi tontonan mengikut sumber</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
              />
              <YAxis
                type="category"
                dataKey="shortName"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={100}
                className="text-muted-foreground"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number, name: string) => {
                  if (name === 'views') return [value.toLocaleString(), 'Tontonan'];
                  if (name === 'count') return [value, 'Artikel'];
                  return [value, name];
                }}
                labelFormatter={(label) => {
                  const item = chartData.find(d => d.shortName === label);
                  return item?.name || label;
                }}
              />
              <Bar
                dataKey="views"
                fill="hsl(var(--primary))"
                radius={[0, 4, 4, 0]}
                name="views"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
