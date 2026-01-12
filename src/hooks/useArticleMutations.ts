/**
 * useArticleMutations Hook
 * Admin CRUD mutations for articles
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

export function useArticleMutations() {
  const queryClient = useQueryClient();

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
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      queryClient.invalidateQueries({ queryKey: articleKeys.all });
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
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      queryClient.invalidateQueries({ queryKey: articleKeys.all });
      toast.success(UI_TEXT.articleDeleted);
    },
    onError: () => {
      toast.error(UI_TEXT.deleteFailed);
    },
  });

  return { updateArticle, deleteArticle };
}
