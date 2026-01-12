import { useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string | null | undefined;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  fallback?: React.ReactNode;
  aspectRatio?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className,
  fallback,
  aspectRatio = '16/10',
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  if (!src || hasError) {
    return (
      fallback || (
        <div
          className={cn(
            'flex items-center justify-center bg-muted',
            className
          )}
          style={{ aspectRatio }}
        >
          <span className="text-3xl text-muted-foreground">📰</span>
        </div>
      )
    );
  }

  return (
    <div className={cn('relative overflow-hidden', className)} style={{ aspectRatio }}>
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-muted" />
      )}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={cn(
          'h-full w-full object-cover transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
      />
    </div>
  );
}
