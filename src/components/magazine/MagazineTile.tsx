import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Article } from '@/types/database';
import { formatRelativeTime } from '@/lib/date-utils';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Clock } from 'lucide-react';

export type TileVariant = 'hero' | 'large' | 'medium' | 'small' | 'compact';

interface MagazineTileProps {
  article: Article;
  variant?: TileVariant;
  className?: string;
  priority?: boolean;
}

export function MagazineTile({
  article,
  variant = 'medium',
  className,
  priority = false,
}: MagazineTileProps) {
  const imageUrl = article.image_url || '/placeholder.svg';
  const articleUrl = `/berita/${article.slug || article.id}`;

  // Compact variant - text only row
  if (variant === 'compact') {
    return (
      <Link
        to={articleUrl}
        className={cn(
          'flex items-start gap-3 p-3 rounded-lg touch-feedback',
          'bg-card hover:bg-muted/50 transition-colors',
          className
        )}
      >
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
          <Clock className="w-3 h-3 text-primary" />
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="font-tamil font-semibold text-sm leading-snug line-clamp-2 text-foreground">
            {article.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            {article.category && (
              <span className="text-xs text-primary font-medium">
                {article.category.name}
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(article.publish_date || article.created_at)}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  // Small variant - minimal card
  if (variant === 'small') {
    return (
      <Link
        to={articleUrl}
        className={cn('magazine-tile group block', className)}
      >
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
          <img
            src={imageUrl}
            alt={article.title}
            className="magazine-tile-image"
            loading={priority ? 'eager' : 'lazy'}
          />
          <div className="magazine-tile-overlay" />
          <div className="magazine-tile-content">
            {article.category && (
              <span className="category-badge text-[10px] mb-1.5">
                {article.category.name}
              </span>
            )}
            <h3 className="font-tamil font-bold text-sm leading-snug line-clamp-2 text-white">
              {article.title}
            </h3>
          </div>
        </div>
      </Link>
    );
  }

  // Medium variant - standard card
  if (variant === 'medium') {
    return (
      <Link
        to={articleUrl}
        className={cn('magazine-tile group block', className)}
      >
        <div className="relative aspect-[3/4] overflow-hidden rounded-lg">
          <img
            src={imageUrl}
            alt={article.title}
            className="magazine-tile-image"
            loading={priority ? 'eager' : 'lazy'}
          />
          <div className="magazine-tile-overlay" />
          <div className="magazine-tile-content">
            <div className="flex items-center gap-2 mb-2">
              {article.is_breaking && (
                <span className="breaking-badge">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-dot" />
                  அவசர செய்தி
                </span>
              )}
              {article.category && !article.is_breaking && (
                <span className="category-badge">
                  {article.category.name}
                </span>
              )}
            </div>
            <h3 className="font-tamil font-bold text-base leading-snug line-clamp-3 text-white mb-2">
              {article.title}
            </h3>
            <div className="flex items-center gap-2 text-white/70 text-xs">
              {article.source && (
                <span className="font-medium">{article.source.name}</span>
              )}
              <span>•</span>
              <span>{formatRelativeTime(article.publish_date || article.created_at)}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Large variant - prominent card
  if (variant === 'large') {
    return (
      <Link
        to={articleUrl}
        className={cn('magazine-tile group block', className)}
      >
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl shadow-lg">
          <img
            src={imageUrl}
            alt={article.title}
            className="magazine-tile-image"
            loading={priority ? 'eager' : 'lazy'}
          />
          <div className="magazine-tile-overlay" />
          <div className="magazine-tile-content p-5">
            <div className="flex items-center gap-2 mb-3">
              {article.is_breaking && (
                <span className="breaking-badge">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-dot" />
                  அவசர செய்தி
                </span>
              )}
              {article.category && (
                <span className="category-badge">
                  {article.category.name}
                </span>
              )}
              {article.is_featured && !article.is_breaking && (
                <Badge variant="secondary" className="bg-gold text-gold-foreground text-xs">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
            <h2 className="font-tamil font-bold text-xl leading-snug line-clamp-3 text-white mb-3">
              {article.title}
            </h2>
            {article.excerpt && (
              <p className="text-white/80 text-sm line-clamp-2 mb-3 leading-relaxed">
                {article.excerpt}
              </p>
            )}
            <div className="flex items-center gap-2 text-white/70 text-xs">
              {article.source && (
                <>
                  {article.source.logo_url && (
                    <img
                      src={article.source.logo_url}
                      alt={article.source.name}
                      className="w-4 h-4 rounded-full object-cover"
                    />
                  )}
                  <span className="font-medium">{article.source.name}</span>
                  <span>•</span>
                </>
              )}
              <span>{formatRelativeTime(article.publish_date || article.created_at)}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Hero variant - full-width featured
  return (
    <Link
      to={articleUrl}
      className={cn('magazine-tile group block', className)}
    >
      <div className="relative aspect-[16/10] md:aspect-[21/9] overflow-hidden rounded-xl shadow-xl">
        <img
          src={imageUrl}
          alt={article.title}
          className="magazine-tile-image"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {article.is_breaking && (
              <span className="breaking-badge">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse-dot" />
                அவசர செய்தி
              </span>
            )}
            {article.category && (
              <span className="category-badge category-badge-gold">
                {article.category.name}
              </span>
            )}
          </div>
          <h1 className="font-tamil font-bold text-2xl md:text-3xl lg:text-4xl leading-tight line-clamp-3 text-white mb-3">
            {article.title}
          </h1>
          {article.excerpt && (
            <p className="hidden md:block text-white/85 text-base line-clamp-2 mb-4 max-w-3xl leading-relaxed">
              {article.excerpt}
            </p>
          )}
          <div className="flex items-center gap-3 text-white/75 text-sm">
            {article.source && (
              <>
                {article.source.logo_url && (
                  <img
                    src={article.source.logo_url}
                    alt={article.source.name}
                    className="w-5 h-5 rounded-full object-cover border border-white/20"
                  />
                )}
                <span className="font-semibold">{article.source.name}</span>
                <span className="hidden md:inline">•</span>
              </>
            )}
            <span>{formatRelativeTime(article.publish_date || article.created_at)}</span>
            {article.view_count > 0 && (
              <>
                <span>•</span>
                <span>{article.view_count.toLocaleString()} பார்வைகள்</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
