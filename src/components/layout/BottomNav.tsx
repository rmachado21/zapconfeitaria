import { NavLink } from '@/components/NavLink';
import { Home, ShoppingBag, Users, Wallet, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', icon: Home, label: 'Início' },
  { to: '/orders', icon: ShoppingBag, label: 'Pedidos' },
  { to: '/products', icon: Package, label: 'Produtos' },
  { to: '/clients', icon: Users, label: 'Clientes' },
  { to: '/finances', icon: Wallet, label: 'Financeiro' },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-medium md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={cn(
              "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all duration-200",
              "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            )}
            activeClassName="text-primary bg-primary/10"
          >
            {({ isActive }: { isActive: boolean }) => (
              <>
                <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
                <span className={cn("text-[10px] font-medium", isActive && "text-primary")}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
