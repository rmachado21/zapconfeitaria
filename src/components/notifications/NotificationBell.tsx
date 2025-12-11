import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Cake, Truck, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { useClients } from '@/hooks/useClients';
import { cn } from '@/lib/utils';
import { openWhatsApp } from '@/lib/whatsapp';
import { WhatsAppIcon } from '@/components/shared/WhatsAppIcon';

export function NotificationBell() {
  const navigate = useNavigate();
  const { notifications, highPriorityCount, totalCount } = useNotifications();
  const { clients } = useClients();
  const [open, setOpen] = useState(false);

  const handleNotificationClick = (notification: Notification) => {
    setOpen(false);
    if ((notification.type === 'delivery' || notification.type === 'deposit_overdue') && notification.orderId) {
      navigate('/orders');
    } else if (notification.type === 'birthday') {
      navigate('/clients');
    }
  };

  const handleWhatsAppBirthday = (e: React.MouseEvent, notification: Notification) => {
    e.stopPropagation();
    
    // Find the client to get their phone number
    const client = clients.find(c => c.name === notification.clientName);
    if (!client?.phone) return;

    openWhatsApp(client.phone);
  };

  const handleWhatsAppDeposit = (e: React.MouseEvent, notification: Notification) => {
    e.stopPropagation();
    
    const client = clients.find(c => c.name === notification.clientName);
    if (!client?.phone) return;

    openWhatsApp(client.phone);
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive/10 border-destructive/20 text-destructive';
      case 'medium':
        return 'bg-warning/10 border-warning/20 text-warning';
      default:
        return 'bg-muted border-border text-muted-foreground';
    }
  };

  const getIcon = (icon: Notification['icon']) => {
    switch (icon) {
      case 'cake':
        return <Cake className="h-4 w-4" />;
      case 'truck':
        return <Truck className="h-4 w-4" />;
      case 'alert':
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getClientPhone = (clientName: string | undefined) => {
    if (!clientName) return null;
    const client = clients.find(c => c.name === clientName);
    return client?.phone;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {totalCount > 0 && (
            <span className={cn(
              "absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center",
              highPriorityCount > 0
                ? "bg-destructive text-destructive-foreground animate-pulse"
                : "bg-primary text-primary-foreground"
            )}>
              {totalCount > 99 ? '99+' : totalCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold">Notificações</h3>
          {highPriorityCount > 0 && (
            <Badge variant="destructive" className="text-[10px]">
              {highPriorityCount} urgente{highPriorityCount > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        
        <ScrollArea className="max-h-[400px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma notificação</p>
              <p className="text-xs mt-1">Você está em dia!</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "w-full p-4 hover:bg-muted/50 transition-colors flex items-start gap-3",
                    notification.priority === 'high' && "bg-destructive/5"
                  )}
                >
                  <button
                    onClick={() => handleNotificationClick(notification)}
                    className="flex items-start gap-3 flex-1 text-left"
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border",
                      getPriorityColor(notification.priority)
                    )}>
                      {getIcon(notification.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{notification.title}</p>
                      <p className={cn(
                        "text-xs mt-0.5",
                        notification.priority === 'high' 
                          ? "text-destructive font-medium" 
                          : "text-muted-foreground"
                      )}>
                        {notification.description}
                      </p>
                    </div>
                  </button>
                  
                  {/* WhatsApp button for birthday notifications */}
                  {notification.type === 'birthday' && getClientPhone(notification.clientName) && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="flex-shrink-0 text-[#25D366] hover:text-[#25D366] hover:bg-[#25D366]/10"
                      onClick={(e) => handleWhatsAppBirthday(e, notification)}
                      title="Enviar felicitação por WhatsApp"
                    >
                      <WhatsAppIcon />
                    </Button>
                  )}

                  {/* WhatsApp button for deposit overdue notifications */}
                  {notification.type === 'deposit_overdue' && getClientPhone(notification.clientName) && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="flex-shrink-0 text-[#25D366] hover:text-[#25D366] hover:bg-[#25D366]/10"
                      onClick={(e) => handleWhatsAppDeposit(e, notification)}
                      title="Cobrar sinal via WhatsApp"
                    >
                      <WhatsAppIcon />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <div className="p-3 border-t border-border bg-muted/30">
            <p className="text-xs text-center text-muted-foreground">
              Clique em uma notificação para ver detalhes
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}