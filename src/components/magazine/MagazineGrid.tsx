import { cn } from '@/lib/utils';
import { Article } from '@/types/database';
import { MagazineTile } from './MagazineTile';
import { Skeleton } from '@/components/ui/skeleton';

interface MagazineGridProps {
  articles: Article[];
  isLoading?: boolean;
  className?: string;
}

export function MagazineGrid({ articles, isLoading, className }: MagazineGridProps) {
  if (isLoading) {
    return <MagazineGridSkeleton />;
  }

  if (!articles.length) {
    return null;
  }

  // Split articles for magazine layout
  const [first, second, third, fourth, fifth, ...rest] = articles;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Row 1: Large + 2 Stacked */}
      <div className="grid grid-cols-2 gap-3">
        {/* Large tile */}
        {first && (
          <MagazineTile
            article={first}
            variant="large"
            className="row-span-2"
            priority
          />
        )}
        {/* Stacked small tiles */}
        <div className="flex flex-col gap-3">
          {second && (
            <MagazineTile
              article={second}
              variant="small"
              priority
            />
          )}
          {third && (
            <MagazineTile
              article={third}
              variant="small"
            />
          )}
        </div>
      </div>

      {/* Row 2: Two medium tiles */}
      {(fourth || fifth) && (
        <div className="grid grid-cols-2 gap-3">
          {fourth && (
            <MagazineTile
              article={fourth}
              variant="medium"
            />
          )}
          {fifth && (
            <MagazineTile
              article={fifth}
              variant="medium"
            />
          )}
        </div>
      )}

      {/* Remaining articles in pairs */}
      {rest.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {rest.map((article) => (
            <MagazineTile
              key={article.id}
              article={article}
              variant="small"
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MagazineGridSkeleton() {
  return (
    <div className="space-y-3">
      {/* Row 1: Large + 2 Stacked */}
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="aspect-[4/5] rounded-xl" />
        <div className="flex flex-col gap-3">
          <Skeleton className="aspect-[4/3] rounded-lg" />
          <Skeleton className="aspect-[4/3] rounded-lg" />
        </div>
      </div>

      {/* Row 2: Two medium */}
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="aspect-[3/4] rounded-lg" />
        <Skeleton className="aspect-[3/4] rounded-lg" />
      </div>
    </div>
  );
}
