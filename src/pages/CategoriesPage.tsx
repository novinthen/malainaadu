import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { CategoryGridSkeleton } from '@/components/ui/loading-states';
import { SEOHead } from '@/components/seo/SEOHead';
import { useCategories } from '@/hooks/useCategories';
import { getCategoryIcon } from '@/constants/categories';
import { ROUTES } from '@/constants/routes';

export default function CategoriesPage() {
  const { data: categories, isLoading } = useCategories();

  return (
    <MainLayout>
      <SEOHead
        title="Semua Kategori"
        description="Layari semua kategori berita di Berita Malaysia. Politik, sukan, hiburan, ekonomi, teknologi, kesihatan dan banyak lagi."
        canonicalUrl={ROUTES.CATEGORIES}
      />

      <section className="py-6 md:py-8">
        <div className="container">
          <h1 className="mb-6 font-display text-2xl font-bold md:text-3xl">
            Semua Kategori
          </h1>

          {isLoading ? (
            <CategoryGridSkeleton count={10} />
          ) : (
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {categories?.map((category) => (
                <Link key={category.id} to={ROUTES.CATEGORY(category.slug)}>
                  <Card className="group h-full transition-all hover:shadow-md hover:border-primary">
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                      <span
                        className="text-4xl md:text-5xl mb-3"
                        role="img"
                        aria-label={category.name}
                      >
                        {getCategoryIcon(category.slug)}
                      </span>
                      <h2 className="font-display text-lg font-semibold group-hover:text-primary">
                        {category.name}
                      </h2>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
}
