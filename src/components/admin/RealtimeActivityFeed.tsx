import { Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface RecentView {
  id: string;
  articleId: string;
  articleTitle: string;
  viewedAt: Date;
}

interface RealtimeActivityFeedProps {
  recentViews: RecentView[];
  className?: string;
}

export function RealtimeActivityFeed({ recentViews, className }: RealtimeActivityFeedProps) {
  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 5) return 'baru sahaja';
    if (seconds < 60) return `${seconds} saat lalu`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minit lalu`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} jam lalu`;
    return `${Math.floor(seconds / 86400)} hari lalu`;
  };

  const truncateTitle = (title: string, maxLength: number = 50) => {
    if (title.length <= maxLength) return title;
    return title.slice(0, maxLength) + '...';
  };

  if (recentViews.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Aktiviti Terkini
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <Eye className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">Tiada aktiviti terkini</p>
            <p className="text-xs">Tontonan baharu akan muncul di sini secara langsung</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Aktiviti Terkini
          <span className="ml-auto text-xs font-normal text-muted-foreground">
            {recentViews.length} tontonan
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px]">
          <div className="space-y-0">
            {recentViews.map((view, index) => (
              <div
                key={view.id}
                className={cn(
                  'flex items-start gap-3 px-6 py-3 border-b last:border-b-0',
                  'transition-all duration-500 ease-out',
                  index === 0 && 'animate-fade-in bg-primary/5'
                )}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Eye className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-tight truncate">
                    {truncateTitle(view.articleTitle)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatTimeAgo(view.viewedAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
