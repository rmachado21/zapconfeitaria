import { Link } from 'react-router-dom';
import { NavLink } from '@/components/NavLink';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { Home, ShoppingBag, Users, Wallet, CakeSlice, User, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import zapLogo from '@/assets/zap-confeitaria-logo.png';
import { useUserRole } from '@/hooks/useUserRole';

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Início' },
  { to: '/orders', icon: ShoppingBag, label: 'Pedidos' },
  { to: '/clients', icon: Users, label: 'Clientes' },
  { to: '/products', icon: CakeSlice, label: 'Produtos' },
  { to: '/finances', icon: Wallet, label: 'Financeiro' },
];

export function DesktopHeader() {
  const { isAdmin } = useUserRole();

  return (
    <header className="hidden md:flex fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-lg border-b border-border z-40">
      {/* Logo */}
      <div className="flex items-center px-6">
        <Link to="/dashboard">
          <img 
            src={zapLogo} 
            alt="Zap Confeitaria" 
            className="h-10 w-auto object-contain"
          />
        </Link>
      </div>

      {/* Menu Central */}
      <nav className="flex-1 flex items-center justify-center gap-1">
        {navItems.map((item) => (
          <Tooltip key={item.to}>
            <TooltipTrigger asChild>
              <NavLink
                to={item.to}
                className={cn(
                  "flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg transition-all duration-200",
                  "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
                activeClassName="bg-primary/10 text-primary font-medium"
              >
                <item.icon className="h-5 w-5" />
                <span className="hidden lg:inline">{item.label}</span>
              </NavLink>
            </TooltipTrigger>
            <TooltipContent className="lg:hidden">
              {item.label}
            </TooltipContent>
          </Tooltip>
        ))}
      </nav>

      {/* Ações à direita */}
      <div className="flex items-center gap-2 px-6">
        {isAdmin && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" asChild>
                <Link to="/admin">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Admin</TooltipContent>
          </Tooltip>
        )}
        <NotificationBell />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" asChild>
              <Link to="/profile">
                <User className="h-5 w-5 text-muted-foreground" />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Perfil</TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}
