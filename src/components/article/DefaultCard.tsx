/**
 * DefaultCard Component
 * Standard article card for grid layouts
 */

import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArticleMeta } from './ArticleMeta';
import { ArticleBadges } from './ArticleBadges';
import { UI_TEXT } from '@/constants/ui';
import { cn } from '@/lib/utils';
import type { Article } from '@/types/database';

interface DefaultCardProps {
  article: Article;
  className?: string;
}

export function DefaultCard({ article, className }: DefaultCardProps) {
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
              {UI_TEXT.breakingNews}
            </Badge>
          )}
        </div>
        <CardContent className="p-3 md:p-4">
          <ArticleBadges
            category={article.category}
            source={article.source}
            variant="default"
            className="mb-2"
          />
          <h3 className="card-title line-clamp-2 font-display text-base font-semibold leading-snug transition-colors duration-300 md:text-lg">
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
              {article.excerpt}
            </p>
          )}
          <ArticleMeta
            publishDate={article.publish_date}
            viewCount={article.view_count}
            variant="default"
            className="mt-3"
          />
        </CardContent>
      </Card>
    </Link>
  );
}
