/**
 * ArticleCard Component
 * Unified article card with variant support
 * Also exports compound components for explicit variant usage
 */

import { FeaturedCard } from './FeaturedCard';
import { CompactCard } from './CompactCard';
import { DefaultCard } from './DefaultCard';
import type { Article } from '@/types/database';

interface ArticleCardProps {
  article: Article;
  variant?: 'default' | 'featured' | 'compact';
  className?: string;
}

export function ArticleCard({ article, variant = 'default', className }: ArticleCardProps) {
  switch (variant) {
    case 'featured':
      return <FeaturedCard article={article} className={className} />;
    case 'compact':
      return <CompactCard article={article} className={className} />;
    default:
      return <DefaultCard article={article} className={className} />;
  }
}

// Compound components for explicit variant usage
ArticleCard.Featured = FeaturedCard;
ArticleCard.Compact = CompactCard;
ArticleCard.Default = DefaultCard;
