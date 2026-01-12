/**
 * ArticleHeader Component
 * Hero section for article page with image, badges, title, and stats
 */

import { Clock, Eye, BookOpen, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { ArticleBadges } from './ArticleBadges';
import { formatPublishDate } from '@/lib/date-utils';
import { calculateReadingTime } from '@/lib/article-utils';
import type { Article } from '@/types/database';

interface ArticleHeaderProps {
  article: Article;
  onShare: () => void;
}

export function ArticleHeader({ article, onShare }: ArticleHeaderProps) {
  const publishDate = formatPublishDate(article.publish_date);

  return (
    <>
      {/* Hero Image */}
      {article.image_url && (
        <div className="-mx-4 md:mx-0 md:rounded-xl md:overflow-hidden">
          <OptimizedImage
            src={article.image_url}
            alt={article.title}
            priority
            aspectRatio="16/9"
            className="w-full"
          />
        </div>
      )}

      {/* Badges */}
      <ArticleBadges
        isBreaking={article.is_breaking}
        category={article.category}
        source={article.source}
        variant="article"
        linkCategory
        className="mt-4"
      />

      {/* Title */}
      <h1 className="mt-4 font-display text-2xl font-bold leading-tight md:text-4xl">
        {article.title}
      </h1>

      {/* Stats */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        {publishDate && (
          <time dateTime={article.publish_date || undefined} className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {publishDate}
          </time>
        )}
        <span className="flex items-center gap-1">
          <BookOpen className="h-4 w-4" />
          {calculateReadingTime(article.content)} min bacaan
        </span>
        <span className="flex items-center gap-1">
          <Eye className="h-4 w-4" />
          {article.view_count.toLocaleString()} paparan
        </span>
        <Button variant="ghost" size="sm" onClick={onShare}>
          <Share2 className="mr-1 h-4 w-4" />
          Kongsi
        </Button>
      </div>
    </>
  );
}
