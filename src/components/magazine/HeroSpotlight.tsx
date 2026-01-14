import { Link } from 'react-router-dom';
import { Star, Eye, Clock } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatRelativeTime } from '@/lib/date-utils';
import { cn } from '@/lib/utils';
import type { Article } from '@/types/database';

interface HeroSpotlightProps {
  article: Article | null | undefined;
  isLoading?: boolean;
}

export function HeroSpotlight({ article, isLoading }: HeroSpotlightProps) {
  if (isLoading) {
    return <HeroSpotlightSkeleton />;
  }

  if (!article) {
    return null;
  }

  const categoryName = article.category?.name;

  return (
    <section className="px-4 py-4 md:py-6">
      <Link 
        to={ROUTES.ARTICLE(article.slug || article.id)}
        className="block group"
      >
        <div className="relative overflow-hidden rounded-2xl gold-spotlight-border">
          {/* Inner container for content */}
          <div className="relative rounded-[calc(1rem-3px)] overflow-hidden">
            {/* Background image */}
            <div className="relative aspect-[16/9] md:aspect-[21/9]">
              <img
                src={article.image_url || '/placeholder.svg'}
                alt={article.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="eager"
              />
              
              {/* Gradient overlay */}
              <div className="spotlight-gradient absolute inset-0" />
            </div>

            {/* Content overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 lg:p-8">
              {/* Badges */}
              <div className="flex items-center gap-2 mb-3">
                {/* Gold Featured Badge */}
                <Badge className="gold-badge">
                  <Star className="w-3.5 h-3.5 mr-1 fill-current" />
                  <span className="font-tamil">சிறப்பு செய்தி</span>
                </Badge>
                
                {/* Category badge */}
                {categoryName && (
                  <Badge variant="secondary" className="bg-white/20 text-white border-0 backdrop-blur-sm">
                    <span className="font-tamil">{categoryName}</span>
                  </Badge>
                )}
                
                {/* Breaking badge */}
                {article.is_breaking && (
                  <Badge className="breaking-badge">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                    </span>
                    <span className="font-tamil">அவசரச் செய்தி</span>
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h1 className={cn(
                "font-tamil font-bold text-white leading-tight",
                "text-xl md:text-3xl lg:text-4xl xl:text-5xl",
                "line-clamp-3 md:line-clamp-2",
                "spotlight-title"
              )}>
                {article.title}
              </h1>

              {/* Excerpt - desktop only */}
              {article.excerpt && (
                <p className="hidden md:block font-tamil text-white/85 mt-3 text-base lg:text-lg line-clamp-2 max-w-3xl">
                  {article.excerpt}
                </p>
              )}

              {/* Meta info */}
              <div className="flex items-center gap-4 mt-3 md:mt-4 text-white/70 text-sm">
                {article.publish_date && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="font-tamil">
                      {formatRelativeTime(article.publish_date)}
                    </span>
                  </div>
                )}
                
                {article.view_count > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{article.view_count.toLocaleString('ta-IN')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </section>
  );
}

function HeroSpotlightSkeleton() {
  return (
    <section className="px-4 py-4 md:py-6">
      <div className="relative overflow-hidden rounded-2xl p-[3px] bg-gradient-to-br from-accent/50 via-accent/30 to-accent/50">
        <div className="relative rounded-[calc(1rem-3px)] overflow-hidden bg-muted">
          <div className="relative aspect-[16/9] md:aspect-[21/9]">
            <Skeleton className="w-full h-full" />
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 lg:p-8 space-y-3">
              <div className="flex gap-2">
                <Skeleton className="h-6 w-28" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-8 md:h-12 w-3/4" />
              <Skeleton className="hidden md:block h-5 w-2/3" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
