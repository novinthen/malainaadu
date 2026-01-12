import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ArticleFilters, ArticlesTable, ArticleEditDialog, ArticleDeleteDialog } from '@/components/admin/articles';
import { supabase } from '@/integrations/supabase/client';
import { useCategories } from '@/hooks/useCategories';
import { useSources } from '@/hooks/useSources';
import { useArticleMutations } from '@/hooks/useArticleMutations';
import { DEFAULTS } from '@/constants/ui';
import type { Article, ArticleStatus } from '@/types/database';

export default function ArticlesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [editArticle, setEditArticle] = useState<Article | null>(null);
  const [deleteArticle, setDeleteArticle] = useState<Article | null>(null);

  const { data: categories } = useCategories();
  const { data: sources } = useSources();
  const { updateArticle, deleteArticle: deleteArticleMutation } = useArticleMutations();

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
        .limit(DEFAULTS.adminArticlesLimit);

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

  const handleSave = (data: {
    title: string;
    content: string;
    categoryId: string | null;
    status: ArticleStatus;
    isFeatured: boolean;
    isBreaking: boolean;
  }) => {
    if (!editArticle) return;
    
    updateArticle.mutate(
      { id: editArticle.id, ...data },
      { onSuccess: () => setEditArticle(null) }
    );
  };

  const handleDelete = () => {
    if (!deleteArticle) return;
    
    deleteArticleMutation.mutate(deleteArticle.id, {
      onSuccess: () => setDeleteArticle(null),
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold md:text-3xl">Artikel</h1>
          <p className="text-muted-foreground">Urus semua artikel dalam sistem</p>
        </div>

        <ArticleFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          sourceFilter={sourceFilter}
          onSourceChange={setSourceFilter}
          sources={sources}
        />

        <ArticlesTable
          articles={articles}
          isLoading={isLoading}
          onEdit={setEditArticle}
          onDelete={setDeleteArticle}
        />

        <ArticleEditDialog
          article={editArticle}
          categories={categories}
          isLoading={updateArticle.isPending}
          onClose={() => setEditArticle(null)}
          onSave={handleSave}
        />

        <ArticleDeleteDialog
          article={deleteArticle}
          isLoading={deleteArticleMutation.isPending}
          onClose={() => setDeleteArticle(null)}
          onConfirm={handleDelete}
        />
      </div>
    </AdminLayout>
  );
}
