import { ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: ReactNode;
  className?: string;
}

export function PullToRefresh({ onRefresh, children, className }: PullToRefreshProps) {
  const { containerRef, pullDistance, isRefreshing, progress } = usePullToRefresh({
    onRefresh,
    threshold: 80,
    maxPull: 120,
  });

  return (
    <div ref={containerRef} className={cn("relative min-h-full", className)}>
      {/* Pull indicator */}
      <div
        className="absolute left-0 right-0 flex justify-center items-center pointer-events-none z-50 overflow-hidden"
        style={{
          top: -60,
          height: 60,
          transform: `translateY(${pullDistance}px)`,
          opacity: progress,
        }}
      >
        <div
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 border border-primary/20",
            isRefreshing && "animate-pulse"
          )}
        >
          <RefreshCw
            className={cn(
              "w-5 h-5 text-primary transition-transform duration-200",
              isRefreshing && "animate-spin"
            )}
            style={{
              transform: isRefreshing ? undefined : `rotate(${progress * 360}deg)`,
            }}
          />
        </div>
      </div>
      
      {/* Content with pull offset */}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: pullDistance === 0 ? 'transform 0.2s ease-out' : 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
}
