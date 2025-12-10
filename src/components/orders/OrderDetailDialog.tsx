import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Order } from '@/hooks/useOrders';
import { useQuotePdf } from '@/hooks/useQuotePdf';
import { useProfile } from '@/hooks/useProfile';
import { ORDER_STATUS_CONFIG, OrderStatus } from '@/types';
import { 
  Calendar, 
  MapPin, 
  Phone, 
  FileText, 
  MessageCircle, 
  Loader2,
  User,
  Package,
  Banknote,
  Send
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { openWhatsApp } from '@/lib/whatsapp';

interface OrderDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
}

export function OrderDetailDialog({ open, onOpenChange, order }: OrderDetailDialogProps) {
  const { generatePdf, isGenerating } = useQuotePdf();
  const { profile } = useProfile();

  if (!order) return null;

  const statusConfig = ORDER_STATUS_CONFIG[order.status as OrderStatus];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'A definir';
    try {
      return format(parseISO(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  const handleGeneratePdf = async () => {
    await generatePdf(order.id);
  };

  const handleWhatsApp = () => {
    if (!order.client?.phone) return;

    const phone = order.client.phone.replace(/\D/g, '');
    const formattedPhone = phone.startsWith('55') ? phone : `55${phone}`;
    
    const companyName = profile?.company_name || 'Confeitaria Pro';
    const deliveryDate = order.delivery_date 
      ? format(parseISO(order.delivery_date), "dd/MM/yyyy", { locale: ptBR })
      : 'a definir';
    
    const itemsList = (order.order_items || [])
      .map(item => `• ${item.quantity}x ${item.product_name}`)
      .join('\n');

    const message = `Olá ${order.client?.name}! 👋

Aqui é da *${companyName}*!

Segue o orçamento do seu pedido:

📅 *Data de Entrega:* ${deliveryDate}
${order.delivery_address ? `📍 *Endereço:* ${order.delivery_address}\n` : ''}
📦 *Itens:*
${itemsList}

💰 *Valor Total:* ${formatCurrency(order.total_amount)}
💳 *Sinal (50%):* ${formatCurrency(order.total_amount / 2)}

${profile?.pix_key ? `*Chave Pix:* ${profile.pix_key}\n` : ''}
Para confirmar o pedido, por favor efetue o pagamento do sinal.

Ficamos à disposição! 🍰`;

    openWhatsApp(formattedPhone, message);
  };

  const depositAmount = order.total_amount / 2;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-3">
            <Package className="h-5 w-5 text-primary" />
            Detalhes do Pedido
            <Badge className={cn(statusConfig.bgColor, statusConfig.color, "text-xs")}>
              {statusConfig.label}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Client Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{order.client?.name || 'Cliente não encontrado'}</p>
                  {order.client?.phone && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {order.client.phone}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Info */}
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  Data de Entrega
                </div>
                <p className="font-medium text-sm">{formatDate(order.delivery_date)}</p>
              </CardContent>
            </Card>
            {order.delivery_address && (
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <MapPin className="h-4 w-4" />
                    Endereço
                  </div>
                  <p className="font-medium text-sm truncate">{order.delivery_address}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Items */}
          <Card>
            <CardContent className="p-4">
              <p className="font-semibold mb-3 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Itens do Pedido
              </p>
              <div className="space-y-2">
                {(order.order_items || []).map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>
                      {item.quantity}x {item.product_name}
                    </span>
                    <span className="font-medium">
                      {formatCurrency(item.quantity * item.unit_price)}
                    </span>
                  </div>
                ))}
              </div>
              
              <Separator className="my-3" />
              
              <div className="space-y-1 text-sm">
                {order.delivery_fee > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Taxa de entrega</span>
                    <span>{formatCurrency(order.delivery_fee)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-base">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(order.total_amount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deposit Status */}
          <Card className={order.deposit_paid ? 'bg-success/5 border-success/20' : 'bg-warning/5 border-warning/20'}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Banknote className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Sinal 50%</p>
                    <p className="text-sm text-muted-foreground">{formatCurrency(depositAmount)}</p>
                  </div>
                </div>
                <Badge variant={order.deposit_paid ? 'success' : 'warning'}>
                  {order.deposit_paid ? 'Pago' : 'Pendente'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-1">Observações</p>
                <p className="text-sm">{order.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleGeneratePdf}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileText className="mr-2 h-4 w-4" />
              )}
              Gerar PDF
            </Button>
            <Button 
              variant="warm" 
              className="flex-1"
              onClick={handleWhatsApp}
              disabled={!order.client?.phone}
            >
              <Send className="mr-2 h-4 w-4" />
              Enviar WhatsApp
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
