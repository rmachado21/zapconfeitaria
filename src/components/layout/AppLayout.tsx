import { ReactNode } from 'react';
import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { CakeSlice } from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      {/* Top header bar for mobile */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-warm flex items-center justify-center shadow-warm">
              <CakeSlice className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-semibold text-lg">Confeitaria Pro</span>
          </div>
          <NotificationBell />
        </div>
      </div>
      
      <main className="md:ml-64 pb-20 pt-12 md:pt-0 md:pb-0 min-h-screen">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}