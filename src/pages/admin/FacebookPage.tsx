import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ms } from 'date-fns/locale';
import {
  Facebook,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Send,
  AlertTriangle,
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface FacebookLog {
  id: string;
  article_id: string;
  status: string;
  error_message: string | null;
  attempted_at: string;
  article: {
    title: string;
    slug: string;
    image_url: string | null;
  } | null;
}

interface UnpostedArticle {
  id: string;
  title: string;
  slug: string;
  image_url: string | null;
  publish_date: string | null;
  posted_to_facebook: boolean;
}

export default function FacebookPage() {
  const queryClient = useQueryClient();
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('queue');

  // Fetch posting logs
  const { data: logs, isLoading: logsLoading } = useQuery({
    queryKey: ['facebook-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('facebook_post_logs')
        .select(`
          id,
          article_id,
          status,
          error_message,
          attempted_at,
          article:articles(title, slug, image_url)
        `)
        .order('attempted_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as unknown as FacebookLog[];
    },
  });

  // Fetch unposted articles
  const { data: unpostedArticles, isLoading: articlesLoading } = useQuery({
    queryKey: ['unposted-articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('id, title, slug, image_url, publish_date, posted_to_facebook')
        .eq('status', 'published')
        .eq('posted_to_facebook', false)
        .order('publish_date', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as UnpostedArticle[];
    },
  });

  // Post to Facebook mutation
  const postMutation = useMutation({
    mutationFn: async (articleId: string) => {
      const { data, error } = await supabase.functions.invoke('post-to-facebook', {
        body: { article_id: articleId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facebook-logs'] });
      queryClient.invalidateQueries({ queryKey: ['unposted-articles'] });
      toast.success('Artikel berjaya dihantar ke Facebook');
    },
    onError: (error: Error) => {
      toast.error(`Gagal menghantar ke Facebook: ${error.message}`);
    },
  });

  // Bulk post mutation
  const bulkPostMutation = useMutation({
    mutationFn: async (articleIds: string[]) => {
      const results = await Promise.allSettled(
        articleIds.map((id) =>
          supabase.functions.invoke('post-to-facebook', {
            body: { article_id: id },
          })
        )
      );
      const failed = results.filter((r) => r.status === 'rejected').length;
      return { total: articleIds.length, failed };
    },
    onSuccess: ({ total, failed }) => {
      queryClient.invalidateQueries({ queryKey: ['facebook-logs'] });
      queryClient.invalidateQueries({ queryKey: ['unposted-articles'] });
      setSelectedArticles([]);
      if (failed === 0) {
        toast.success(`${total} artikel berjaya dihantar ke Facebook`);
      } else {
        toast.warning(`${total - failed}/${total} artikel berjaya dihantar`);
      }
    },
    onError: () => {
      toast.error('Gagal menghantar artikel');
    },
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked && unpostedArticles) {
      setSelectedArticles(unpostedArticles.map((a) => a.id));
    } else {
      setSelectedArticles([]);
    }
  };

  const handleSelectOne = (articleId: string, checked: boolean) => {
    if (checked) {
      setSelectedArticles([...selectedArticles, articleId]);
    } else {
      setSelectedArticles(selectedArticles.filter((id) => id !== articleId));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Berjaya
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Gagal
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Clock className="mr-1 h-3 w-3" />
            Menunggu
          </Badge>
        );
    }
  };

  // Stats
  const successCount = logs?.filter((l) => l.status === 'success').length || 0;
  const failedCount = logs?.filter((l) => l.status === 'failed').length || 0;
  const pendingCount = unpostedArticles?.length || 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <Facebook className="h-6 w-6 text-blue-600" />
              Pengurusan Facebook
            </h1>
            <p className="text-muted-foreground">
              Urus penerbitan automatik ke halaman Facebook
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Belum Dihantar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                <span className="text-2xl font-bold">{pendingCount}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Berjaya (24j)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-2xl font-bold">{successCount}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Gagal (24j)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <span className="text-2xl font-bold">{failedCount}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="queue">
              Barisan Menunggu
              {pendingCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history">Sejarah</TabsTrigger>
          </TabsList>

          {/* Queue Tab */}
          <TabsContent value="queue" className="space-y-4">
            {selectedArticles.length > 0 && (
              <Card className="border-primary">
                <CardContent className="flex items-center justify-between py-3">
                  <span className="text-sm font-medium">
                    {selectedArticles.length} artikel dipilih
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedArticles([])}
                    >
                      Batal
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => bulkPostMutation.mutate(selectedArticles)}
                      disabled={bulkPostMutation.isPending}
                    >
                      {bulkPostMutation.isPending ? (
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="mr-2 h-4 w-4" />
                      )}
                      Hantar Semua
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Artikel Belum Dihantar</CardTitle>
                <CardDescription>
                  Artikel yang telah diterbitkan tetapi belum dihantar ke Facebook
                </CardDescription>
              </CardHeader>
              <CardContent>
                {articlesLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : unpostedArticles && unpostedArticles.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={
                              selectedArticles.length === unpostedArticles.length &&
                              unpostedArticles.length > 0
                            }
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead>Artikel</TableHead>
                        <TableHead className="hidden sm:table-cell">Tarikh</TableHead>
                        <TableHead className="text-right">Tindakan</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {unpostedArticles.map((article) => (
                        <TableRow key={article.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedArticles.includes(article.id)}
                              onCheckedChange={(checked) =>
                                handleSelectOne(article.id, !!checked)
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {article.image_url && (
                                <img
                                  src={article.image_url}
                                  alt=""
                                  className="h-10 w-10 rounded object-cover"
                                />
                              )}
                              <div className="min-w-0">
                                <p className="truncate font-medium">{article.title}</p>
                                <a
                                  href={`/berita/${article.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                                >
                                  Lihat artikel
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {article.publish_date
                              ? format(new Date(article.publish_date), 'dd MMM yyyy', {
                                  locale: ms,
                                })
                              : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => postMutation.mutate(article.id)}
                              disabled={postMutation.isPending}
                            >
                              {postMutation.isPending ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <Send className="h-4 w-4" />
                              )}
                              <span className="ml-2 hidden sm:inline">Hantar</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <CheckCircle2 className="mb-4 h-12 w-12 text-green-500" />
                    <p className="text-lg font-medium">Semua artikel telah dihantar</p>
                    <p className="text-sm text-muted-foreground">
                      Tiada artikel dalam barisan menunggu
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Sejarah Penghantaran</CardTitle>
                <CardDescription>50 percubaan penghantaran terkini</CardDescription>
              </CardHeader>
              <CardContent>
                {logsLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : logs && logs.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Artikel</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden sm:table-cell">Masa</TableHead>
                        <TableHead className="text-right">Tindakan</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            <div className="min-w-0">
                              <p className="truncate font-medium">
                                {log.article?.title || 'Artikel tidak dijumpai'}
                              </p>
                              {log.error_message && (
                                <p className="flex items-center gap-1 truncate text-xs text-destructive">
                                  <AlertTriangle className="h-3 w-3" />
                                  {log.error_message.substring(0, 50)}...
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(log.status)}</TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {format(new Date(log.attempted_at), 'dd MMM, HH:mm', {
                              locale: ms,
                            })}
                          </TableCell>
                          <TableCell className="text-right">
                            {log.status === 'failed' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => postMutation.mutate(log.article_id)}
                                disabled={postMutation.isPending}
                              >
                                <RefreshCw className="h-4 w-4" />
                                <span className="ml-2 hidden sm:inline">Cuba Lagi</span>
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Clock className="mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-lg font-medium">Tiada sejarah</p>
                    <p className="text-sm text-muted-foreground">
                      Belum ada percubaan penghantaran ke Facebook
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
