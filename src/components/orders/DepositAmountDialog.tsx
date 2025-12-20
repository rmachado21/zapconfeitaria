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

export type DepositPaymentMethod = 'pix' | 'credit_card' | 'link';

interface DepositAmountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalAmount: number;
  onConfirm: (depositAmount: number, paymentMethod: DepositPaymentMethod, paymentFee: number) => void;
}

export function DepositAmountDialog({
  open,
  onOpenChange,
  totalAmount,
  onConfirm,
}: DepositAmountDialogProps) {
  const suggestedAmount = totalAmount / 2;
  const [depositAmount, setDepositAmount] = useState(suggestedAmount);
  const [paymentMethod, setPaymentMethod] = useState<DepositPaymentMethod>('pix');
  const [paymentFee, setPaymentFee] = useState<number>(0);
  const [feeType, setFeeType] = useState<'value' | 'percentage'>('percentage');

  // Reset to suggested amount when dialog opens
  useEffect(() => {
    if (open) {
      setDepositAmount(suggestedAmount);
      setPaymentMethod('pix');
      setPaymentFee(0);
      setFeeType('percentage');
    }
  }, [open, suggestedAmount]);

  const handleConfirm = () => {
    const calculatedFee = feeType === 'percentage' 
      ? (depositAmount * paymentFee) / 100 
      : paymentFee;
    onConfirm(depositAmount, paymentMethod, calculatedFee);
    onOpenChange(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const percentage = totalAmount > 0 ? ((depositAmount / totalAmount) * 100).toFixed(0) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5" />
            Valor do Sinal
          </DialogTitle>
          <DialogDescription>
            Informe o valor recebido como sinal. O valor sugerido é 50% do total.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Valor total do pedido</span>
            <span className="font-semibold">{formatCurrency(totalAmount)}</span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="depositAmount">Valor do sinal recebido</Label>
            <CurrencyInput
              id="depositAmount"
              value={depositAmount}
              onChange={setDepositAmount}
              className="h-11"
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Equivale a {percentage}% do valor total
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDepositAmount(totalAmount * 0.3)}
              className="flex-1"
            >
              30%
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDepositAmount(totalAmount * 0.5)}
              className="flex-1"
            >
              50%
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDepositAmount(totalAmount)}
              className="flex-1"
            >
              100%
            </Button>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Forma de Pagamento</Label>
            <Select 
              value={paymentMethod} 
              onValueChange={(value) => {
                setPaymentMethod(value as DepositPaymentMethod);
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
                <p className="text-xs text-muted-foreground">
                  Taxa: {feeType === 'percentage' 
                    ? formatCurrency((depositAmount * paymentFee) / 100)
                    : formatCurrency(paymentFee)
                  }
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={depositAmount <= 0}>
            Confirmar Recebimento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}