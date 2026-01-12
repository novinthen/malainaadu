import { useParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { CategoryTabs } from '@/components/news/CategoryTabs';
import { ArticleGrid } from '@/components/news/ArticleGrid';
import { SEOHead } from '@/components/seo/SEOHead';
import { BreadcrumbSchema } from '@/components/seo/StructuredData';
import { useArticles } from '@/hooks/useArticles';
import { useCategory } from '@/hooks/useCategories';
import { ROUTES } from '@/constants/routes';
import { getCategoryIcon } from '@/constants/categories';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: category } = useCategory(slug!);
  
  const { data: articles, isLoading } = useArticles({
    status: 'published',
    categorySlug: slug,
    limit: 24,
  });

  const categoryName = category?.name || 'வகை';
  const categoryIcon = getCategoryIcon(slug || '');
  const canonicalUrl = ROUTES.CATEGORY(slug || '');

  const breadcrumbItems = [
    { name: 'முகப்பு', url: '/' },
    { name: 'வகைகள்', url: ROUTES.CATEGORIES },
    { name: categoryName, url: canonicalUrl },
  ];

  return (
    <MainLayout>
      <SEOHead
        title={`${categoryName} செய்திகள்`}
        description={`${categoryName} வகையின் சமீபத்திய செய்திகள். மலேசியாவின் நம்பகமான ஊடகங்களிலிருந்து ${categoryName.toLowerCase()} தொடர்பான புதிய செய்திகளைப் பெறுங்கள்.`}
        canonicalUrl={canonicalUrl}
      />
      <BreadcrumbSchema items={breadcrumbItems} />

      <CategoryTabs />
      
      <section className="py-6 md:py-8">
        <div className="container">
          <div className="mb-6 flex items-center gap-3">
            <span className="text-3xl" role="img" aria-label={categoryName}>
              {categoryIcon}
            </span>
            <h1 className="font-display text-2xl font-bold md:text-3xl">
              {categoryName}
            </h1>
          </div>
          <ArticleGrid
            articles={articles}
            isLoading={isLoading}
            emptyMessage={`${categoryName} வகையில் செய்திகள் இல்லை.`}
          />
        </div>
      </section>
    </MainLayout>
  );
}
