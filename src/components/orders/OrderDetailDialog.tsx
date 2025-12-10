import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Order } from '@/hooks/useOrders';
import { useQuotePdf } from '@/hooks/useQuotePdf';
import { useProfile } from '@/hooks/useProfile';
import { ORDER_STATUS_CONFIG, OrderStatus } from '@/types';
import { 
  Calendar, 
  MapPin, 
  Phone, 
  FileText, 
  Loader2,
  User,
  Package,
  Banknote,
  Send,
  ChevronDown,
  Pencil,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { openWhatsApp } from '@/lib/whatsapp';
import { formatPhone } from '@/lib/masks';
import { PdfPreviewDialog } from './PdfPreviewDialog';

interface OrderDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  onStatusChange?: (orderId: string, status: OrderStatus, clientName?: string, totalAmount?: number) => void;
  onEdit?: (order: Order) => void;
  onDelete?: (orderId: string) => void;
}

const ALL_STATUSES: OrderStatus[] = ['quote', 'awaiting_deposit', 'in_production', 'ready', 'delivered'];

export function OrderDetailDialog({ open, onOpenChange, order, onStatusChange, onEdit, onDelete }: OrderDetailDialogProps) {
  const { openPreview, closePreview, downloadFromPreview, showPreview, previewData, isGenerating } = useQuotePdf();
  const { profile } = useProfile();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  if (!order) return null;

  const statusConfig = ORDER_STATUS_CONFIG[order.status as OrderStatus];
  const canEditOrDelete = order.status === 'quote' || order.status === 'awaiting_deposit';

  const handleDelete = () => {
    if (onDelete) {
      onDelete(order.id);
      setDeleteDialogOpen(false);
      onOpenChange(false);
    }
  };

  const handleStatusChange = (newStatus: OrderStatus) => {
    if (newStatus !== order.status && onStatusChange) {
      onStatusChange(order.id, newStatus, order.client?.name, order.total_amount);
    }
  };

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

  const getDaysRemaining = (dateString: string | null) => {
    if (!dateString) return null;
    try {
      const deliveryDate = parseISO(dateString);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      deliveryDate.setHours(0, 0, 0, 0);
      const diff = differenceInDays(deliveryDate, today);
      
      if (diff < 0) return { text: 'Atrasado', urgent: true };
      if (diff === 0) return { text: 'Hoje!', urgent: true };
      if (diff === 1) return { text: 'Amanhã', urgent: true };
      return { text: `faltam ${diff} dias`, urgent: diff <= 3 };
    } catch {
      return null;
    }
  };

  const daysRemaining = order.status !== 'delivered' ? getDaysRemaining(order.delivery_date) : null;

  const handleGeneratePdf = async () => {
    await openPreview(order.id);
  };

  const handleWhatsApp = () => {
    if (!order.client?.phone) return;

    const phone = order.client.phone.replace(/\D/g, '');
    const formattedPhone = phone.startsWith('55') ? phone : `55${phone}`;
    
    const companyName = profile?.company_name || 'Confeitaria Pro';
    const deliveryDate = order.delivery_date 
      ? format(parseISO(order.delivery_date), "dd/MM/yyyy", { locale: ptBR })
      : 'a definir';
    
    const formatUnitType = (type: string) => {
      if (type === 'kg') return 'Kg';
      if (type === 'cento') return 'Cento';
      return 'Un';
    };

    const itemsList = (order.order_items || [])
      .map(item => `• ${item.quantity} ${formatUnitType(item.unit_type)} ${item.product_name}`)
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
          </DialogTitle>
        </DialogHeader>

        {/* Status Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status:</span>
          {onStatusChange ? (
            <Select
              value={order.status}
              onValueChange={(value) => handleStatusChange(value as OrderStatus)}
            >
              <SelectTrigger className={cn(
                "w-auto h-8 text-xs font-medium border-0",
                statusConfig.bgColor,
                statusConfig.color
              )}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALL_STATUSES.map((status) => {
                  const config = ORDER_STATUS_CONFIG[status];
                  return (
                    <SelectItem key={status} value={status}>
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", config.bgColor)} />
                        {config.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          ) : (
            <Badge className={cn(statusConfig.bgColor, statusConfig.color, "text-xs")}>
              {statusConfig.label}
            </Badge>
          )}
        </div>

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
                      {formatPhone(order.client.phone)}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Info */}
          <div className={cn("grid gap-3", order.delivery_address ? "grid-cols-2" : "grid-cols-1")}>
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Data de Entrega
                  </div>
                  {daysRemaining && (
                    <span className={cn(
                      "text-xs font-medium",
                      daysRemaining.urgent ? "text-destructive" : "text-muted-foreground"
                    )}>
                      ({daysRemaining.text})
                    </span>
                  )}
                </div>
                <p className="font-medium text-sm mt-1">{formatDate(order.delivery_date)}</p>
              </CardContent>
            </Card>
            {order.delivery_address && (
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    Endereço
                  </div>
                  <p className="font-medium text-sm mt-1 truncate">{order.delivery_address}</p>
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
                  {(order.order_items || []).map((item, index) => {
                    const unitLabel = item.unit_type === 'kg' ? 'Kg' : item.unit_type === 'cento' ? 'Cento' : 'Un';
                    return (
                    <div key={index} className="flex justify-between text-sm">
                      <span>
                        {item.quantity} {unitLabel} {item.product_name}
                      </span>
                      <span className="font-medium">
                        {formatCurrency(item.quantity * item.unit_price)}
                      </span>
                    </div>
                  )})}
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
          <div className="flex flex-col gap-2 pt-2">
            <div className="flex gap-2">
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
            
            {/* Edit/Delete buttons for quote and awaiting_deposit */}
            {canEditOrDelete && (
              <div className="flex gap-3 pt-2">
                {onEdit && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      onEdit(order);
                      onOpenChange(false);
                    }}
                  >
                    <Pencil className="mr-1.5 h-3.5 w-3.5" />
                    Editar
                  </Button>
                )}
                {onDelete && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Excluir
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <AlertDialogTitle>Excluir Pedido</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pt-2">
              Tem certeza que deseja excluir este pedido de <strong>{order.client?.name}</strong>? 
              Esta ação não pode ser desfeita e todas as informações serão perdidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir Pedido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* PDF Preview Dialog */}
      <PdfPreviewDialog
        open={showPreview}
        onOpenChange={(open) => !open && closePreview()}
        pdfData={previewData?.pdf || null}
        fileName={previewData?.fileName || ''}
        isLoading={isGenerating}
        onDownload={downloadFromPreview}
      />
    </Dialog>
  );
}
