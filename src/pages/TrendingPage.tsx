import { MainLayout } from '@/components/layout/MainLayout';
import { ArticleCard } from '@/components/news/ArticleCard';
import { TrendingListSkeleton } from '@/components/ui/loading-states';
import { SEOHead } from '@/components/seo/SEOHead';
import { useTrendingArticles } from '@/hooks/useArticles';
import { TrendingUp } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

export default function TrendingPage() {
  const { data: articles, isLoading } = useTrendingArticles(20);

  return (
    <MainLayout>
      <SEOHead
        title="டிரெண்டிங் செய்திகள்"
        description="மலேசியாவில் மிகவும் பிரபலமான மற்றும் டிரெண்டிங் செய்திகள். மலேசிய வாசகர்களால் அதிகம் படிக்கப்படும் செய்திகளைப் பாருங்கள்."
        canonicalUrl={ROUTES.TRENDING}
      />

      <section className="py-6 md:py-8">
        <div className="container">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
              <TrendingUp className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold md:text-3xl">
                டிரெண்டிங் செய்திகள்
              </h1>
              <p className="text-sm text-muted-foreground">
                அதிகம் படிக்கப்படும் பிரபலமான செய்திகள்
              </p>
            </div>
          </div>

          {isLoading ? (
            <TrendingListSkeleton count={10} />
          ) : articles?.length ? (
            <div className="space-y-4">
              {articles.map((article, index) => (
                <div key={article.id} className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <ArticleCard article={article} variant="compact" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">
                தற்போது டிரெண்டிங் செய்திகள் இல்லை.
              </p>
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
}
