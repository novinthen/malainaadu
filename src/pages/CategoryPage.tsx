import { useParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { CategoryTabs } from '@/components/news/CategoryTabs';
import { ArticleGrid } from '@/components/news/ArticleGrid';
import { useArticles } from '@/hooks/useArticles';
import { useCategory } from '@/hooks/useCategories';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: category } = useCategory(slug!);
  
  const { data: articles, isLoading } = useArticles({
    status: 'published',
    categorySlug: slug,
    limit: 24,
  });

  return (
    <MainLayout>
      <CategoryTabs />
      
      <section className="py-6 md:py-8">
        <div className="container">
          <h1 className="mb-4 font-display text-2xl font-bold md:text-3xl">
            {category?.name || 'Kategori'}
          </h1>
          <ArticleGrid
            articles={articles}
            isLoading={isLoading}
            emptyMessage={`Tiada berita dalam kategori ${category?.name || 'ini'}.`}
          />
        </div>
      </section>
    </MainLayout>
  );
}
