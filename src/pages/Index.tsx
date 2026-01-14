import { MainLayout } from '@/components/layout/MainLayout';
import { BreakingNewsTicker } from '@/components/news/BreakingNewsTicker';
import { HeroCarousel, MagazineGrid, TrendingBar, CategorySection, HeroSpotlight } from '@/components/magazine';
import { useArticles, useTrendingArticles, useFeaturedArticle } from '@/hooks/useArticles';
import { useCategories } from '@/hooks/useCategories';
import { SEOHead } from '@/components/seo/SEOHead';
import { WebsiteSchema, OrganizationSchema } from '@/components/seo/StructuredData';

export default function Index() {
  // Single featured article for spotlight
  const { data: spotlightArticle, isLoading: spotlightLoading } = useFeaturedArticle();

  // Featured articles for hero carousel (excluding the spotlight article)
  const { data: featuredArticles, isLoading: featuredLoading } = useArticles({
    status: 'published',
    featured: true,
    limit: 5,
  });

  // Latest articles for magazine grid
  const { data: latestArticles, isLoading: latestLoading } = useArticles({
    status: 'published',
    limit: 12,
  });

  // Trending articles
  const { data: trendingArticles, isLoading: trendingLoading } = useTrendingArticles(8);

  // Categories for sections
  const { data: categories } = useCategories();

  // Filter out featured articles from latest
  const featuredIds = new Set(featuredArticles?.map((a) => a.id) || []);
  const gridArticles = latestArticles?.filter((a) => !featuredIds.has(a.id)) || [];

  // Get first 2 categories for sections
  const displayCategories = categories?.slice(0, 2) || [];

  // Fetch articles for each category section
  const { data: category1Articles } = useArticles({
    status: 'published',
    categorySlug: displayCategories[0]?.slug,
    limit: 4,
  });

  const { data: category2Articles } = useArticles({
    status: 'published',
    categorySlug: displayCategories[1]?.slug,
    limit: 4,
  });

  return (
    <MainLayout>
      <SEOHead canonicalUrl="/" />
      <WebsiteSchema />
      <OrganizationSchema />

      {/* Breaking News Ticker */}
      <BreakingNewsTicker />

      {/* Hero Spotlight - Featured Article */}
      <HeroSpotlight 
        article={spotlightArticle} 
        isLoading={spotlightLoading} 
      />

      {/* Hero Carousel - Other Featured Articles */}
      <section className="pb-2">
        <HeroCarousel
          articles={featuredArticles?.filter(a => a.id !== spotlightArticle?.id) || []}
          isLoading={featuredLoading}
        />
      </section>

      {/* Trending Bar */}
      <TrendingBar
        articles={trendingArticles || []}
        isLoading={trendingLoading}
      />

      {/* Latest News - Magazine Grid */}
      <section className="py-4">
        <div className="px-4 mb-4">
          <h2 className="font-tamil font-bold text-lg text-foreground">
            சமீபத்திய செய்திகள்
          </h2>
        </div>
        <div className="px-4">
          <MagazineGrid
            articles={gridArticles}
            isLoading={latestLoading}
          />
        </div>
      </section>

      {/* Category Sections */}
      {displayCategories[0] && category1Articles && (
        <div className="bg-muted/30">
          <CategorySection
            category={displayCategories[0]}
            articles={category1Articles}
          />
        </div>
      )}

      {displayCategories[1] && category2Articles && (
        <CategorySection
          category={displayCategories[1]}
          articles={category2Articles}
        />
      )}

      {/* Bottom padding for mobile nav */}
      <div className="h-20 md:hidden" />
    </MainLayout>
  );
}
