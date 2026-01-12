import { MainLayout } from '@/components/layout/MainLayout';
import { BreakingNewsTicker } from '@/components/news/BreakingNewsTicker';
import { CategoryTabs } from '@/components/news/CategoryTabs';
import { TrendingSection } from '@/components/news/TrendingSection';
import { ArticleCard } from '@/components/news/ArticleCard';
import { ArticleGrid } from '@/components/news/ArticleGrid';
import { useArticles } from '@/hooks/useArticles';
import { Skeleton } from '@/components/ui/skeleton';
import { SEOHead } from '@/components/seo/SEOHead';
import { WebsiteSchema, OrganizationSchema } from '@/components/seo/StructuredData';

export default function Index() {
  const { data: featuredArticle, isLoading: featuredLoading } = useArticles({
    status: 'published',
    featured: true,
    limit: 1,
  });

  const { data: latestArticles, isLoading: latestLoading } = useArticles({
    status: 'published',
    limit: 12,
  });

  const featured = featuredArticle?.[0];
  const articles = latestArticles?.filter((a) => a.id !== featured?.id) || [];

  return (
    <MainLayout>
      <SEOHead canonicalUrl="/" />
      <WebsiteSchema />
      <OrganizationSchema />

      <BreakingNewsTicker />
      <CategoryTabs />

      {/* Hero Section */}
      <section className="py-4 md:py-6">
        <div className="container">
          {featuredLoading ? (
            <Skeleton className="aspect-[16/9] w-full rounded-lg md:aspect-[21/9]" />
          ) : featured ? (
            <ArticleCard article={featured} variant="featured" />
          ) : null}
        </div>
      </section>

      {/* Trending Section */}
      <TrendingSection />

      {/* Latest News */}
      <section className="py-6 md:py-8">
        <div className="container">
          <h2 className="mb-4 font-display text-lg font-bold md:text-xl">
            சமீபத்திய செய்திகள்
          </h2>
          <ArticleGrid
            articles={articles}
            isLoading={latestLoading}
            emptyMessage="சமீபத்திய செய்திகள் இல்லை."
          />
        </div>
      </section>
    </MainLayout>
  );
}
