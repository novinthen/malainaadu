/**
 * FeaturedCard Component
 * Large featured article card with image overlay
 */

import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ArticleMeta } from './ArticleMeta';
import { ArticleBadges } from './ArticleBadges';
import { UI_TEXT } from '@/constants/ui';
import { cn } from '@/lib/utils';
import type { Article } from '@/types/database';

interface FeaturedCardProps {
  article: Article;
  className?: string;
}

export function FeaturedCard({ article, className }: FeaturedCardProps) {
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
            <ArticleBadges
              isBreaking={article.is_breaking}
              category={article.category}
              source={article.source}
              variant="overlay"
              className="mb-2"
            />
            <h2 className="font-display text-xl font-bold leading-tight text-white md:text-3xl">
              {article.title}
            </h2>
            {article.excerpt && (
              <p className="mt-2 hidden text-sm text-white/80 md:line-clamp-2 md:block">
                {article.excerpt}
              </p>
            )}
            <ArticleMeta
              publishDate={article.publish_date}
              viewCount={article.view_count}
              variant="featured"
              className="mt-3"
            />
          </div>
        </div>
      </Card>
    </Link>
  );
}
