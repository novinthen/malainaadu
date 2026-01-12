import { useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { ArticlePageSkeleton } from '@/components/ui/loading-states';
import { ReadingProgress } from '@/components/ui/reading-progress';
import { RelatedArticles } from '@/components/news/RelatedArticles';
import { SEOHead } from '@/components/seo/SEOHead';
import { NewsArticleSchema, BreadcrumbSchema } from '@/components/seo/StructuredData';
import { ArticleHeader, ArticleContent, ArticleBreadcrumb } from '@/components/article';
import { useArticle, useRecordView } from '@/hooks/useArticles';
import { useArticleRedirect } from '@/hooks/useArticleRedirect';
import { generateMetaDescription } from '@/lib/seo';
import { processContentToParagraphs, extractPullQuote } from '@/lib/article-utils';
import { ROUTES, SITE_CONFIG } from '@/constants/routes';
import { UI_TEXT } from '@/constants/ui';
import { toast } from 'sonner';

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: article, isLoading, error } = useArticle(slug!);
  const recordView = useRecordView();

  // Handle UUID to slug redirect
  useArticleRedirect(slug);

  // Record view on mount
  useEffect(() => {
    if (article?.id) {
      recordView.mutate(article.id);
    }
  }, [article?.id]);

  // Memoize paragraph processing
  const paragraphs = useMemo(() => {
    if (!article?.content) return [];
    return processContentToParagraphs(article.content);
  }, [article?.content]);

  // Extract pull quote for longer articles
  const pullQuote = useMemo(() => {
    if (paragraphs.length < 4) return null;
    return extractPullQuote(paragraphs);
  }, [paragraphs]);

  const handleShare = async () => {
    if (navigator.share && article) {
      try {
        await navigator.share({
          title: article.title,
          url: window.location.href,
        });
      } catch {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success(UI_TEXT.linkCopied);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <ArticlePageSkeleton />
      </MainLayout>
    );
  }

  if (error || !article) {
    return (
      <MainLayout>
        <SEOHead
          title={UI_TEXT.articleNotFound}
          description={UI_TEXT.articleNotFoundDesc}
          noIndex
        />
        <div className="container flex flex-col items-center justify-center py-12 text-center">
          <span className="text-5xl">😔</span>
          <h1 className="mt-4 text-2xl font-bold">{UI_TEXT.articleNotFound}</h1>
          <p className="mt-2 text-muted-foreground">{UI_TEXT.articleNotFoundDesc}</p>
          <Button asChild className="mt-4">
            <Link to="/">{UI_TEXT.back} ke {UI_TEXT.home}</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  const articleUrl = ROUTES.ARTICLE(article.slug);
  const metaDescription = generateMetaDescription(article.content, article.excerpt);

  // Breadcrumb items for structured data
  const breadcrumbItems = [
    { name: UI_TEXT.home, url: '/' },
    ...(article.category
      ? [{ name: article.category.name, url: ROUTES.CATEGORY(article.category.slug) }]
      : []),
    { name: article.title, url: articleUrl },
  ];

  return (
    <MainLayout>
      <ReadingProgress />
      <SEOHead
        title={article.title}
        description={metaDescription}
        canonicalUrl={articleUrl}
        ogImage={article.image_url || undefined}
        ogType="article"
        article={{
          publishedTime: article.publish_date || undefined,
          modifiedTime: article.updated_at,
          author: article.source?.name,
          section: article.category?.name,
        }}
      />
      <NewsArticleSchema article={article} url={`${SITE_CONFIG.url}${articleUrl}`} />
      <BreadcrumbSchema items={breadcrumbItems} />

      {/* Mobile Back Button */}
      <div className="sticky top-14 z-40 border-b bg-card/95 backdrop-blur md:hidden">
        <div className="container flex items-center gap-2 py-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="mr-1 h-4 w-4" />
              {UI_TEXT.back}
            </Link>
          </Button>
        </div>
      </div>

      <article className="container max-w-4xl py-4 md:py-8">
        <ArticleBreadcrumb category={article.category} title={article.title} />
        <ArticleHeader article={article} onShare={handleShare} />
        <ArticleContent paragraphs={paragraphs} pullQuote={pullQuote} />

        {/* Source Link */}
        {article.original_url && (
          <div className="mt-8">
            <Button asChild className="w-full md:w-auto">
              <a
                href={article.original_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                {UI_TEXT.readOriginal}
              </a>
            </Button>
          </div>
        )}

        <RelatedArticles
          currentArticleId={article.id}
          categoryId={article.category_id}
          sourceId={article.source_id}
        />
      </article>

      {/* Mobile Sticky CTA */}
      {article.original_url && (
        <div className="fixed bottom-16 left-0 right-0 border-t bg-card p-4 md:hidden safe-bottom">
          <Button asChild className="w-full">
            <a
              href={article.original_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              {UI_TEXT.readOriginal}
            </a>
          </Button>
        </div>
      )}
    </MainLayout>
  );
}
