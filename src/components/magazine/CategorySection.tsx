import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Article, Category } from '@/types/database';
import { MagazineTile } from './MagazineTile';
import { Skeleton } from '@/components/ui/skeleton';
import { useScrollReveal } from '@/hooks/useScrollReveal';

interface CategorySectionProps {
  category: Category;
  articles: Article[];
  isLoading?: boolean;
  className?: string;
}

export function CategorySection({
  category,
  articles,
  isLoading,
  className,
}: CategorySectionProps) {
  const { ref, isVisible } = useScrollReveal();

  if (isLoading) {
    return <CategorySectionSkeleton />;
  }

  if (!articles.length) {
    return null;
  }

  const [featured, ...rest] = articles;
  const displayArticles = rest.slice(0, 3);

  return (
    <section
      ref={ref}
      className={cn(
        'py-6 reveal',
        isVisible && 'visible',
        className
      )}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4 px-4">
        <h2 className="font-tamil font-bold text-lg text-foreground">
          {category.name}
        </h2>
        <Link
          to={`/kategori/${category.slug}`}
          className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          மேலும்
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Content Grid */}
      <div className="px-4">
        <div className="grid grid-cols-2 gap-3">
          {/* Featured article - large */}
          {featured && (
            <MagazineTile
              article={featured}
              variant="large"
              className="row-span-2"
            />
          )}
          
          {/* Stacked small tiles */}
          <div className="flex flex-col gap-3">
            {displayArticles.map((article) => (
              <MagazineTile
                key={article.id}
                article={article}
                variant="compact"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CategorySectionSkeleton() {
  return (
    <section className="py-6">
      <div className="flex items-center justify-between mb-4 px-4">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-5 w-16" />
      </div>
      <div className="px-4">
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="aspect-[4/5] rounded-xl row-span-2" />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
          </div>
        </div>
      </div>
    </section>
  );
}
