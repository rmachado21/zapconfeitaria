import { Order, ORDER_STATUS_CONFIG } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, MapPin, MessageCircle, ChevronRight, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { openWhatsApp } from '@/lib/whatsapp';
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

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!order.clientPhone) return;
    
    const message = `Olá ${order.clientName}! Aqui é da Confeitaria Pro. Sobre seu pedido para o dia ${formatDate(order.deliveryDate)}...`;
    openWhatsApp(order.clientPhone, message);
  };

  const handleDepositChange = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Card 
      variant="elevated" 
      className="cursor-pointer group hover:border-primary/30 hover:shadow-warm transition-all duration-200 animate-fade-in"
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* Header: Status + Price */}
        <div className="flex items-center justify-between mb-3">
          <Badge className={cn(statusConfig.bgColor, statusConfig.color, "text-[10px] font-semibold")}>
            {statusConfig.label}
          </Badge>
          <span className="font-bold text-lg text-primary">
            {formatCurrency(order.totalAmount)}
          </span>
        </div>

        {/* Client Name */}
        <h3 className="font-semibold text-base text-foreground truncate mb-2">
          {order.clientName}
        </h3>

        {/* Items preview with icon */}
        <div className="flex items-start gap-2 mb-3">
          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
            <Package className="h-3.5 w-3.5 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 pt-0.5">
            {order.items.length > 0 
              ? order.items.map(item => `${item.quantity}x ${item.productName}`).join(', ')
              : 'Nenhum item'}
          </p>
        </div>

        {/* Meta info with icons */}
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
              <Calendar className="h-3 w-3 text-muted-foreground" />
            </div>
            <span className="text-foreground font-medium">{formatDate(order.deliveryDate)}</span>
          </div>
          {order.deliveryAddress && (
            <div className="flex items-center gap-1.5 text-xs">
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                <MapPin className="h-3 w-3 text-muted-foreground" />
              </div>
              <span className="text-muted-foreground truncate max-w-[100px]">{order.deliveryAddress}</span>
            </div>
          )}
        </div>

        {/* Actions row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {order.clientPhone && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-success hover:text-success hover:bg-success/10 gap-1.5"
                onClick={handleWhatsAppClick}
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-xs font-medium">WhatsApp</span>
              </Button>
            )}
          </div>
          <div className="flex items-center gap-1 text-muted-foreground group-hover:text-primary transition-colors">
            <span className="text-xs">Ver detalhes</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>

        {/* Deposit indicator */}
        {order.status !== 'delivered' && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between">
              <div 
                className="flex items-center gap-2"
                onClick={handleDepositChange}
              >
                <Checkbox 
                  checked={order.depositPaid}
                  onCheckedChange={(checked) => onDepositChange?.(!!checked)}
                  className="data-[state=checked]:bg-success data-[state=checked]:border-success"
                />
                <span className="text-sm text-muted-foreground">
                  Sinal 50%: <span className="font-medium text-foreground">{formatCurrency(order.depositAmount)}</span>
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
