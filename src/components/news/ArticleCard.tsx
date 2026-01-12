import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ms } from 'date-fns/locale';
import { Eye, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { Article } from '@/types/database';
import { cn } from '@/lib/utils';

interface ArticleCardProps {
  article: Article;
  variant?: 'default' | 'featured' | 'compact';
  className?: string;
}

export function ArticleCard({ article, variant = 'default', className }: ArticleCardProps) {
  const timeAgo = article.publish_date
    ? formatDistanceToNow(new Date(article.publish_date), { addSuffix: true, locale: ms })
    : null;

  if (variant === 'featured') {
    return (
      <Link to={`/berita/${article.slug}`} className={cn('group block', className)}>
        <Card className="overflow-hidden border-0 shadow-lg transition-shadow hover:shadow-xl">
          <div className="relative aspect-[16/9] overflow-hidden md:aspect-[21/9]">
            {article.image_url ? (
              <img
                src={article.image_url}
                alt={article.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <span className="text-4xl text-muted-foreground">📰</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                {article.is_breaking && (
                  <Badge className="bg-accent text-accent-foreground">
                    Terkini
                  </Badge>
                )}
                {article.category && (
                  <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                    {article.category.name}
                  </Badge>
                )}
                {article.source && (
                  <Badge variant="outline" className="border-white/30 text-white">
                    {article.source.name}
                  </Badge>
                )}
              </div>
              <h2 className="font-display text-xl font-bold leading-tight text-white md:text-3xl">
                {article.title}
              </h2>
              {article.excerpt && (
                <p className="mt-2 hidden text-sm text-white/80 md:line-clamp-2 md:block">
                  {article.excerpt}
                </p>
              )}
              <div className="mt-3 flex items-center gap-4 text-xs text-white/60">
                {timeAgo && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {timeAgo}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {article.view_count.toLocaleString()} views
                </span>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link
        to={`/berita/${article.slug}`}
        className={cn(
          'group flex gap-3 rounded-lg p-2 transition-colors hover:bg-muted',
          className
        )}
      >
        {article.image_url && (
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md">
            <img
              src={article.image_url}
              alt={article.title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        )}
        <div className="flex-1 space-y-1">
          <h3 className="line-clamp-2 text-sm font-medium leading-snug group-hover:text-primary">
            {article.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {article.source && <span>{article.source.name}</span>}
            {timeAgo && <span>• {timeAgo}</span>}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/berita/${article.slug}`} className={cn('group block', className)}>
      <Card className="card-premium h-full overflow-hidden">
        <div className="relative aspect-[16/10] overflow-hidden">
          {article.image_url ? (
            <img
              src={article.image_url}
              alt={article.title}
              className="card-image h-full w-full object-cover transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <span className="text-3xl text-muted-foreground">📰</span>
            </div>
          )}
          {article.is_breaking && (
            <Badge className="absolute left-2 top-2 bg-accent text-accent-foreground">
              Terkini
            </Badge>
          )}
        </div>
        <CardContent className="p-3 md:p-4">
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            {article.category && (
              <Badge variant="secondary" className="text-xs">
                {article.category.name}
              </Badge>
            )}
            {article.source && (
              <Badge variant="outline" className="text-xs">
                {article.source.name}
              </Badge>
            )}
          </div>
          <h3 className="card-title line-clamp-2 font-display text-base font-semibold leading-snug transition-colors duration-300 md:text-lg">
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
              {article.excerpt}
            </p>
          )}
          <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
            {timeAgo && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {timeAgo}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {article.view_count.toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
