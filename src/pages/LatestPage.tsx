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
        title="சமீபத்திய செய்திகள்"
        description="மலேசியாவின் சமீபத்திய மற்றும் புதிய செய்திகள். பல்வேறு வகைகளிலிருந்து மிகவும் புதிய செய்திகளைப் பெறுங்கள்."
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
                சமீபத்திய செய்திகள்
              </h1>
              <p className="text-sm text-muted-foreground">
                அனைத்து ஆதாரங்களிலிருந்தும் புதிய செய்திகள்
              </p>
            </div>
          </div>

          <ArticleGrid
            articles={articles}
            isLoading={isLoading}
            emptyMessage="சமீபத்திய செய்திகள் இல்லை."
          />
        </div>
      </section>
    </MainLayout>
  );
}
