import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Filter, Eye, Edit, Trash2, Star, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { useCategories } from '@/hooks/useCategories';
import { useSources } from '@/hooks/useSources';
import { toast } from 'sonner';
import type { Article, ArticleStatus } from '@/types/database';

const statusColors: Record<ArticleStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  pending: 'bg-amber-100 text-amber-700',
  published: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

const statusLabels: Record<ArticleStatus, string> = {
  draft: 'Draf',
  pending: 'Menunggu',
  published: 'Diterbitkan',
  rejected: 'Ditolak',
};

export default function ArticlesPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [editArticle, setEditArticle] = useState<Article | null>(null);
  const [deleteArticle, setDeleteArticle] = useState<Article | null>(null);

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editStatus, setEditStatus] = useState<ArticleStatus>('pending');
  const [editFeatured, setEditFeatured] = useState(false);
  const [editBreaking, setEditBreaking] = useState(false);

  const { data: categories } = useCategories();
  const { data: sources } = useSources();

  const { data: articles, isLoading } = useQuery({
    queryKey: ['admin-articles', statusFilter, sourceFilter, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('articles')
        .select(`
          *,
          source:sources(*),
          category:categories(*)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter as ArticleStatus);
      }

      if (sourceFilter !== 'all') {
        query = query.eq('source_id', sourceFilter);
      }

      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Article[];
    },
  });

  const updateArticle = useMutation({
    mutationFn: async () => {
      if (!editArticle) return;

      const { error } = await supabase
        .from('articles')
        .update({
          title: editTitle,
          content: editContent,
          category_id: editCategory || null,
          status: editStatus,
          is_featured: editFeatured,
          is_breaking: editBreaking,
          publish_date: editStatus === 'published' ? new Date().toISOString() : null,
        })
        .eq('id', editArticle.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Artikel telah dikemaskini!');
      setEditArticle(null);
    },
    onError: () => {
      toast.error('Gagal mengemaskini artikel');
    },
  });

  const deleteArticleMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('articles').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Artikel telah dipadam!');
      setDeleteArticle(null);
    },
    onError: () => {
      toast.error('Gagal memadam artikel');
    },
  });

  const openEdit = (article: Article) => {
    setEditArticle(article);
    setEditTitle(article.title);
    setEditContent(article.content);
    setEditCategory(article.category_id || '');
    setEditStatus(article.status);
    setEditFeatured(article.is_featured);
    setEditBreaking(article.is_breaking);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold md:text-3xl">Artikel</h1>
          <p className="text-muted-foreground">Urus semua artikel dalam sistem</p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="flex flex-wrap gap-4 p-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari artikel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="published">Diterbitkan</SelectItem>
                <SelectItem value="pending">Menunggu</SelectItem>
                <SelectItem value="rejected">Ditolak</SelectItem>
                <SelectItem value="draft">Draf</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sumber" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Sumber</SelectItem>
                {sources?.map((source) => (
                  <SelectItem key={source.id} value={source.id}>
                    {source.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Articles Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[300px]">Tajuk</TableHead>
                    <TableHead>Sumber</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Tontonan</TableHead>
                    <TableHead className="text-right">Tindakan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Memuatkan...
                      </TableCell>
                    </TableRow>
                  ) : articles?.length ? (
                    articles.map((article) => (
                      <TableRow key={article.id}>
                        <TableCell>
                          <div className="flex items-start gap-2">
                            {article.is_featured && (
                              <Star className="h-4 w-4 shrink-0 text-amber-500 fill-amber-500" />
                            )}
                            {article.is_breaking && (
                              <Zap className="h-4 w-4 shrink-0 text-red-500 fill-red-500" />
                            )}
                            <span className="line-clamp-2">{article.title}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{article.source?.name || '-'}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{article.category?.name || '-'}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[article.status]}>
                            {statusLabels[article.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {article.view_count.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                            >
                              <a href={`/berita/${article.slug}`} target="_blank" rel="noopener noreferrer">
                                <Eye className="h-4 w-4" />
                              </a>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEdit(article)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeleteArticle(article)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Tiada artikel ditemui
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={!!editArticle} onOpenChange={() => setEditArticle(null)}>
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Artikel</DialogTitle>
              <DialogDescription>Kemaskini maklumat artikel</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Tajuk</Label>
                <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="mt-1" />
              </div>

              <div>
                <Label>Kandungan</Label>
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="mt-1 min-h-[150px]"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Kategori</Label>
                  <Select value={editCategory} onValueChange={setEditCategory}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Status</Label>
                  <Select value={editStatus} onValueChange={(v) => setEditStatus(v as ArticleStatus)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draf</SelectItem>
                      <SelectItem value="pending">Menunggu</SelectItem>
                      <SelectItem value="published">Diterbitkan</SelectItem>
                      <SelectItem value="rejected">Ditolak</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editFeatured}
                    onCheckedChange={setEditFeatured}
                    id="featured"
                  />
                  <Label htmlFor="featured" className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-amber-500" />
                    Artikel Pilihan
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={editBreaking}
                    onCheckedChange={setEditBreaking}
                    id="breaking"
                  />
                  <Label htmlFor="breaking" className="flex items-center gap-1">
                    <Zap className="h-4 w-4 text-red-500" />
                    Berita Terkini
                  </Label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditArticle(null)}>
                Batal
              </Button>
              <Button onClick={() => updateArticle.mutate()} disabled={updateArticle.isPending}>
                Simpan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog open={!!deleteArticle} onOpenChange={() => setDeleteArticle(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Padam Artikel?</DialogTitle>
              <DialogDescription>
                Tindakan ini tidak boleh dibatalkan. Artikel "{deleteArticle?.title}" akan dipadam secara kekal.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteArticle(null)}>
                Batal
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteArticle && deleteArticleMutation.mutate(deleteArticle.id)}
                disabled={deleteArticleMutation.isPending}
              >
                Padam
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
