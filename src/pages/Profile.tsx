import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CakeSlice, 
  Settings, 
  CreditCard, 
  Bell, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  Crown
} from 'lucide-react';

const Profile = () => {
  const menuItems = [
    { icon: Settings, label: 'Configurações da Conta', to: '/settings' },
    { icon: CreditCard, label: 'Assinatura', to: '/subscription', badge: 'Pro' },
    { icon: Bell, label: 'Notificações', to: '/notifications' },
    { icon: HelpCircle, label: 'Ajuda e Suporte', to: '/help' },
  ];

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Profile Header */}
        <Card variant="gradient" className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl gradient-warm flex items-center justify-center shadow-warm">
                <CakeSlice className="h-10 w-10 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-display font-bold text-foreground">
                    Doce Encanto
                  </h1>
                  <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0">
                    <Crown className="h-3 w-3 mr-1" />
                    Pro
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm">contato@doceencanto.com.br</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Membro desde Janeiro 2024
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="text-center">
            <CardContent className="p-4">
              <p className="text-2xl font-display font-bold text-primary">156</p>
              <p className="text-xs text-muted-foreground">Pedidos</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <p className="text-2xl font-display font-bold text-primary">48</p>
              <p className="text-xs text-muted-foreground">Clientes</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <p className="text-2xl font-display font-bold text-primary">23</p>
              <p className="text-xs text-muted-foreground">Produtos</p>
            </CardContent>
          </Card>
        </div>

        {/* Menu Items */}
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                      <item.icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <span className="font-medium text-sm">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <Badge variant="terracotta">{item.badge}</Badge>
                    )}
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Button 
          variant="ghost" 
          className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-5 w-5 mr-2" />
          Sair da Conta
        </Button>
      </div>
    </AppLayout>
  );
};

export default Profile;
