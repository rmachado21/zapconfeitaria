import { NavLink } from '@/components/NavLink';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { Home, ShoppingBag, Users, Wallet, User, CakeSlice, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', icon: Home, label: 'Início' },
  { to: '/orders', icon: ShoppingBag, label: 'Pedidos' },
  { to: '/clients', icon: Users, label: 'Clientes' },
  { to: '/products', icon: CakeSlice, label: 'Produtos' },
  { to: '/finances', icon: Wallet, label: 'Financeiro' },
];

const bottomItems = [
  { to: '/profile', icon: User, label: 'Perfil' },
  { to: '/settings', icon: Settings, label: 'Configurações' },
];

export function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-64 h-screen bg-card border-r border-border fixed left-0 top-0">
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center shadow-warm">
            <CakeSlice className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display font-semibold text-lg text-foreground">
              Confeitaria Pro
            </h1>
            <p className="text-xs text-muted-foreground">Gestão de Pedidos</p>
          </div>
        </div>
        <NotificationBell />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
              "text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
            activeClassName="bg-primary/10 text-primary font-medium"
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom Navigation */}
      <div className="px-3 py-4 border-t border-border space-y-1">
        {bottomItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
              "text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
            activeClassName="bg-primary/10 text-primary font-medium"
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </aside>
  );
}
