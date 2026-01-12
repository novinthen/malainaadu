import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Article, ArticleStatus } from '@/types/database';

// Shared select statement for article queries
const ARTICLE_SELECT = `
  *,
  source:sources(*),
  category:categories(*)
` as const;

// Query key factory for type-safe and consistent cache keys
export const articleKeys = {
  all: ['articles'] as const,
  lists: () => [...articleKeys.all, 'list'] as const,
  list: (filters: ArticleFilters) => [...articleKeys.lists(), filters] as const,
  details: () => [...articleKeys.all, 'detail'] as const,
  detail: (slugOrId: string) => [...articleKeys.details(), slugOrId] as const,
  trending: (limit: number) => [...articleKeys.all, 'trending', limit] as const,
  breaking: () => [...articleKeys.all, 'breaking'] as const,
};

export interface ArticleFilters {
  status?: ArticleStatus;
  categorySlug?: string;
  sourceId?: string;
  limit?: number;
  featured?: boolean;
  breaking?: boolean;
}

/**
 * Build a Supabase query with common article filters
 */
function buildArticleQuery(options?: ArticleFilters) {
  let query = supabase
    .from('articles')
    .select(ARTICLE_SELECT)
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

  return query;
}

export function useArticles(options?: ArticleFilters) {
  return useQuery({
    queryKey: articleKeys.list(options || {}),
    queryFn: async () => {
      const { data, error } = await buildArticleQuery(options);
      if (error) throw error;
      return data as Article[];
    },
  });
}

export function useArticle(slugOrId: string) {
  // Check if this is a UUID (for backward compatibility with old URLs)
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
  
  return useQuery({
    queryKey: articleKeys.detail(slugOrId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select(ARTICLE_SELECT)
        .eq(isUUID ? 'id' : 'slug', slugOrId)
        .single();

      if (error) throw error;
      return data as Article;
    },
    enabled: !!slugOrId,
  });
}

export function useTrendingArticles(limit = 5) {
  return useQuery({
    queryKey: articleKeys.trending(limit),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select(ARTICLE_SELECT)
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
    queryKey: articleKeys.breaking(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select(ARTICLE_SELECT)
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
      queryClient.invalidateQueries({ queryKey: articleKeys.detail(articleId) });
      queryClient.invalidateQueries({ queryKey: articleKeys.trending(5) });
    },
  });
}
