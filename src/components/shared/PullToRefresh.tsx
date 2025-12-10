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
      {/* Pull indicator - fixed position so it doesn't affect layout */}
      <div
        className="fixed left-0 right-0 flex justify-center items-center pointer-events-none z-[60]"
        style={{
          top: 56 + pullDistance - 50,
          opacity: progress,
          transition: pullDistance === 0 ? 'top 0.2s ease-out, opacity 0.2s ease-out' : 'none',
        }}
      >
        <div
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-full bg-background border border-border shadow-md",
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
      
      {/* Content - no transform to avoid affecting fixed children */}
      <div
        style={{
          paddingTop: pullDistance,
          transition: pullDistance === 0 ? 'padding-top 0.2s ease-out' : 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
}
