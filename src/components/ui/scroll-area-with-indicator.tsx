import * as React from "react";
import { ScrollArea } from "./scroll-area";
import { cn } from "@/lib/utils";

interface ScrollAreaWithIndicatorProps {
  children: React.ReactNode;
  className?: string;
}

export function ScrollAreaWithIndicator({ 
  children, 
  className 
}: ScrollAreaWithIndicatorProps) {
  const [showTopIndicator, setShowTopIndicator] = React.useState(false);
  const [showBottomIndicator, setShowBottomIndicator] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const checkScrollIndicators = React.useCallback(() => {
    const viewport = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (!viewport) return;

    const { scrollTop, scrollHeight, clientHeight } = viewport;
    const hasScrollableContent = scrollHeight > clientHeight;
    
    // Show top indicator if scrolled down
    setShowTopIndicator(scrollTop > 10);
    
    // Show bottom indicator if there's more content below
    setShowBottomIndicator(hasScrollableContent && scrollTop < scrollHeight - clientHeight - 10);
  }, []);

  React.useEffect(() => {
    const viewport = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (!viewport) return;

    // Initial check
    checkScrollIndicators();

    // Check on scroll
    viewport.addEventListener('scroll', checkScrollIndicators);
    
    // Check on resize
    const resizeObserver = new ResizeObserver(checkScrollIndicators);
    resizeObserver.observe(viewport);

    return () => {
      viewport.removeEventListener('scroll', checkScrollIndicators);
      resizeObserver.disconnect();
    };
  }, [checkScrollIndicators]);

  // Re-check when children change
  React.useEffect(() => {
    const timer = setTimeout(checkScrollIndicators, 100);
    return () => clearTimeout(timer);
  }, [children, checkScrollIndicators]);

  return (
    <div ref={scrollRef} className="relative flex-1 min-h-0">
      {/* Top fade indicator */}
      <div 
        className={cn(
          "absolute top-0 left-0 right-4 h-6 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none transition-opacity duration-200",
          showTopIndicator ? "opacity-100" : "opacity-0"
        )}
      />
      
      <ScrollArea className={cn("h-full", className)}>
        {children}
      </ScrollArea>
      
      {/* Bottom fade indicator */}
      <div 
        className={cn(
          "absolute bottom-0 left-0 right-4 h-8 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none transition-opacity duration-200",
          showBottomIndicator ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
  );
}
