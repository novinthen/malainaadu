import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  ArticleFilters,
  ArticlesTable,
  ArticleEditDialog,
  ArticleDeleteDialog,
  BulkActionsBar,
} from '@/components/admin/articles';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useCategories } from '@/hooks/useCategories';
import { useSources } from '@/hooks/useSources';
import { useArticleMutations } from '@/hooks/useArticleMutations';
import { DEFAULTS, UI_TEXT } from '@/constants/ui';
import type { Article, ArticleStatus } from '@/types/database';

const PAGE_SIZE = 20;

export default function ArticlesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [editArticle, setEditArticle] = useState<Article | null>(null);
  const [deleteArticle, setDeleteArticle] = useState<Article | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

  const { data: categories } = useCategories();
  const { data: sources } = useSources();
  const {
    updateArticle,
    deleteArticle: deleteArticleMutation,
    bulkUpdateStatus,
    bulkDelete,
    bulkUpdateFeatured,
  } = useArticleMutations();

  // Fetch total count
  const { data: totalCount } = useQuery({
    queryKey: ['admin-articles-count', statusFilter, sourceFilter, searchQuery],
    queryFn: async () => {
      let query = supabase.from('articles').select('*', { count: 'exact', head: true });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter as ArticleStatus);
      }
      if (sourceFilter !== 'all') {
        query = query.eq('source_id', sourceFilter);
      }
      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      const { count, error } = await query;
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch paginated articles
  const { data: articles, isLoading } = useQuery({
    queryKey: ['admin-articles', statusFilter, sourceFilter, searchQuery, currentPage],
    queryFn: async () => {
      const offset = (currentPage - 1) * PAGE_SIZE;

      let query = supabase
        .from('articles')
        .select(
          `
          *,
          source:sources(*),
          category:categories(*)
        `
        )
        .order('created_at', { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);

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

  const totalPages = Math.ceil((totalCount || 0) / PAGE_SIZE);

  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleSourceChange = (value: string) => {
    setSourceFilter(value);
    setCurrentPage(1);
  };

  const handleSave = (data: {
    title: string;
    content: string;
    categoryId: string | null;
    status: ArticleStatus;
    isFeatured: boolean;
    isBreaking: boolean;
  }) => {
    if (!editArticle) return;

    updateArticle.mutate({ id: editArticle.id, ...data }, { onSuccess: () => setEditArticle(null) });
  };

  const handleDelete = () => {
    if (!deleteArticle) return;

    deleteArticleMutation.mutate(deleteArticle.id, {
      onSuccess: () => setDeleteArticle(null),
    });
  };

  // Bulk action handlers
  const handleBulkPublish = () => {
    bulkUpdateStatus.mutate(
      { ids: selectedIds, status: 'published' },
      { onSuccess: () => setSelectedIds([]) }
    );
  };

  const handleBulkFeature = () => {
    bulkUpdateFeatured.mutate(
      { ids: selectedIds, isFeatured: true },
      { onSuccess: () => setSelectedIds([]) }
    );
  };

  const handleBulkUnfeature = () => {
    bulkUpdateFeatured.mutate(
      { ids: selectedIds, isFeatured: false },
      { onSuccess: () => setSelectedIds([]) }
    );
  };

  const handleBulkDelete = () => {
    bulkDelete.mutate(selectedIds, {
      onSuccess: () => {
        setSelectedIds([]);
        setShowBulkDeleteDialog(false);
      },
    });
  };

  const isBulkLoading =
    bulkUpdateStatus.isPending || bulkDelete.isPending || bulkUpdateFeatured.isPending;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold md:text-3xl">Artikel</h1>
          <p className="text-muted-foreground">Urus semua artikel dalam sistem</p>
        </div>

        <ArticleFilters
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          statusFilter={statusFilter}
          onStatusChange={handleStatusChange}
          sourceFilter={sourceFilter}
          onSourceChange={handleSourceChange}
          sources={sources}
        />

        <ArticlesTable
          articles={articles}
          isLoading={isLoading}
          onEdit={setEditArticle}
          onDelete={setDeleteArticle}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
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

        {/* Bulk Actions Bar */}
        <BulkActionsBar
          selectedCount={selectedIds.length}
          onPublish={handleBulkPublish}
          onFeature={handleBulkFeature}
          onUnfeature={handleBulkUnfeature}
          onDelete={() => setShowBulkDeleteDialog(true)}
          onClear={() => setSelectedIds([])}
          isLoading={isBulkLoading}
        />

        {/* Bulk Delete Confirmation */}
        <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{UI_TEXT.bulkDeleteConfirmTitle}</AlertDialogTitle>
              <AlertDialogDescription>
                {UI_TEXT.bulkDeleteConfirmDesc.replace('{count}', String(selectedIds.length))}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{UI_TEXT.cancel}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleBulkDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {UI_TEXT.delete}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
