import { ArticleCard } from './ArticleCard';
import { Skeleton } from '@/components/ui/skeleton';
import type { Article } from '@/types/database';

interface ArticleGridProps {
  articles: Article[] | undefined;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function ArticleGrid({ articles, isLoading, emptyMessage = 'Tiada berita ditemui.' }: ArticleGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-[16/10] w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        ))}
      </div>
    );
  }

  if (!articles?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <span className="text-4xl">📰</span>
        <p className="mt-2 text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
