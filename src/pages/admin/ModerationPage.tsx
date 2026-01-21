import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X, Eye, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { useCategories } from '@/hooks/useCategories';
import { toast } from 'sonner';
import type { Article } from '@/types/database';

export default function ModerationPage() {
  const queryClient = useQueryClient();
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [editedCategory, setEditedCategory] = useState('');
  const [showOriginal, setShowOriginal] = useState(false);

  const { data: categories } = useCategories();

  const { data: pendingArticles, isLoading } = useQuery({
    queryKey: ['pending-articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          source:sources(*),
          category:categories(*)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Article[];
    },
  });

  const approveArticle = useMutation({
    mutationFn: async ({ id, title, content, categoryId }: { id: string; title: string; content: string; categoryId: string }) => {
      const { error } = await supabase
        .from('articles')
        .update({
          title,
          content,
          category_id: categoryId,
          status: 'published',
          publish_date: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      
      // Trigger Facebook posting
      try {
        await supabase.functions.invoke('post-to-facebook', {
          body: { article_id: id },
        });
        console.log('Facebook post triggered for article:', id);
      } catch (fbError) {
        console.error('Facebook post trigger failed:', fbError);
        // Don't block approval - FB post can be retried from admin panel
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-articles'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Artikel telah diluluskan dan dihantar ke Facebook!');
      setSelectedArticle(null);
    },
    onError: () => {
      toast.error('Gagal meluluskan artikel');
    },
  });

  const rejectArticle = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('articles')
        .update({ status: 'rejected' })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-articles'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Artikel telah ditolak');
      setSelectedArticle(null);
    },
    onError: () => {
      toast.error('Gagal menolak artikel');
    },
  });

  const openArticle = (article: Article) => {
    setSelectedArticle(article);
    setEditedTitle(article.title);
    setEditedContent(article.content);
    setEditedCategory(article.category_id || '');
    setShowOriginal(false);
  };

  const handleApprove = () => {
    if (!selectedArticle) return;
    approveArticle.mutate({
      id: selectedArticle.id,
      title: editedTitle,
      content: editedContent,
      categoryId: editedCategory,
    });
  };

  const handleReject = () => {
    if (!selectedArticle) return;
    rejectArticle.mutate(selectedArticle.id);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold md:text-3xl">Moderasi Kandungan</h1>
          <p className="text-muted-foreground">
            Semak dan luluskan artikel sebelum diterbitkan
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-5 w-3/4 rounded bg-muted" />
                  <div className="h-4 w-1/2 rounded bg-muted" />
                </CardHeader>
                <CardContent>
                  <div className="h-20 rounded bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : pendingArticles?.length ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendingArticles.map((article) => (
              <Card key={article.id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="outline" className="shrink-0">
                      {article.source?.name}
                    </Badge>
                    {article.category && (
                      <Badge variant="secondary" className="shrink-0">
                        {article.category.name}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="line-clamp-2 text-base">
                    {article.title}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {new Date(article.created_at).toLocaleString('ms-MY')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col">
                  {article.image_url && (
                    <img
                      src={article.image_url}
                      alt={article.title}
                      className="mb-3 h-32 w-full rounded-md object-cover"
                    />
                  )}
                  <p className="line-clamp-3 flex-1 text-sm text-muted-foreground">
                    {article.excerpt || article.content.substring(0, 150)}...
                  </p>
                  <Button
                    onClick={() => openArticle(article)}
                    className="mt-4 w-full"
                    variant="outline"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Semak & Luluskan
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold">Tiada Artikel Menunggu</h3>
              <p className="text-muted-foreground">
                Semua artikel telah dimoderasi. Artikel baharu akan muncul di sini.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Article Review Modal */}
        <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
          <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Semak Artikel</DialogTitle>
              <DialogDescription>
                Edit kandungan jika perlu, kemudian luluskan atau tolak artikel ini.
              </DialogDescription>
            </DialogHeader>

            {selectedArticle && (
              <div className="space-y-4">
                {/* Toggle Original/Edited */}
                <div className="flex gap-2">
                  <Button
                    variant={!showOriginal ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setShowOriginal(false)}
                  >
                    Kandungan AI
                  </Button>
                  <Button
                    variant={showOriginal ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setShowOriginal(true)}
                  >
                    Kandungan Asal
                  </Button>
                  {selectedArticle.original_url && (
                    <Button variant="ghost" size="sm" asChild className="ml-auto">
                      <a href={selectedArticle.original_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-1 h-4 w-4" />
                        Sumber Asal
                      </a>
                    </Button>
                  )}
                </div>

                {/* Image */}
                {selectedArticle.image_url && (
                  <img
                    src={selectedArticle.image_url}
                    alt={selectedArticle.title}
                    className="h-48 w-full rounded-lg object-cover"
                  />
                )}

                {/* Source & Category */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{selectedArticle.source?.name}</Badge>
                  <Select value={editedCategory} onValueChange={setEditedCategory}>
                    <SelectTrigger className="w-[180px]">
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

                {showOriginal ? (
                  <div className="space-y-4 rounded-lg bg-muted p-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Tajuk Asal</label>
                      <p className="mt-1 font-medium">{selectedArticle.original_title}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Kandungan Asal</label>
                      <p className="mt-1 whitespace-pre-wrap text-sm">{selectedArticle.original_content}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Tajuk</label>
                      <Input
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Kandungan</label>
                      <Textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="mt-1 min-h-[200px]"
                      />
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-2 border-t pt-4">
                  <Button
                    variant="destructive"
                    onClick={handleReject}
                    disabled={rejectArticle.isPending}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Tolak
                  </Button>
                  <Button
                    onClick={handleApprove}
                    disabled={approveArticle.isPending || !editedCategory}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Luluskan & Terbit
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
