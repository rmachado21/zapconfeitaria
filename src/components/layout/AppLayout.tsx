import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { DesktopHeader } from './DesktopHeader';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { TodayDeliveriesBanner } from './TodayDeliveriesBanner';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import zapLogo from '@/assets/zap-confeitaria-logo.png';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <DesktopHeader />
      
      {/* Top header bar for mobile */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between px-4 py-2">
          <img 
            src={zapLogo} 
            alt="Zap Confeitaria" 
            className="h-8 sm:h-10 w-auto object-contain"
          />
          <div className="flex items-center gap-1">
            <NotificationBell />
            <Button variant="ghost" size="icon" asChild className="h-9 w-9">
              <Link to="/profile">
                <User className="h-5 w-5 text-muted-foreground" />
              </Link>
            </Button>
          </div>
        </div>
        <TodayDeliveriesBanner />
      </div>
      
      {/* Desktop banner */}
      <div className="hidden md:block pt-16">
        <TodayDeliveriesBanner />
      </div>
      
      <main className="pb-20 pt-12 md:pt-16 md:pb-0 min-h-screen">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}