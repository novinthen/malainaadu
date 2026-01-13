import { Link } from 'react-router-dom';
import { TrendingUp, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Article } from '@/types/database';
import { Skeleton } from '@/components/ui/skeleton';

interface TrendingBarProps {
  articles: Article[];
  isLoading?: boolean;
  className?: string;
}

export function TrendingBar({ articles, isLoading, className }: TrendingBarProps) {
  if (isLoading) {
    return (
      <div className={cn('py-4 px-4', className)}>
        <div className="flex items-center gap-3 mb-3">
          <Skeleton className="w-5 h-5" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="flex gap-3 overflow-hidden">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="flex-shrink-0 w-[200px] h-20 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!articles.length) {
    return null;
  }

  return (
    <section className={cn('py-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-full bg-gold/10">
            <TrendingUp className="w-4 h-4 text-gold" />
          </div>
          <h2 className="font-tamil font-bold text-base text-foreground">
            டிரெண்டிங்
          </h2>
        </div>
        <Link
          to="/trending"
          className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          அனைத்தும்
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Horizontal Scroll */}
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-none snap-x snap-mandatory">
        {articles.slice(0, 8).map((article, index) => (
          <Link
            key={article.id}
            to={`/berita/${article.slug || article.id}`}
            className={cn(
              'flex-shrink-0 w-[200px] snap-start',
              'bg-card rounded-lg p-3 shadow-sm',
              'border border-border/50',
              'touch-feedback transition-shadow hover:shadow-md'
            )}
          >
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center">
                <span className="text-xs font-bold text-gold">{index + 1}</span>
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="font-tamil font-semibold text-sm leading-snug line-clamp-2 text-foreground">
                  {article.title}
                </h3>
                {article.category && (
                  <span className="text-xs text-muted-foreground mt-1 block">
                    {article.category.name}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
