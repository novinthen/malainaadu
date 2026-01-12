import { Link, useLocation } from 'react-router-dom';
import { useCategories } from '@/hooks/useCategories';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export function CategoryTabs() {
  const location = useLocation();
  const { data: categories } = useCategories();

  const currentSlug = location.pathname.split('/kategori/')[1] || '';

  return (
    <div className="border-b bg-card">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="container flex gap-1 py-2">
          <Link
            to="/"
            className={cn(
              'inline-flex shrink-0 items-center rounded-full px-4 py-2 text-sm font-medium transition-colors',
              location.pathname === '/'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            அனைத்தும்
          </Link>
          {categories?.map((category) => (
            <Link
              key={category.id}
              to={`/kategori/${category.slug}`}
              className={cn(
                'inline-flex shrink-0 items-center rounded-full px-4 py-2 text-sm font-medium transition-colors',
                currentSlug === category.slug
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {category.name}
            </Link>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  );
}
