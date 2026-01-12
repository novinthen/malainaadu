import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useBreakingNews } from '@/hooks/useArticles';

export function BreakingNewsTicker() {
  const { data: breakingNews, isLoading } = useBreakingNews();

  if (isLoading || !breakingNews?.length) return null;

  return (
    <div className="overflow-hidden bg-primary text-primary-foreground">
      <div className="container flex items-center gap-3 py-2">
        <div className="flex shrink-0 items-center gap-1.5 rounded bg-accent px-2 py-1 text-accent-foreground">
          <span className="h-2 w-2 animate-pulse-dot rounded-full bg-current" />
          <span className="text-xs font-bold uppercase tracking-wider">
            முக்கிய
          </span>
        </div>
        <div className="relative flex-1 overflow-hidden">
          <div className="animate-ticker flex whitespace-nowrap">
            {breakingNews.map((article, index) => (
              <Link
                key={article.id}
                to={`/berita/${article.slug}`}
                className="inline-flex items-center gap-4 pr-8 text-sm font-medium hover:underline"
              >
                <span>{article.title}</span>
                {index < breakingNews.length - 1 && (
                  <span className="text-primary-foreground/50">•</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
