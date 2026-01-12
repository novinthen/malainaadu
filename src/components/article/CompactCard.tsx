/**
 * CompactCard Component
 * Small inline article card for sidebar lists
 */

import { Link } from 'react-router-dom';
import { ArticleMeta } from './ArticleMeta';
import { cn } from '@/lib/utils';
import type { Article } from '@/types/database';

interface CompactCardProps {
  article: Article;
  className?: string;
}

export function CompactCard({ article, className }: CompactCardProps) {
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
        <ArticleMeta
          publishDate={article.publish_date}
          viewCount={article.view_count}
          source={article.source}
          variant="compact"
        />
      </div>
    </Link>
  );
}
