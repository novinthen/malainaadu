import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArticleCard } from './ArticleCard';
import { CompactArticleSkeleton } from '@/components/ui/loading-states';
import type { Article } from '@/types/database';

interface RelatedArticlesProps {
  currentArticleId: string;
  categoryId?: string | null;
  sourceId?: string | null;
}

export function RelatedArticles({
  currentArticleId,
  categoryId,
  sourceId,
}: RelatedArticlesProps) {
  const { data: categoryArticles, isLoading: categoryLoading } = useQuery({
    queryKey: ['related-articles', 'category', categoryId, currentArticleId],
    queryFn: async () => {
      if (!categoryId) return [];
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          category:categories(*),
          source:sources(*)
        `)
        .eq('status', 'published')
        .eq('category_id', categoryId)
        .neq('id', currentArticleId)
        .order('publish_date', { ascending: false })
        .limit(3);

      if (error) throw error;
      return data as Article[];
    },
    enabled: !!categoryId,
  });

  const { data: sourceArticles, isLoading: sourceLoading } = useQuery({
    queryKey: ['related-articles', 'source', sourceId, currentArticleId],
    queryFn: async () => {
      if (!sourceId) return [];
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          category:categories(*),
          source:sources(*)
        `)
        .eq('status', 'published')
        .eq('source_id', sourceId)
        .neq('id', currentArticleId)
        .order('publish_date', { ascending: false })
        .limit(2);

      if (error) throw error;
      return data as Article[];
    },
    enabled: !!sourceId,
  });

  const isLoading = categoryLoading || sourceLoading;
  const hasRelatedArticles =
    (categoryArticles && categoryArticles.length > 0) ||
    (sourceArticles && sourceArticles.length > 0);

  if (!hasRelatedArticles && !isLoading) {
    return null;
  }

  return (
    <section className="mt-12 border-t pt-8">
      {/* Same Category Articles */}
      {categoryArticles && categoryArticles.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 font-display text-lg font-bold md:text-xl">
            தொடர்புடைய செய்திகள்
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categoryArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      )}

      {/* Same Source Articles */}
      {sourceArticles && sourceArticles.length > 0 && (
        <div>
          <h2 className="mb-4 font-display text-lg font-bold md:text-xl">
            {sourceArticles[0]?.source?.name} இலிருந்து மேலும்
          </h2>
          <div className="space-y-2">
            {sourceArticles.map((article) => (
              <ArticleCard key={article.id} article={article} variant="compact" />
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <CompactArticleSkeleton key={i} />
          ))}
        </div>
      )}
    </section>
  );
}
