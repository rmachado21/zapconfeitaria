import { Order, ORDER_STATUS_CONFIG } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, MapPin, MessageCircle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface OrderCardProps {
  order: Order;
  onClick?: () => void;
  onDepositChange?: (depositPaid: boolean) => void;
}

export function OrderCard({ order, onClick, onDepositChange }: OrderCardProps) {
  const statusConfig = ORDER_STATUS_CONFIG[order.status];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Sem data';
    try {
      return format(parseISO(dateString), "dd 'de' MMM", { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  const openWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!order.clientPhone) return;
    
    const phone = order.clientPhone.replace(/\D/g, '');
    const formattedPhone = phone.startsWith('55') ? phone : `55${phone}`;
    const message = encodeURIComponent(
      `Olá ${order.clientName}! Aqui é da Confeitaria Pro. Sobre seu pedido para o dia ${formatDate(order.deliveryDate)}...`
    );
    window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank');
  };

  const handleDepositChange = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Card 
      variant="elevated" 
      className="cursor-pointer group hover:border-primary/30 animate-fade-in"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Client & Status */}
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-foreground truncate">
                {order.clientName}
              </h3>
              <Badge className={cn(statusConfig.bgColor, statusConfig.color, "text-[10px]")}>
                {statusConfig.label}
              </Badge>
            </div>

            {/* Items preview */}
            <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
              {order.items.length > 0 
                ? order.items.map(item => `${item.quantity}x ${item.productName}`).join(', ')
                : 'Nenhum item'}
            </p>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formatDate(order.deliveryDate)}</span>
              </div>
              {order.deliveryAddress && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="truncate max-w-[120px]">{order.deliveryAddress}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right side: Price & Actions */}
          <div className="flex flex-col items-end gap-2">
            <span className="font-display font-semibold text-lg text-primary">
              {formatCurrency(order.totalAmount)}
            </span>
            <div className="flex items-center gap-1">
              {order.clientPhone && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-success hover:text-success hover:bg-success/10"
                  onClick={openWhatsApp}
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
              )}
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </div>
        </div>

        {/* Deposit indicator */}
        {order.status !== 'delivered' && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between text-xs">
              <div 
                className="flex items-center gap-2"
                onClick={handleDepositChange}
              >
                <Checkbox 
                  checked={order.depositPaid}
                  onCheckedChange={(checked) => onDepositChange?.(!!checked)}
                />
                <span className="text-muted-foreground">
                  Sinal 50%: {formatCurrency(order.depositAmount)}
                </span>
              </div>
              {order.depositPaid ? (
                <Badge variant="success" className="text-[10px]">Pago</Badge>
              ) : (
                <Badge variant="warning" className="text-[10px]">Pendente</Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
