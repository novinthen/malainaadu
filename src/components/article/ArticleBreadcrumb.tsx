/**
 * ArticleBreadcrumb Component
 * Navigation breadcrumb for article pages
 */

import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import type { Category } from '@/types/database';

interface ArticleBreadcrumbProps {
  category?: Category | null;
  title: string;
}

export function ArticleBreadcrumb({ category, title }: ArticleBreadcrumbProps) {
  return (
    <nav
      className="mb-4 hidden items-center gap-2 text-sm text-muted-foreground md:flex"
      aria-label="Breadcrumb"
    >
      <Link to="/" className="hover:text-foreground">
        Utama
      </Link>
      <span aria-hidden="true">/</span>
      {category && (
        <>
          <Link
            to={ROUTES.CATEGORY(category.slug)}
            className="hover:text-foreground"
          >
            {category.name}
          </Link>
          <span aria-hidden="true">/</span>
        </>
      )}
      <span className="truncate text-foreground">{title}</span>
    </nav>
  );
}
