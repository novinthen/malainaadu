import { MainLayout } from '@/components/layout/MainLayout';
import { ArticleCard } from '@/components/news/ArticleCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useTrendingArticles } from '@/hooks/useArticles';
import { TrendingUp } from 'lucide-react';

export default function TrendingPage() {
  const { data: articles, isLoading } = useTrendingArticles(20);

  return (
    <MainLayout>
      <section className="py-6 md:py-8">
        <div className="container">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
              <TrendingUp className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold md:text-3xl">
                Berita Trending
              </h1>
              <p className="text-sm text-muted-foreground">
                Berita paling popular berdasarkan jumlah bacaan
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-6 w-6 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : articles?.length ? (
            <div className="space-y-4">
              {articles.map((article, index) => (
                <div key={article.id} className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <ArticleCard article={article} variant="compact" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">
                Tiada berita trending buat masa ini.
              </p>
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
}
