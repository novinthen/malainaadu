import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ms } from 'date-fns/locale';
import { Eye, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/constants/routes';

interface TopArticle {
  id: string;
  title: string;
  view_count: number;
  publish_date: string | null;
  category: { name: string } | null;
  source: { name: string } | null;
}

interface TopArticlesTableProps {
  data: TopArticle[] | undefined;
  isLoading: boolean;
}

export function TopArticlesTable({ data, isLoading }: TopArticlesTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Artikel Terbaik</CardTitle>
        <CardDescription>Artikel dengan tontonan tertinggi</CardDescription>
      </CardHeader>
      <CardContent>
        {data?.length ? (
          <div className="space-y-3">
            {data.map((article, index) => (
              <div
                key={article.id}
                className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="line-clamp-1 font-medium text-sm">{article.title}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {article.category && (
                      <Badge variant="secondary" className="text-xs">
                        {article.category.name}
                      </Badge>
                    )}
                    {article.source && (
                      <span>{article.source.name}</span>
                    )}
                    {article.publish_date && (
                      <span>
                        {formatDistanceToNow(new Date(article.publish_date), {
                          addSuffix: true,
                          locale: ms,
                        })}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{article.view_count.toLocaleString()}</span>
                  <Link
                    to={ROUTES.ARTICLE(article.id)}
                    target="_blank"
                    className="ml-2 text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-muted-foreground">
            Tiada data artikel lagi
          </p>
        )}
      </CardContent>
    </Card>
  );
}
