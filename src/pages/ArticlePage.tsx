import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import { ms } from 'date-fns/locale';
import { ArrowLeft, Clock, Eye, ExternalLink, Share2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArticleCard } from '@/components/news/ArticleCard';
import { useArticle, useArticles, useRecordView } from '@/hooks/useArticles';
import { toast } from 'sonner';

export default function ArticlePage() {
  const { id } = useParams<{ id: string }>();
  const { data: article, isLoading, error } = useArticle(id!);
  const recordView = useRecordView();

  const { data: relatedArticles } = useArticles({
    status: 'published',
    limit: 4,
  });

  // Record view on mount
  useEffect(() => {
    if (id) {
      recordView.mutate(id);
    }
  }, [id]);

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
        <div className="container max-w-4xl py-6">
          <Skeleton className="aspect-video w-full rounded-lg" />
          <Skeleton className="mt-4 h-8 w-3/4" />
          <Skeleton className="mt-2 h-6 w-1/2" />
          <div className="mt-6 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !article) {
    return (
      <MainLayout>
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

  const related = relatedArticles?.filter((a) => a.id !== article.id).slice(0, 3) || [];

  return (
    <MainLayout>
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
        <nav className="mb-4 hidden items-center gap-2 text-sm text-muted-foreground md:flex">
          <Link to="/" className="hover:text-foreground">
            Utama
          </Link>
          <span>/</span>
          {article.category && (
            <>
              <Link
                to={`/kategori/${article.category.slug}`}
                className="hover:text-foreground"
              >
                {article.category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="truncate text-foreground">{article.title}</span>
        </nav>

        {/* Hero Image */}
        {article.image_url && (
          <div className="relative -mx-4 aspect-video overflow-hidden md:mx-0 md:rounded-xl">
            <img
              src={article.image_url}
              alt={article.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {/* Meta */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {article.is_breaking && (
            <Badge className="bg-accent text-accent-foreground">Terkini</Badge>
          )}
          {article.category && (
            <Badge variant="secondary">{article.category.name}</Badge>
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
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {publishDate}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {article.view_count.toLocaleString()} views
          </span>
          <Button variant="ghost" size="sm" onClick={handleShare}>
            <Share2 className="mr-1 h-4 w-4" />
            Kongsi
          </Button>
        </div>

        {/* Content */}
        <div className="prose prose-lg mt-6 max-w-none dark:prose-invert">
          {(() => {
            // Check if content has newlines
            if (article.content.includes('\n')) {
              return article.content
                .split(/\n+/)
                .filter((p) => p.trim())
                .map((paragraph, i) => <p key={i}>{paragraph}</p>);
            }
            // No newlines - break into sentence groups (3-4 sentences per paragraph)
            const sentences = article.content.match(/[^.!?]+[.!?]+/g) || [article.content];
            const groups: string[] = [];
            const sentencesPerGroup = 3;
            for (let i = 0; i < sentences.length; i += sentencesPerGroup) {
              groups.push(sentences.slice(i, i + sentencesPerGroup).join(' ').trim());
            }
            return groups.map((paragraph, i) => <p key={i}>{paragraph}</p>);
          })()}
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
        {related.length > 0 && (
          <section className="mt-12 border-t pt-8">
            <h2 className="mb-4 font-display text-lg font-bold md:text-xl">
              Berita Berkaitan
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </section>
        )}
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
