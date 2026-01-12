import { useQuery } from '@tanstack/react-query';
import { FileText, Clock, Eye, Rss, TrendingUp, AlertCircle, BarChart2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { useAdminAnalytics, useTopPerformingArticles } from '@/hooks/useAdminAnalytics';
import {
  ViewsChart,
  CategoryChart,
  SourceChart,
  PublishingChart,
  AnalyticsStatsCards,
  TopArticlesTable,
} from '@/components/admin/charts';

interface Stats {
  totalArticles: number;
  pendingArticles: number;
  publishedArticles: number;
  totalViews: number;
  activeSources: number;
}

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async (): Promise<Stats> => {
      const [
        { count: totalArticles },
        { count: pendingArticles },
        { count: publishedArticles },
        { data: viewsData },
        { count: activeSources },
      ] = await Promise.all([
        supabase.from('articles').select('*', { count: 'exact', head: true }),
        supabase.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('articles').select('view_count').eq('status', 'published'),
        supabase.from('sources').select('*', { count: 'exact', head: true }).eq('is_active', true),
      ]);

      const totalViews = viewsData?.reduce((sum, a) => sum + (a.view_count || 0), 0) || 0;

      return {
        totalArticles: totalArticles || 0,
        pendingArticles: pendingArticles || 0,
        publishedArticles: publishedArticles || 0,
        totalViews,
        activeSources: activeSources || 0,
      };
    },
  });

  const { data: recentPending } = useQuery({
    queryKey: ['recent-pending'],
    queryFn: async () => {
      const { data } = await supabase
        .from('articles')
        .select('id, title, created_at, source:sources(name)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5);
      return data || [];
    },
  });

  const { data: analytics, isLoading: analyticsLoading } = useAdminAnalytics(30);
  const { data: topArticles, isLoading: topArticlesLoading } = useTopPerformingArticles(10);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold md:text-3xl">Dashboard</h1>
          <p className="text-muted-foreground">Selamat datang ke Panel Admin Berita Malaysia</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Ringkasan</TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart2 className="mr-2 h-4 w-4" />
              Analitik
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Jumlah Artikel</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? '...' : stats?.totalArticles.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Menunggu Moderasi</CardTitle>
                  <Clock className="h-4 w-4 text-amber-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                    {statsLoading ? '...' : stats?.pendingArticles.toLocaleString()}
                  </div>
                  <Link to="/admin/moderation">
                    <Button variant="link" size="sm" className="h-auto p-0 text-amber-700">
                      Lihat senarai →
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Jumlah Tontonan</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? '...' : stats?.totalViews.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Sumber Aktif</CardTitle>
                  <Rss className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? '...' : stats?.activeSources}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Two Column Layout */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Pending Moderation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-amber-500" />
                    Menunggu Moderasi
                  </CardTitle>
                  <CardDescription>Artikel terbaru yang memerlukan kelulusan</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentPending?.length ? (
                    <div className="space-y-3">
                      {recentPending.map((article: any) => (
                        <Link
                          key={article.id}
                          to={`/admin/moderation?article=${article.id}`}
                          className="block rounded-lg border p-3 transition-colors hover:bg-muted"
                        >
                          <p className="line-clamp-1 font-medium">{article.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {article.source?.name} • {new Date(article.created_at).toLocaleDateString('ms-MY')}
                          </p>
                        </Link>
                      ))}
                      <Button asChild variant="outline" className="w-full">
                        <Link to="/admin/moderation">Lihat Semua</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-6 text-center">
                      <AlertCircle className="h-10 w-10 text-muted-foreground" />
                      <p className="mt-2 text-muted-foreground">Tiada artikel menunggu moderasi</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Top Articles */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Artikel Popular
                  </CardTitle>
                  <CardDescription>Artikel dengan tontonan tertinggi</CardDescription>
                </CardHeader>
                <CardContent>
                  {topArticles?.length ? (
                    <div className="space-y-3">
                      {topArticles.slice(0, 5).map((article: any, index: number) => (
                        <Link
                          key={article.id}
                          to={`/admin/articles?article=${article.id}`}
                          className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
                        >
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                            {index + 1}
                          </span>
                          <div className="flex-1 overflow-hidden">
                            <p className="line-clamp-1 font-medium">{article.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {article.view_count.toLocaleString()} tontonan
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-6 text-center">
                      <TrendingUp className="h-10 w-10 text-muted-foreground" />
                      <p className="mt-2 text-muted-foreground">Tiada data tontonan lagi</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Analytics Stats */}
            <AnalyticsStatsCards
              totalViews={analytics?.totalViews}
              todayViews={analytics?.todayViews}
              weeklyGrowth={analytics?.weeklyGrowth}
              isLoading={analyticsLoading}
            />

            {/* Views Chart - Full Width */}
            <ViewsChart data={analytics?.dailyViews} isLoading={analyticsLoading} />

            {/* Category & Source Charts */}
            <div className="grid gap-6 lg:grid-cols-2">
              <CategoryChart data={analytics?.categoryBreakdown} isLoading={analyticsLoading} />
              <SourceChart data={analytics?.sourceBreakdown} isLoading={analyticsLoading} />
            </div>

            {/* Publishing Trends & Top Articles */}
            <div className="grid gap-6 lg:grid-cols-2">
              <PublishingChart data={analytics?.publishingTrends} isLoading={analyticsLoading} />
              <TopArticlesTable data={topArticles} isLoading={topArticlesLoading} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
