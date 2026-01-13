import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Article } from '@/types/database';
import { MagazineTile } from './MagazineTile';
import { Skeleton } from '@/components/ui/skeleton';

interface HeroCarouselProps {
  articles: Article[];
  isLoading?: boolean;
  className?: string;
  autoPlayInterval?: number;
}

export function HeroCarousel({
  articles,
  isLoading,
  className,
  autoPlayInterval = 5000,
}: HeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goToSlide = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const goToNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % articles.length);
  }, [articles.length]);

  // Auto-advance slides
  useEffect(() => {
    if (isPaused || articles.length <= 1) return;

    const timer = setInterval(goToNext, autoPlayInterval);
    return () => clearInterval(timer);
  }, [isPaused, goToNext, autoPlayInterval, articles.length]);

  if (isLoading) {
    return (
      <div className={cn('px-4', className)}>
        <Skeleton className="aspect-[16/10] rounded-xl" />
        <div className="flex justify-center gap-2 mt-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="w-2 h-2 rounded-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!articles.length) {
    return null;
  }

  return (
    <div
      className={cn('relative', className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Slides Container */}
      <div className="px-4 overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {articles.map((article, index) => (
            <div
              key={article.id}
              className="w-full flex-shrink-0"
            >
              <MagazineTile
                article={article}
                variant="hero"
                priority={index === 0}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Dots */}
      {articles.length > 1 && (
        <div className="flex justify-center gap-2 mt-3">
          {articles.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300',
                index === activeIndex
                  ? 'bg-primary w-6'
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
