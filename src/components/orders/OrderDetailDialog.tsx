import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Order, formatOrderNumber } from "@/hooks/useOrders";
import { useQuotePdf } from "@/hooks/useQuotePdf";
import { useProfile } from "@/hooks/useProfile";
import { getAvailableTemplates } from "@/lib/whatsappTemplates";
import { WhatsAppTemplatePreview } from "./WhatsAppTemplatePreview";
import { ORDER_STATUS_CONFIG, OrderStatus } from "@/types";
import {
  Calendar,
  MapPin,
  Phone,
  Share2,
  Download,
  Loader2,
  User,
  Package,
  Banknote,
  Pencil,
  Trash2,
  AlertTriangle,
  Gift,
  PackagePlus,
  CreditCard,
  Check,
} from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { formatPhone } from "@/lib/masks";
import { CurrencyInput } from "@/components/shared/CurrencyInput";

interface OrderDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  onStatusChange?: (
    orderId: string,
    status: OrderStatus,
    clientName?: string,
    totalAmount?: number,
    previousStatus?: OrderStatus,
    fullPaymentReceived?: boolean,
  ) => void;
  onDepositChange?: (
    orderId: string,
    depositPaid: boolean,
    clientName?: string,
    totalAmount?: number,
    currentStatus?: OrderStatus,
  ) => void;
  onFullPayment?: (
    orderId: string,
    paymentMethod: 'pix' | 'credit_card' | 'link',
    fee: number,
    orderNumber: number | null,
    clientName?: string,
    totalAmount?: number,
    currentStatus?: OrderStatus,
  ) => void;
  onUndoFullPayment?: (orderId: string) => void;
  onEdit?: (order: Order) => void;
  onDelete?: (orderId: string) => void;
}

const ALL_STATUSES: OrderStatus[] = ["quote", "awaiting_deposit", "in_production", "ready", "delivered", "cancelled"];

