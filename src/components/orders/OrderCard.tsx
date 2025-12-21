import React from "react";
import { Order, ORDER_STATUS_CONFIG } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, MapPin, ChevronRight, Package, Check, AlertTriangle, PackagePlus, StickyNote } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatOrderNumber } from "@/hooks/useOrders";
interface OrderCardProps {
  order: Order;
  onClick?: () => void;
  onDepositChange?: (depositPaid: boolean) => void;
}

export function OrderCard({ order, onClick, onDepositChange }: OrderCardProps) {
  const [notesExpanded, setNotesExpanded] = React.useState(false);
  const statusConfig = ORDER_STATUS_CONFIG[order.status];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string, timeString?: string) => {
    if (!dateString) return "Sem data";
    try {
      // Formato: "Sexta-feira, 12 de Dez"
      const dateFormatted = format(parseISO(dateString), "EEEE, dd 'de' MMM", { locale: ptBR });
      // Capitalizar primeira letra
      const capitalizedDate = dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1);
      if (timeString) {
        return `${capitalizedDate} às ${timeString.slice(0, 5)}`;
      }
      return capitalizedDate;
    } catch {
      return "Data inválida";
    }
  };

  const getDaysRemaining = (dateString: string) => {
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
      return { text: `${diff} dias`, urgent: diff <= 3 };
    } catch {
      return null;
    }
  };

  const daysRemaining = order.status !== "delivered" ? getDaysRemaining(order.deliveryDate) : null;

  // Check if deposit is overdue (more than 7 days since order creation)
  const getDepositOverdueDays = () => {
    if (order.depositPaid || order.status === "delivered") return null;
    try {
      const createdAt = parseISO(order.createdAt);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      createdAt.setHours(0, 0, 0, 0);
      const diff = differenceInDays(today, createdAt);
      return diff >= 7 ? diff : null;
    } catch {
      return null;
    }
  };

  const depositOverdueDays = getDepositOverdueDays();

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
        {/* Header: Order Number + Status + Price */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {order.orderNumber && (
              <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {formatOrderNumber(order.orderNumber)}
              </span>
            )}
            <Badge className={cn(statusConfig.bgColor, statusConfig.color, "text-[10px] font-semibold")}>
              {statusConfig.label}
            </Badge>
          </div>
          <span className="font-bold text-lg text-primary">{formatCurrency(order.totalAmount)}</span>
        </div>

        {/* Client Name */}
        <h3 className="font-semibold text-base text-foreground truncate mb-2">{order.clientName}</h3>

        {/* Items list */}
        <div className="flex items-start gap-2 mb-3">
          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
            <Package className="h-3.5 w-3.5 text-primary" />
          </div>
          <div className="flex flex-col gap-0.5 pt-0.5">
            {order.items.length > 0 ? (
              order.items.slice(0, 3).map((item, index) => {
                const formatQuantity = (qty: number, unit: string) => {
                  if (unit === "kg") return `${qty.toLocaleString("pt-BR")}Kg`;
                  if (unit === "cento") return qty === 1 ? "1 cento" : `${qty} centos`;
                  return qty === 1 ? "1 un" : `${qty} un`;
                };
                const isAdditional = !item.productId;
                return (
                  <p
                    key={index}
                    className={cn(
                      "text-sm flex items-center gap-1",
                      item.isGift
                        ? "text-success"
                        : isAdditional
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-muted-foreground",
                    )}
                  >
                    {isAdditional && !item.isGift && <PackagePlus className="h-3 w-3 flex-shrink-0" />}
                    {formatQuantity(item.quantity, item.unitType)} {item.productName}
                    {item.isGift && <span className="text-xs ml-1">(Brinde)</span>}
                    {isAdditional && !item.isGift && <span className="text-xs ml-1">(Adicional)</span>}
                  </p>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum item</p>
            )}
            {order.items.length > 3 && (
              <p className="text-xs text-muted-foreground/70">+{order.items.length - 3} mais...</p>
            )}
          </div>
        </div>

        {/* Notes preview - discrete display */}
        {order.notes && (
          <div
            className="flex items-start gap-2 mb-3 cursor-pointer group/notes"
            onClick={(e) => {
              e.stopPropagation();
              setNotesExpanded(!notesExpanded);
            }}
          >
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
              <StickyNote className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            </div>
            <p
              className={cn(
                "text-xs text-muted-foreground italic pt-1.5 group-hover/notes:text-foreground transition-colors",
                !notesExpanded && "line-clamp-2",
              )}
            >
              {order.notes}
            </p>
          </div>
        )}

        {/* Meta info with icons */}
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
              <Calendar className="h-3 w-3 text-muted-foreground" />
            </div>
            <span className="text-foreground font-medium">{formatDate(order.deliveryDate, order.deliveryTime)}</span>
            {daysRemaining && (
              <span
                className={cn(
                  "text-[10px] font-medium px-1.5 py-0.5 rounded",
                  daysRemaining.urgent 
                    ? "bg-destructive/50 text-destructive-foreground" 
                    : "text-muted-foreground",
                )}
              >
                {daysRemaining.text}
              </span>
            )}
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
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-1 text-muted-foreground group-hover:text-primary transition-colors">
            <span className="text-xs">Ver detalhes</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>

        {/* Payment status indicator */}
        {order.fullPaymentReceived ? (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center">
                  <Check className="h-3 w-3 text-success" />
                </div>
                <span className="text-sm font-medium text-foreground">Pago 100%</span>
              </div>
              <Badge variant="success" className="text-[10px]">
                Antecipado
              </Badge>
            </div>
            <div className="pl-7 mt-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Valor recebido</span>
                <span className="text-success font-medium">
                  {formatCurrency(order.totalAmount - (order.paymentFee || 0))}
                </span>
              </div>
            </div>
          </div>
        ) : order.status === "delivered" ? (
          <div className="mt-3 pt-3 border-t border-border space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center">
                  <Check className="h-3 w-3 text-success" />
                </div>
                <span className="text-sm font-medium text-foreground">Pagamento Completo</span>
              </div>
              <Badge variant="success" className="text-[10px]">
                Pago
              </Badge>
            </div>
            <div className="pl-7 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Sinal ({order.totalAmount > 0 ? Math.round((order.depositAmount / order.totalAmount) * 100) : 50}%)</span>
                <span className="text-foreground">{formatCurrency(order.depositAmount)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Na entrega</span>
                <span className="text-foreground">{formatCurrency(order.totalAmount - order.depositAmount)}</span>
              </div>
              <div className="flex justify-between text-xs font-medium pt-1 border-t border-border/50">
                <span className="text-foreground">Total</span>
                <span className="text-success">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-3 pt-3 border-t border-border">
            {depositOverdueDays && (
              <div className="flex items-center gap-2 mb-2 p-2 rounded-md bg-destructive/10 border border-destructive/20">
                <AlertTriangle className="h-3.5 w-3.5 text-destructive flex-shrink-0" />
                <span className="text-xs text-destructive font-medium">
                  Sinal pendente há {depositOverdueDays} dias
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2" onClick={handleDepositChange}>
                <Checkbox
                  checked={order.depositPaid}
                  onCheckedChange={(checked) => onDepositChange?.(!!checked)}
                  className="data-[state=checked]:bg-success data-[state=checked]:border-success"
                />
                <span className="text-sm text-muted-foreground">
                  Sinal {order.totalAmount > 0 ? Math.round((order.depositAmount / order.totalAmount) * 100) : 50}%: <span className="font-medium text-foreground">{formatCurrency(order.depositAmount)}</span>
                </span>
              </div>
              {order.depositPaid ? (
                <Badge variant="success" className="text-[10px]">
                  Pago
                </Badge>
              ) : (
                <Badge variant="warning" className="text-[10px]">
                  Pendente
                </Badge>
              )}
            </div>
            {order.depositPaid && (
              <div className="text-xs text-muted-foreground mt-1 pl-6">
                Restante na entrega: <span className="font-medium text-foreground">{formatCurrency(order.totalAmount - order.depositAmount)}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
