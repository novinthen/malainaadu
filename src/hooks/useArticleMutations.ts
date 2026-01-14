/**
 * useArticleMutations Hook
 * Admin CRUD mutations for articles including bulk operations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { articleKeys } from '@/hooks/useArticles';
import { toast } from 'sonner';
import { UI_TEXT } from '@/constants/ui';
import type { ArticleStatus } from '@/types/database';

interface UpdateArticleData {
  id: string;
  title: string;
  content: string;
  categoryId: string | null;
  status: ArticleStatus;
  isFeatured: boolean;
  isBreaking: boolean;
}

interface BulkStatusData {
  ids: string[];
  status: ArticleStatus;
}

interface BulkFeaturedData {
  ids: string[];
  isFeatured: boolean;
}

export function useArticleMutations() {
  const queryClient = useQueryClient();

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
    queryClient.invalidateQueries({ queryKey: ['admin-articles-count'] });
    queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    queryClient.invalidateQueries({ queryKey: articleKeys.all });
  };

  const updateArticle = useMutation({
    mutationFn: async (data: UpdateArticleData) => {
      const { error } = await supabase
        .from('articles')
        .update({
          title: data.title,
          content: data.content,
          category_id: data.categoryId || null,
          status: data.status,
          is_featured: data.isFeatured,
          is_breaking: data.isBreaking,
          publish_date: data.status === 'published' ? new Date().toISOString() : null,
        })
        .eq('id', data.id);

      if (error) throw error;
    },
    onSuccess: () => {
      invalidateQueries();
      toast.success(UI_TEXT.articleUpdated);
    },
    onError: () => {
      toast.error(UI_TEXT.updateFailed);
    },
  });

  const deleteArticle = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('articles').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateQueries();
      toast.success(UI_TEXT.articleDeleted);
    },
    onError: () => {
      toast.error(UI_TEXT.deleteFailed);
    },
  });

  // Bulk update status for multiple articles
  const bulkUpdateStatus = useMutation({
    mutationFn: async ({ ids, status }: BulkStatusData) => {
      const { error } = await supabase
        .from('articles')
        .update({
          status,
          publish_date: status === 'published' ? new Date().toISOString() : null,
        })
        .in('id', ids);

      if (error) throw error;
    },
    onSuccess: (_, { ids, status }) => {
      invalidateQueries();
      if (status === 'published') {
        toast.success(UI_TEXT.bulkPublishSuccess.replace('{count}', String(ids.length)));
      }
    },
    onError: () => {
      toast.error(UI_TEXT.updateFailed);
    },
  });

  // Bulk delete multiple articles
  const bulkDelete = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from('articles').delete().in('id', ids);
      if (error) throw error;
    },
    onSuccess: (_, ids) => {
      invalidateQueries();
      toast.success(UI_TEXT.bulkDeleteSuccess.replace('{count}', String(ids.length)));
    },
    onError: () => {
      toast.error(UI_TEXT.deleteFailed);
    },
  });

  // Bulk update featured status
  const bulkUpdateFeatured = useMutation({
    mutationFn: async ({ ids, isFeatured }: BulkFeaturedData) => {
      const { error } = await supabase.from('articles').update({ is_featured: isFeatured }).in('id', ids);

      if (error) throw error;
    },
    onSuccess: (_, { ids, isFeatured }) => {
      invalidateQueries();
      if (isFeatured) {
        toast.success(UI_TEXT.bulkFeatureSuccess.replace('{count}', String(ids.length)));
      } else {
        toast.success(UI_TEXT.bulkUnfeatureSuccess.replace('{count}', String(ids.length)));
      }
    },
    onError: () => {
      toast.error(UI_TEXT.updateFailed);
    },
  });

  return {
    updateArticle,
    deleteArticle,
    bulkUpdateStatus,
    bulkDelete,
    bulkUpdateFeatured,
  };
}
