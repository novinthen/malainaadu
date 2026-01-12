import { MainLayout } from '@/components/layout/MainLayout';
import { CategoryTabs } from '@/components/news/CategoryTabs';
import { ArticleGrid } from '@/components/news/ArticleGrid';
import { SEOHead } from '@/components/seo/SEOHead';
import { useArticles } from '@/hooks/useArticles';
import { ROUTES } from '@/constants/routes';
import { Newspaper } from 'lucide-react';

export default function LatestPage() {
  const { data: articles, isLoading } = useArticles({
    status: 'published',
    limit: 30,
  });

  return (
    <MainLayout>
      <SEOHead
        title="Berita Terkini"
        description="Berita terkini dan terbaru dari semua sumber di Malaysia. Dapatkan berita paling baharu dari pelbagai kategori."
        canonicalUrl={ROUTES.LATEST}
      />

      <CategoryTabs />
      
      <section className="py-6 md:py-8">
        <div className="container">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Newspaper className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold md:text-3xl">
                Berita Terkini
              </h1>
              <p className="text-sm text-muted-foreground">
                Berita terbaru dari semua sumber
              </p>
            </div>
          </div>

          <ArticleGrid
            articles={articles}
            isLoading={isLoading}
            emptyMessage="Tiada berita terkini."
          />
        </div>
      </section>
    </MainLayout>
  );
}
