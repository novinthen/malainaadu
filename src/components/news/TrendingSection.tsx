import { Link } from 'react-router-dom';
import { TrendingUp, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ArticleCard } from './ArticleCard';
import { useTrendingArticles } from '@/hooks/useArticles';
import { Skeleton } from '@/components/ui/skeleton';

export function TrendingSection() {
  const { data: articles, isLoading } = useTrendingArticles(5);

  return (
    <section className="py-6 md:py-8">
      <div className="container">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
              <TrendingUp className="h-4 w-4 text-accent-foreground" />
            </div>
            <h2 className="font-display text-lg font-bold md:text-xl">
              டிரெண்டிங்
            </h2>
          </div>
          <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
            <Link to="/trending">
              அனைத்தும்
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide md:grid md:grid-cols-5 md:gap-4 md:overflow-visible">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-[200px] shrink-0 md:w-auto">
                <Skeleton className="aspect-[4/3] w-full rounded-lg" />
                <Skeleton className="mt-2 h-4 w-3/4" />
                <Skeleton className="mt-1 h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : articles?.length ? (
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide md:grid md:grid-cols-5 md:gap-4 md:overflow-visible">
            {articles.map((article, index) => (
              <div key={article.id} className="w-[200px] shrink-0 md:w-auto">
                <Link
                  to={`/berita/${article.slug}`}
                  className="group relative block overflow-hidden rounded-lg"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {article.image_url ? (
                      <img
                        src={article.image_url}
                        alt={article.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted">
                        <span className="text-2xl text-muted-foreground">📰</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <span className="absolute -top-6 left-3 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                        {index + 1}
                      </span>
                      <h3 className="line-clamp-2 text-sm font-semibold text-white">
                        {article.title}
                      </h3>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">டிரெண்டிங் செய்திகள் இல்லை.</p>
        )}

        <div className="mt-4 flex justify-center sm:hidden">
          <Button variant="outline" size="sm" asChild>
            <Link to="/trending">
              அனைத்து டிரெண்டிங்
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
