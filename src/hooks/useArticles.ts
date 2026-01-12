import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Article, ArticleStatus } from '@/types/database';

export function useArticles(options?: {
  status?: ArticleStatus;
  categorySlug?: string;
  sourceId?: string;
  limit?: number;
  featured?: boolean;
  breaking?: boolean;
}) {
  return useQuery({
    queryKey: ['articles', options],
    queryFn: async () => {
      let query = supabase
        .from('articles')
        .select(`
          *,
          source:sources(*),
          category:categories(*)
        `)
        .order('publish_date', { ascending: false });

      if (options?.status) {
        query = query.eq('status', options.status);
      }

      if (options?.categorySlug) {
        query = query.eq('category.slug', options.categorySlug);
      }

      if (options?.sourceId) {
        query = query.eq('source_id', options.sourceId);
      }

      if (options?.featured !== undefined) {
        query = query.eq('is_featured', options.featured);
      }

      if (options?.breaking !== undefined) {
        query = query.eq('is_breaking', options.breaking);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Article[];
    },
  });
}

export function useArticle(slug: string) {
  return useQuery({
    queryKey: ['article', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          source:sources(*),
          category:categories(*)
        `)
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return data as Article;
    },
    enabled: !!slug,
  });
}

export function useTrendingArticles(limit = 5) {
  return useQuery({
    queryKey: ['articles', 'trending', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          source:sources(*),
          category:categories(*)
        `)
        .eq('status', 'published')
        .order('view_count', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as Article[];
    },
  });
}

export function useBreakingNews() {
  return useQuery({
    queryKey: ['articles', 'breaking'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          source:sources(*),
          category:categories(*)
        `)
        .eq('status', 'published')
        .eq('is_breaking', true)
        .order('publish_date', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as Article[];
    },
  });
}

export function useRecordView() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (articleId: string) => {
      // Record the view (this is public insert)
      await supabase
        .from('article_views')
        .insert({ article_id: articleId });
    },
    onSuccess: (_, articleId) => {
      queryClient.invalidateQueries({ queryKey: ['article', articleId] });
      queryClient.invalidateQueries({ queryKey: ['articles', 'trending'] });
    },
  });
}
