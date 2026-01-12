/**
 * ArticleMeta Component
 * Displays article metadata (time ago, views, source) consistently
 */

import { Clock, Eye } from 'lucide-react';
import { formatTimeAgo } from '@/lib/date-utils';
import { cn } from '@/lib/utils';
import type { Source } from '@/types/database';

interface ArticleMetaProps {
  publishDate?: string | null;
  viewCount: number;
  source?: Source | null;
  variant?: 'default' | 'compact' | 'featured';
  className?: string;
}

export function ArticleMeta({
  publishDate,
  viewCount,
  source,
  variant = 'default',
  className,
}: ArticleMetaProps) {
  const timeAgo = formatTimeAgo(publishDate);

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-2 text-xs text-muted-foreground', className)}>
        {source && <span>{source.name}</span>}
        {timeAgo && <span>• {timeAgo}</span>}
      </div>
    );
  }

  if (variant === 'featured') {
    return (
      <div className={cn('flex items-center gap-4 text-xs text-white/60', className)}>
        {timeAgo && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {timeAgo}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Eye className="h-3 w-3" />
          {viewCount.toLocaleString()} views
        </span>
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn('flex items-center gap-3 text-xs text-muted-foreground', className)}>
      {timeAgo && (
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {timeAgo}
        </span>
      )}
      <span className="flex items-center gap-1">
        <Eye className="h-3 w-3" />
        {viewCount.toLocaleString()}
      </span>
    </div>
  );
}
