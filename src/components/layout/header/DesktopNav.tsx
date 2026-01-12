import { Link } from 'react-router-dom';
import type { Category } from '@/types/database';

interface DesktopNavProps {
  categories: Category[];
}

export function DesktopNav({ categories }: DesktopNavProps) {
  return (
    <nav className="hidden items-center gap-1 lg:flex">
      {categories.map((category) => (
        <Link
          key={category.id}
          to={`/kategori/${category.slug}`}
          className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {category.name}
        </Link>
      ))}
    </nav>
  );
}
