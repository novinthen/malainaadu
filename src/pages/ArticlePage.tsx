import { useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import { ms } from 'date-fns/locale';
import { ArrowLeft, Clock, Eye, ExternalLink, Share2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArticlePageSkeleton } from '@/components/ui/loading-states';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { RelatedArticles } from '@/components/news/RelatedArticles';
import { SEOHead } from '@/components/seo/SEOHead';
import { NewsArticleSchema, BreadcrumbSchema } from '@/components/seo/StructuredData';
import { useArticle, useRecordView } from '@/hooks/useArticles';
import { generateMetaDescription } from '@/lib/seo';
import { ROUTES, SITE_CONFIG } from '@/constants/routes';
import { toast } from 'sonner';

/**
 * Process article content into paragraphs
 */
function processContentToParagraphs(content: string): string[] {
  // Check if content has newlines
  if (content.includes('\n')) {
    return content
      .split(/\n+/)
      .filter((p) => p.trim());
  }
  // No newlines - break into sentence groups (3-4 sentences per paragraph)
  const sentences = content.match(/[^.!?]+[.!?]+/g) || [content];
  const groups: string[] = [];
  const sentencesPerGroup = 3;
  for (let i = 0; i < sentences.length; i += sentencesPerGroup) {
    groups.push(sentences.slice(i, i + sentencesPerGroup).join(' ').trim());
  }
  return groups;
}

export default function ArticlePage() {
  const { id } = useParams<{ id: string }>();
  const { data: article, isLoading, error } = useArticle(id!);
  const recordView = useRecordView();

  // Record view on mount
  useEffect(() => {
    if (id) {
      recordView.mutate(id);
    }
  }, [id]);

  // Memoize paragraph processing
  const paragraphs = useMemo(() => {
    if (!article?.content) return [];
    return processContentToParagraphs(article.content);
  }, [article?.content]);

  const handleShare = async () => {
    if (navigator.share && article) {
      try {
        await navigator.share({
          title: article.title,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Pautan telah disalin!');
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
          title="Berita Tidak Ditemui"
          description="Maaf, berita yang anda cari tidak dapat ditemui."
          noIndex
        />
        <div className="container flex flex-col items-center justify-center py-12 text-center">
          <span className="text-5xl">😔</span>
          <h1 className="mt-4 text-2xl font-bold">Berita Tidak Ditemui</h1>
          <p className="mt-2 text-muted-foreground">
            Maaf, berita yang anda cari tidak dapat ditemui.
          </p>
          <Button asChild className="mt-4">
            <Link to="/">Kembali ke Utama</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  const timeAgo = article.publish_date
    ? formatDistanceToNow(new Date(article.publish_date), { addSuffix: true, locale: ms })
    : null;

  const publishDate = article.publish_date
    ? format(new Date(article.publish_date), 'd MMMM yyyy, HH:mm', { locale: ms })
    : null;

  const articleUrl = ROUTES.ARTICLE(article.id);
  const metaDescription = generateMetaDescription(article.content, article.excerpt);

  // Breadcrumb items for structured data
  const breadcrumbItems = [
    { name: 'Utama', url: '/' },
    ...(article.category
      ? [{ name: article.category.name, url: ROUTES.CATEGORY(article.category.slug) }]
      : []),
    { name: article.title, url: articleUrl },
  ];

  return (
    <MainLayout>
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
              Kembali
            </Link>
          </Button>
        </div>
      </div>

      <article className="container max-w-4xl py-4 md:py-8">
        {/* Breadcrumb - Desktop */}
        <nav
          className="mb-4 hidden items-center gap-2 text-sm text-muted-foreground md:flex"
          aria-label="Breadcrumb"
        >
          <Link to="/" className="hover:text-foreground">
            Utama
          </Link>
          <span aria-hidden="true">/</span>
          {article.category && (
            <>
              <Link
                to={ROUTES.CATEGORY(article.category.slug)}
                className="hover:text-foreground"
              >
                {article.category.name}
              </Link>
              <span aria-hidden="true">/</span>
            </>
          )}
          <span className="truncate text-foreground">{article.title}</span>
        </nav>

        {/* Hero Image */}
        {article.image_url && (
          <div className="-mx-4 md:mx-0 md:rounded-xl md:overflow-hidden">
            <OptimizedImage
              src={article.image_url}
              alt={article.title}
              priority
              aspectRatio="16/9"
              className="w-full"
            />
          </div>
        )}

        {/* Meta */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {article.is_breaking && (
            <Badge className="bg-accent text-accent-foreground">Terkini</Badge>
          )}
          {article.category && (
            <Link to={ROUTES.CATEGORY(article.category.slug)}>
              <Badge variant="secondary" className="hover:bg-secondary/80">
                {article.category.name}
              </Badge>
            </Link>
          )}
          {article.source && (
            <Badge variant="outline">{article.source.name}</Badge>
          )}
        </div>

        {/* Title */}
        <h1 className="mt-4 font-display text-2xl font-bold leading-tight md:text-4xl">
          {article.title}
        </h1>

        {/* Stats */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {publishDate && (
            <time dateTime={article.publish_date || undefined} className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {publishDate}
            </time>
          )}
          <span className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {article.view_count.toLocaleString()} paparan
          </span>
          <Button variant="ghost" size="sm" onClick={handleShare}>
            <Share2 className="mr-1 h-4 w-4" />
            Kongsi
          </Button>
        </div>

        {/* Content */}
        <div className="prose prose-lg mt-6 max-w-none dark:prose-invert">
          {paragraphs.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

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
                Baca penuh di sumber asal
              </a>
            </Button>
          </div>
        )}

        {/* Related Articles */}
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
              Baca penuh di sumber asal
            </a>
          </Button>
        </div>
      )}
    </MainLayout>
  );
}
