import * as React from "react";

const MOBILE_BREAKPOINT = 768;

// Synchronous function for immediate mobile detection (works outside React components)
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check touch capability
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Check screen size
  const isSmallScreen = window.innerWidth < MOBILE_BREAKPOINT;
  
  // Check user agent for mobile indicators
  const mobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  
  // Check if running as PWA/standalone
  const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                (window.navigator as any).standalone === true;
  
  // Consider mobile if: (has touch AND small screen) OR mobile user agent OR (PWA on touch device)
  return (hasTouch && isSmallScreen) || mobileUserAgent || (isPWA && hasTouch);
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}
