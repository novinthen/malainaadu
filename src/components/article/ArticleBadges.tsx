/**
 * ArticleBadges Component
 * Displays article badges (breaking, featured, category, source) consistently
 */

import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/constants/routes';
import { UI_TEXT } from '@/constants/ui';
import { cn } from '@/lib/utils';
import type { Category, Source } from '@/types/database';

interface ArticleBadgesProps {
  isBreaking?: boolean;
  isFeatured?: boolean;
  category?: Category | null;
  source?: Source | null;
  variant?: 'default' | 'overlay' | 'article';
  className?: string;
  linkCategory?: boolean;
}

export function ArticleBadges({
  isBreaking,
  isFeatured,
  category,
  source,
  variant = 'default',
  className,
  linkCategory = false,
}: ArticleBadgesProps) {
  if (variant === 'overlay') {
    // For featured cards with dark background overlay
    return (
      <div className={cn('flex flex-wrap items-center gap-2', className)}>
        {isBreaking && (
          <Badge className="bg-accent text-accent-foreground">
            {UI_TEXT.breakingNews}
          </Badge>
        )}
        {category && (
          <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
            {category.name}
          </Badge>
        )}
        {source && (
          <Badge variant="outline" className="border-white/30 text-white">
            {source.name}
          </Badge>
        )}
      </div>
    );
  }

  if (variant === 'article') {
    // For article page with optional linked category
    return (
      <div className={cn('flex flex-wrap items-center gap-2', className)}>
        {isBreaking && (
          <Badge className="bg-accent text-accent-foreground">
            {UI_TEXT.breakingNews}
          </Badge>
        )}
        {category && linkCategory ? (
          <Link to={ROUTES.CATEGORY(category.slug)}>
            <Badge variant="secondary" className="hover:bg-secondary/80">
              {category.name}
            </Badge>
          </Link>
        ) : category ? (
          <Badge variant="secondary">{category.name}</Badge>
        ) : null}
        {source && <Badge variant="outline">{source.name}</Badge>}
      </div>
    );
  }

  // Default variant - for card display
  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {category && (
        <Badge variant="secondary" className="text-xs">
          {category.name}
        </Badge>
      )}
      {source && (
        <Badge variant="outline" className="text-xs">
          {source.name}
        </Badge>
      )}
    </div>
  );
}
