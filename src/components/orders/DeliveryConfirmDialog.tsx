import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CurrencyInput } from "@/components/shared/CurrencyInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Banknote } from "lucide-react";
import { cn } from "@/lib/utils";

export type DeliveryPaymentMethod = 'pix' | 'credit_card' | 'link';

interface DeliveryConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientName: string;
  totalAmount: number;
  depositAmount: number | null;
  fullPaymentReceived: boolean;
  onConfirm: (paymentMethod?: string, paymentFee?: number) => void;
  onCancel?: () => void;
}

export function DeliveryConfirmDialog({
  open,
  onOpenChange,
  clientName,
  totalAmount,
  depositAmount,
  fullPaymentReceived,
  onConfirm,
  onCancel,
}: DeliveryConfirmDialogProps) {
  // Calculate remaining amount
  const remainingAmount = fullPaymentReceived 
    ? 0 
    : depositAmount != null 
      ? totalAmount - depositAmount 
      : totalAmount;
  const [paymentMethod, setPaymentMethod] = useState<DeliveryPaymentMethod>('pix');
  const [paymentFee, setPaymentFee] = useState<number>(0);
  const [feeType, setFeeType] = useState<'value' | 'percentage'>('percentage');

  // Reset when dialog opens
  useEffect(() => {
    if (open) {
      setPaymentMethod('pix');
      setPaymentFee(0);
      setFeeType('percentage');
    }
  }, [open]);

  const handleConfirm = () => {
    const calculatedFee = feeType === 'percentage' 
      ? (remainingAmount * paymentFee) / 100 
      : paymentFee;
    onConfirm(paymentMethod, calculatedFee);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const netAmount = feeType === 'percentage' 
    ? remainingAmount - (remainingAmount * paymentFee) / 100 
    : remainingAmount - paymentFee;

  // If payment already received, just confirm without payment method
  const showPaymentForm = remainingAmount > 0;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) handleCancel();
      else onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
              <Banknote className="h-5 w-5 text-success" />
            </div>
            Confirmar Entrega
          </DialogTitle>
          <DialogDescription>
            {showPaymentForm ? (
              <>
                Ao marcar como <strong>Entregue</strong>, o sistema registrará automaticamente o pagamento restante de{" "}
                <strong>{formatCurrency(remainingAmount)}</strong> no financeiro.
                <br /><br />
                Deseja confirmar a entrega do pedido de <strong>{clientName}</strong>?
              </>
            ) : (
              <>
                Deseja confirmar a entrega do pedido de <strong>{clientName}</strong>?
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {showPaymentForm && (
          <div className="space-y-4 py-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Valor restante</span>
              <span className="font-semibold">{formatCurrency(remainingAmount)}</span>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Forma de Pagamento</Label>
              <Select 
                value={paymentMethod} 
                onValueChange={(value) => {
                  setPaymentMethod(value as DeliveryPaymentMethod);
                  if (value === 'pix') {
                    setPaymentFee(0);
                  }
                }}
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

            {(paymentMethod === 'credit_card' || paymentMethod === 'link') && (
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
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={paymentFee || ''}
                      onChange={(e) => setPaymentFee(parseFloat(e.target.value) || 0)}
                      className="h-10 pr-8"
                      placeholder="0"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                  </div>
                )}
                {paymentFee > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Taxa: {feeType === 'percentage' 
                        ? formatCurrency((remainingAmount * paymentFee) / 100)
                        : formatCurrency(paymentFee)
                      }
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Valor líquido: {formatCurrency(netAmount)}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm}
            className="bg-success text-success-foreground hover:bg-success/90"
          >
            Confirmar Entrega
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}