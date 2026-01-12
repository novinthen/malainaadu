import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subDays, format, startOfDay, endOfDay, eachDayOfInterval } from 'date-fns';

interface DailyViewData {
  date: string;
  views: number;
}

interface CategoryData {
  name: string;
  count: number;
  views: number;
}

interface SourceData {
  name: string;
  count: number;
  views: number;
}

interface PublishingTrendData {
  date: string;
  published: number;
  pending: number;
}

interface AnalyticsData {
  dailyViews: DailyViewData[];
  categoryBreakdown: CategoryData[];
  sourceBreakdown: SourceData[];
  publishingTrends: PublishingTrendData[];
  totalViews: number;
  todayViews: number;
  weeklyGrowth: number;
}

export function useAdminAnalytics(days: number = 30) {
  return useQuery({
    queryKey: ['admin-analytics', days],
    queryFn: async (): Promise<AnalyticsData> => {
      const startDate = subDays(new Date(), days);
      const today = new Date();
      
      // Generate date range for all days
      const dateRange = eachDayOfInterval({ start: startDate, end: today });

      // Fetch all views with timestamps
      const { data: viewsData, error: viewsError } = await supabase
        .from('article_views')
        .select('viewed_at, article_id')
        .gte('viewed_at', startOfDay(startDate).toISOString())
        .lte('viewed_at', endOfDay(today).toISOString());

      if (viewsError) throw viewsError;

      // Process daily views
      const viewsByDate = new Map<string, number>();
      dateRange.forEach(date => {
        viewsByDate.set(format(date, 'yyyy-MM-dd'), 0);
      });

      viewsData?.forEach(view => {
        const dateKey = format(new Date(view.viewed_at), 'yyyy-MM-dd');
        viewsByDate.set(dateKey, (viewsByDate.get(dateKey) || 0) + 1);
      });

      const dailyViews: DailyViewData[] = Array.from(viewsByDate.entries()).map(([date, views]) => ({
        date,
        views,
      })).sort((a, b) => a.date.localeCompare(b.date));

      // Calculate totals
      const totalViews = viewsData?.length || 0;
      const todayKey = format(today, 'yyyy-MM-dd');
      const todayViews = viewsByDate.get(todayKey) || 0;

      // Calculate weekly growth
      const thisWeekViews = dailyViews.slice(-7).reduce((sum, d) => sum + d.views, 0);
      const lastWeekViews = dailyViews.slice(-14, -7).reduce((sum, d) => sum + d.views, 0);
      const weeklyGrowth = lastWeekViews > 0 
        ? Math.round(((thisWeekViews - lastWeekViews) / lastWeekViews) * 100)
        : 0;

      // Fetch articles with category and source data
      const { data: articlesData, error: articlesError } = await supabase
        .from('articles')
        .select(`
          id,
          view_count,
          status,
          created_at,
          publish_date,
          category:categories(id, name),
          source:sources(id, name)
        `)
        .gte('created_at', startOfDay(startDate).toISOString());

      if (articlesError) throw articlesError;

      // Category breakdown
      const categoryMap = new Map<string, { count: number; views: number }>();
      articlesData?.forEach(article => {
        const catName = article.category?.name || 'Tiada Kategori';
        const existing = categoryMap.get(catName) || { count: 0, views: 0 };
        categoryMap.set(catName, {
          count: existing.count + 1,
          views: existing.views + (article.view_count || 0),
        });
      });

      const categoryBreakdown: CategoryData[] = Array.from(categoryMap.entries())
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

      // Source breakdown
      const sourceMap = new Map<string, { count: number; views: number }>();
      articlesData?.forEach(article => {
        const srcName = article.source?.name || 'Tiada Sumber';
        const existing = sourceMap.get(srcName) || { count: 0, views: 0 };
        sourceMap.set(srcName, {
          count: existing.count + 1,
          views: existing.views + (article.view_count || 0),
        });
      });

      const sourceBreakdown: SourceData[] = Array.from(sourceMap.entries())
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

      // Publishing trends
      const publishingByDate = new Map<string, { published: number; pending: number }>();
      dateRange.forEach(date => {
        publishingByDate.set(format(date, 'yyyy-MM-dd'), { published: 0, pending: 0 });
      });

      articlesData?.forEach(article => {
        const dateKey = format(new Date(article.created_at), 'yyyy-MM-dd');
        const existing = publishingByDate.get(dateKey);
        if (existing) {
          if (article.status === 'published') {
            existing.published++;
          } else if (article.status === 'pending') {
            existing.pending++;
          }
        }
      });

      const publishingTrends: PublishingTrendData[] = Array.from(publishingByDate.entries())
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return {
        dailyViews,
        categoryBreakdown,
        sourceBreakdown,
        publishingTrends,
        totalViews,
        todayViews,
        weeklyGrowth,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useTopPerformingArticles(limit: number = 10) {
  return useQuery({
    queryKey: ['top-performing-articles', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          id,
          title,
          view_count,
          publish_date,
          category:categories(name),
          source:sources(name)
        `)
        .eq('status', 'published')
        .order('view_count', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
  });
}

export function useRecentActivity(limit: number = 20) {
  return useQuery({
    queryKey: ['recent-activity', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          id,
          title,
          status,
          created_at,
          updated_at,
          source:sources(name)
        `)
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
  });
}
