import { Skeleton } from '@/components/ui/skeleton';

export function ArticleSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-[16/10] w-full rounded-lg" />
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

export function ArticleGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(count)].map((_, i) => (
        <ArticleSkeleton key={i} />
      ))}
    </div>
  );
}

export function ArticlePageSkeleton() {
  return (
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
  );
}

export function CategorySkeleton() {
  return <Skeleton className="aspect-square rounded-lg" />;
}

export function CategoryGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {[...Array(count)].map((_, i) => (
        <CategorySkeleton key={i} />
      ))}
    </div>
  );
}

export function TrendingListSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CompactArticleSkeleton() {
  return (
    <div className="flex gap-3 p-2">
      <Skeleton className="h-16 w-16 shrink-0 rounded-md" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}
