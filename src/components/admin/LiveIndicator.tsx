import { cn } from '@/lib/utils';

interface LiveIndicatorProps {
  isLive: boolean;
  lastUpdate: Date | null;
  className?: string;
}

export function LiveIndicator({ isLive, lastUpdate, className }: LiveIndicatorProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ms-MY', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex items-center gap-1.5">
        <span
          className={cn(
            'relative flex h-2.5 w-2.5',
            isLive && 'animate-pulse'
          )}
        >
          <span
            className={cn(
              'absolute inline-flex h-full w-full rounded-full opacity-75',
              isLive ? 'bg-green-500 animate-ping' : 'bg-muted-foreground'
            )}
          />
          <span
            className={cn(
              'relative inline-flex h-2.5 w-2.5 rounded-full',
              isLive ? 'bg-green-500' : 'bg-muted-foreground'
            )}
          />
        </span>
        <span
          className={cn(
            'text-xs font-medium',
            isLive ? 'text-green-600' : 'text-muted-foreground'
          )}
        >
          {isLive ? 'Live' : 'Connecting...'}
        </span>
      </div>
      {lastUpdate && (
        <span className="text-xs text-muted-foreground">
          Kemas kini: {formatTime(lastUpdate)}
        </span>
      )}
    </div>
  );
}