export function OrderDetailDialog({
  open,
  onOpenChange,
  order,
  onStatusChange,
  onDepositChange,
  onFullPayment,
  onUndoFullPayment,
  onEdit,
  onDelete,
}: OrderDetailDialogProps) {
  const { sharePdf, downloadPdf, isGenerating } = useQuotePdf();
  const { profile } = useProfile();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deliveredConfirmOpen, setDeliveredConfirmOpen] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);

  // Local optimistic state for status
  const [displayStatus, setDisplayStatus] = useState<OrderStatus | null>(null);

  // Local optimistic state for deposit
  const [displayDepositPaid, setDisplayDepositPaid] = useState<boolean>(false);

  // Local optimistic state for full payment
  const [displayFullPayment, setDisplayFullPayment] = useState<boolean>(false);

  // Full payment form state
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'pix' | 'credit_card' | 'link' | ''>('');
  const [paymentFee, setPaymentFee] = useState<number>(0);
  const [feeType, setFeeType] = useState<'value' | 'percentage'>('percentage');

  // Sync displayStatus, displayDepositPaid and displayFullPayment with order when order changes
  useEffect(() => {
    if (order) {
      setDisplayStatus(order.status as OrderStatus);
      setDisplayDepositPaid(order.deposit_paid ?? false);
      setDisplayFullPayment(order.full_payment_received ?? false);
      setSelectedPaymentMethod('');
      setPaymentFee(0);
      setFeeType('percentage');
    }
  }, [order?.status, order?.id, order?.deposit_paid, order?.full_payment_received]);

  // Calculate net amount for full payment - must be before early return
  const feeInReais = useMemo(() => {
    if (!order) return 0;
    if (feeType === 'percentage') {
      return (order.total_amount * paymentFee) / 100;
    }
    return paymentFee;
  }, [feeType, paymentFee, order?.total_amount]);

  if (!order) return null;

  const currentStatus = displayStatus || (order.status as OrderStatus);
  const statusConfig = ORDER_STATUS_CONFIG[currentStatus];
  const canEditOrDelete = order.status === "quote" || order.status === "awaiting_deposit";

  const handleDelete = () => {
    if (onDelete) {
      onDelete(order.id);
      setDeleteDialogOpen(false);
      onOpenChange(false);
    }
  };

  const handleStatusChange = (newStatus: OrderStatus) => {
    if (newStatus !== currentStatus && onStatusChange) {
      // Update display immediately (optimistic update)
      setDisplayStatus(newStatus);

      // If changing to delivered, show confirmation dialog only if NOT paid in full
      if (newStatus === "delivered") {
        if (displayFullPayment) {
          // Already paid in full, no confirmation needed
          onStatusChange(order.id, newStatus, order.client?.name, order.total_amount, order.status as OrderStatus, true);
        } else {
          setPendingStatus(newStatus);
          setDeliveredConfirmOpen(true);
        }
      } else if (newStatus === "cancelled") {
        setPendingStatus(newStatus);
        setCancelConfirmOpen(true);
      } else {
        onStatusChange(order.id, newStatus, order.client?.name, order.total_amount, order.status as OrderStatus, displayFullPayment);
      }
    }
  };

  const confirmDelivered = () => {
    if (pendingStatus && onStatusChange) {
      onStatusChange(order.id, pendingStatus, order.client?.name, order.total_amount, order.status as OrderStatus, displayFullPayment);
    }
    setDeliveredConfirmOpen(false);
    setPendingStatus(null);
  };

  const cancelDelivered = () => {
    // Revert optimistic update
    setDisplayStatus(order.status as OrderStatus);
    setDeliveredConfirmOpen(false);
    setPendingStatus(null);
  };

  const confirmCancelled = () => {
    if (pendingStatus && onStatusChange) {
      onStatusChange(order.id, pendingStatus, order.client?.name, order.total_amount, order.status as OrderStatus, displayFullPayment);
    }
    setCancelConfirmOpen(false);
    setPendingStatus(null);
  };

  const cancelCancelled = () => {
    // Revert optimistic update
    setDisplayStatus(order.status as OrderStatus);
    setCancelConfirmOpen(false);
    setPendingStatus(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string | null, timeString?: string | null) => {
    if (!dateString) return "A definir";
    try {
      // Formato: "Sexta-feira, 12 de Dez"
      const formatted = format(parseISO(dateString), "EEEE, dd 'de' MMM", { locale: ptBR });
      // Capitalizar primeira letra
      const capitalizedDate = formatted.charAt(0).toUpperCase() + formatted.slice(1);
      if (timeString) {
        return `${capitalizedDate} às ${timeString.slice(0, 5)}`;
      }
      return capitalizedDate;
    } catch {
      return "Data inválida";
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

      if (diff < 0) return { text: "Atrasado", urgent: true };
      if (diff === 0) return { text: "Hoje!", urgent: true };
      if (diff === 1) return { text: "Amanhã", urgent: true };
      return { text: `faltam ${diff} dias`, urgent: diff <= 3 };
    } catch {
      return null;
    }
  };

  const daysRemaining = order.status !== "delivered" ? getDaysRemaining(order.delivery_date) : null;

  const isMobile = typeof window !== 'undefined' && (window.innerWidth < 768 || 'ontouchstart' in window);

  const handlePdfAction = async () => {
    if (isMobile) {
      await sharePdf(order.id);
    } else {
      await downloadPdf(order.id);
    }
  };

  const whatsAppContext = {
    clientName: order.client?.name,
    companyName: profile?.company_name || undefined,
    orderNumber: order.order_number,
    totalAmount: order.total_amount,
    depositAmount: order.total_amount / 2,
    remainingAmount: displayDepositPaid ? order.total_amount / 2 : order.total_amount,
    deliveryDate: order.delivery_date,
    deliveryTime: order.delivery_time,
    depositPaid: displayDepositPaid,
  };

  const availableTemplates = getAvailableTemplates({
    depositPaid: displayDepositPaid,
    status: currentStatus,
  });

  const depositAmount = order.total_amount / 2;
  const netAmount = order.total_amount - feeInReais;

  const handleFullPayment = () => {
    if (!selectedPaymentMethod || !onFullPayment) return;
    
    setDisplayFullPayment(true);
    // Update status optimistically if it will change
    if (currentStatus === "quote" || currentStatus === "awaiting_deposit") {
      setDisplayStatus("in_production");
    }
    
    onFullPayment(
      order.id,
      selectedPaymentMethod,
      feeInReais,
      order.order_number,
      order.client?.name,
      order.total_amount,
      order.status as OrderStatus
    );
  };

  // Show upfront payment card only if neither deposit nor full payment has been received
  const showUpfrontPaymentCard = !displayDepositPaid && !displayFullPayment;
  // Show deposit card only if full payment has not been received
  const showDepositCard = !displayFullPayment;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90dvh] flex flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle className="font-display flex items-center gap-3">
            <Package className="h-5 w-5 text-primary" />
            {order.order_number ? `Pedido ${formatOrderNumber(order.order_number)}` : "Detalhes do Pedido"}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 pr-4">
          <div className="space-y-4">
            {/* Status Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <span className="text-sm text-muted-foreground">Status:</span>
            {onStatusChange ? (
              <Select value={currentStatus} onValueChange={(value) => handleStatusChange(value as OrderStatus)}>
                <SelectTrigger
                  className={cn(
                    "w-full sm:w-auto h-10 sm:h-9 px-3 gap-2 text-sm font-semibold border shadow-sm",
                    statusConfig.bgColor,
                    statusConfig.color,
                    "hover:opacity-90 transition-opacity",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2.5 h-2.5 rounded-full", statusConfig.dotColor)} />
                    <span>{statusConfig.label}</span>
                  </div>
                </SelectTrigger>
                <SelectContent className="min-w-[240px]">
                  {ALL_STATUSES.map((status) => {
                    const config = ORDER_STATUS_CONFIG[status];
                    const isSelected = status === currentStatus;
                    return (
                      <SelectItem
                        key={status}
                        value={status}
                        className={cn("py-3 cursor-pointer", isSelected && "bg-muted/50")}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div
                            className={cn(
                              "w-3 h-3 rounded-full shrink-0",
                              config.dotColor,
                              isSelected && "ring-2 ring-offset-2 ring-primary/30",
                            )}
                          />
                          <div className="flex flex-col gap-0.5">
                            <span
                              className={cn("font-semibold text-sm", isSelected ? "text-primary" : "text-foreground")}
                            >
                              {config.label}
                            </span>
                            <span className="text-xs text-muted-foreground leading-tight">{config.description}</span>
                          </div>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            ) : (
              <Badge className={cn(statusConfig.bgColor, statusConfig.color, "text-xs font-semibold")}>
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
                    <p className="font-semibold">{order.client?.name || "Cliente não encontrado"}</p>
                    {order.client?.phone && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {formatPhone(order.client.phone)}
                      </p>
                    )}
                    {order.client?.address && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {order.client.address}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Info */}
            <div className={cn("grid gap-3", order.delivery_address ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1")}>
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Data de Entrega
                    </div>
                    {daysRemaining && (
                      <span
                        className={cn(
                          "text-xs font-medium",
                          daysRemaining.urgent ? "text-destructive" : "text-muted-foreground",
                        )}
                      >
                        ({daysRemaining.text})
                      </span>
                    )}
                  </div>
                  <p className="font-medium text-sm mt-1">{formatDate(order.delivery_date, order.delivery_time)}</p>
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
                    const unitLabel = item.unit_type === "kg" ? "Kg" : item.unit_type === "cento" ? "Cento" : "Un";
                    const isGift = item.is_gift;
                    const isAdditional = item.product_id === null;
                    return (
                      <div
                        key={index}
                        className={cn(
                          "flex justify-between text-sm",
                          isGift && "text-success",
                          isAdditional && !isGift && "text-blue-700 dark:text-blue-300",
                        )}
                      >
                        <span className="flex items-center gap-1.5">
                          {isGift && <Gift className="h-3.5 w-3.5" />}
                          {isAdditional && !isGift && <PackagePlus className="h-3.5 w-3.5" />}
                          {item.quantity} {unitLabel} {item.product_name}
                          {isGift && (
                            <Badge variant="success" className="text-[9px] px-1 py-0 ml-1">
                              BRINDE
                            </Badge>
                          )}
                          {isAdditional && !isGift && (
                            <Badge className="text-[9px] px-1 py-0 ml-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                              ADICIONAL
                            </Badge>
                          )}
                        </span>
                        {isGift ? (
                          <span className="flex items-center gap-2">
                            <span className="line-through text-muted-foreground text-xs">
                              {formatCurrency(item.quantity * item.unit_price)}
                            </span>
                            <span className="font-medium">R$ 0,00</span>
                          </span>
                        ) : (
                          <span className="font-medium">{formatCurrency(item.quantity * item.unit_price)}</span>
                        )}
                      </div>
                    );
                  })}
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

            {/* Full Payment Complete Display */}
            {displayFullPayment && (
              <Card className="bg-success/5 border-success/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center">
                        <Check className="h-4 w-4 text-success" />
                      </div>
                      <p className="font-semibold text-success">Pagamento Completo</p>
                    </div>
                    {onUndoFullPayment && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          setDisplayFullPayment(false);
                          onUndoFullPayment(order.id);
                        }}
                      >
                        Desfazer
                      </Button>
                    )}
                  </div>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pago via</span>
                      <span className="font-medium">
                        {order.payment_method === 'pix' ? 'Pix' : order.payment_method === 'credit_card' ? 'Cartão de Crédito' : order.payment_method === 'link' ? 'Link de Pagamento' : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Valor total</span>
                      <span className="font-medium">{formatCurrency(order.total_amount)}</span>
                    </div>
                    {order.payment_fee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Taxa</span>
                        <span className="font-medium text-destructive">-{formatCurrency(order.payment_fee)}</span>
                      </div>
                    )}
                    <Separator className="my-2" />
                    <div className="flex justify-between font-semibold">
                      <span>Valor recebido</span>
                      <span className="text-success">{formatCurrency(order.total_amount - order.payment_fee)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Deposit Status - Only show if full payment not received */}
            {showDepositCard && (
              <Card className={displayDepositPaid ? "bg-success/5 border-success/20" : "bg-warning/5 border-warning/20"}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Banknote className="h-5 w-5" />
                      <div>
                        <p className="font-medium">Sinal 50%</p>
                        <p className="text-sm text-muted-foreground">{formatCurrency(depositAmount)}</p>
                      </div>
                    </div>
                    {displayDepositPaid ? (
                      <div className="flex items-center gap-2">
                        <Badge variant="success">Pago</Badge>
                        {onDepositChange && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs text-muted-foreground hover:text-destructive"
                            onClick={() => {
                              setDisplayDepositPaid(false);
                              onDepositChange(
                                order.id,
                                false,
                                order.client?.name,
                                order.total_amount,
                                order.status as OrderStatus,
                              );
                            }}
                          >
                            Desfazer
                          </Button>
                        )}
                      </div>
                    ) : onDepositChange ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-warning text-warning hover:bg-warning hover:text-warning-foreground"
                        onClick={() => {
                          setDisplayDepositPaid(true);
                          // Also update status optimistically if it will change
                          if (currentStatus === "quote" || currentStatus === "awaiting_deposit") {
                            setDisplayStatus("in_production");
                          }
                          onDepositChange(
                            order.id,
                            true,
                            order.client?.name,
                            order.total_amount,
                            order.status as OrderStatus,
                          );
                        }}
                      >
                        Marcar como Pago
                      </Button>
                    ) : (
                      <Badge variant="warning">Pendente</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Upfront Payment Card - Only show if neither deposit nor full payment received */}
            {showUpfrontPaymentCard && onFullPayment && (
              <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-800/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <p className="font-semibold">Pagamento Antecipado</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Valor Total</span>
                      <span className="font-semibold">{formatCurrency(order.total_amount)}</span>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">Forma de Pagamento</Label>
                      <Select 
                        value={selectedPaymentMethod} 
                        onValueChange={(value) => setSelectedPaymentMethod(value as 'pix' | 'credit_card' | 'link')}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pix">Pix</SelectItem>
                          <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                          <SelectItem value="link">Link de Pagamento</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {(selectedPaymentMethod === 'credit_card' || selectedPaymentMethod === 'link') && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Taxa cobrada</Label>
                          <div className="flex rounded-md overflow-hidden border">
                            <button
                              type="button"
                              className={cn(
                                "px-3 py-1 text-xs font-medium transition-colors",
                                feeType === 'percentage' 
                                  ? "bg-primary text-primary-foreground" 
                                  : "bg-muted hover:bg-muted/80"
                              )}
                              onClick={() => {
                                setFeeType('percentage');
                                setPaymentFee(0);
                              }}
                            >
                              %
                            </button>
                            <button
                              type="button"
                              className={cn(
                                "px-3 py-1 text-xs font-medium transition-colors",
                                feeType === 'value' 
                                  ? "bg-primary text-primary-foreground" 
                                  : "bg-muted hover:bg-muted/80"
                              )}
                              onClick={() => {
                                setFeeType('value');
                                setPaymentFee(0);
                              }}
                            >
                              R$
                            </button>
                          </div>
                        </div>
                        {feeType === 'value' ? (
                          <CurrencyInput
                            value={paymentFee}
                            onChange={setPaymentFee}
                            className="h-10"
                          />
                        ) : (
                          <div className="relative">
                            <Input
                              type="text"
                              inputMode="decimal"
                              placeholder="0,00"
                              value={paymentFee === 0 ? '' : paymentFee.toString().replace('.', ',')}
                              onChange={(e) => {
                                const val = e.target.value.replace(',', '.');
                                const num = parseFloat(val) || 0;
                                setPaymentFee(Math.min(num, 100));
                              }}
                              className="h-10 pr-8"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                          </div>
                        )}
                        {feeType === 'percentage' && paymentFee > 0 && (
                          <p className="text-xs text-muted-foreground">
                            = {formatCurrency(feeInReais)}
                          </p>
                        )}
                      </div>
                    )}

                    {selectedPaymentMethod && (
                      <div className="flex justify-between text-sm pt-2 border-t">
                        <span className="text-muted-foreground">Valor a receber</span>
                        <span className="font-bold text-success">{formatCurrency(netAmount)}</span>
                      </div>
                    )}

                    <Button
                      className="w-full mt-2"
                      disabled={!selectedPaymentMethod}
                      onClick={handleFullPayment}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Marcar como Pago
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

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
            <div className="flex flex-col gap-3 pt-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  className="flex-1 h-11 sm:h-10"
                  onClick={handlePdfAction}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : isMobile ? (
                    <Share2 className="mr-2 h-4 w-4" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  Orçamento em PDF
                </Button>
                <WhatsAppTemplatePreview
                  phone={order.client?.phone || ''}
                  context={whatsAppContext}
                  availableTemplates={availableTemplates}
                  disabled={!order.client?.phone}
                />
              </div>

              {/* Edit/Delete buttons for quote and awaiting_deposit */}
              {canEditOrDelete && (
                <div className="flex justify-center sm:justify-start gap-4 pt-1">
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground h-10 px-4"
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
                      className="text-muted-foreground hover:text-destructive h-10 px-4"
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
          </div>
        </ScrollArea>
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
              Tem certeza que deseja excluir este pedido de <strong>{order.client?.name}</strong>? Esta ação não pode
              ser desfeita e todas as informações serão perdidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir Pedido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delivered Confirmation Dialog */}
      <AlertDialog open={deliveredConfirmOpen} onOpenChange={setDeliveredConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                <Banknote className="h-5 w-5 text-success" />
              </div>
              <AlertDialogTitle>Confirmar Entrega</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pt-2">
              Ao marcar como <strong>Entregue</strong>, o sistema registrará automaticamente o pagamento restante de{" "}
              <strong>{formatCurrency((order.total_amount || 0) - (order.total_amount || 0) / 2)}</strong> no
              financeiro.
              <br />
              <br />
              Deseja confirmar a entrega e registro do pagamento?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto" onClick={cancelDelivered}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelivered}
              className="w-full sm:w-auto bg-success text-success-foreground hover:bg-success/90"
            >
              Confirmar Entrega
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelConfirmOpen} onOpenChange={setCancelConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <AlertDialogTitle>Cancelar Pedido</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pt-2">
              Ao cancelar este pedido, <strong>todas as transações financeiras</strong> associadas (sinal e pagamento
              final) serão removidas automaticamente.
              <br />
              <br />
              Deseja continuar com o cancelamento?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto" onClick={cancelCancelled}>
              Voltar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancelled}
              className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancelar Pedido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
