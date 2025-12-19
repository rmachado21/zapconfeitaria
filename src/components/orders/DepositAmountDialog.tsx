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
import { Banknote } from "lucide-react";

interface DepositAmountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalAmount: number;
  onConfirm: (depositAmount: number) => void;
}

export function DepositAmountDialog({
  open,
  onOpenChange,
  totalAmount,
  onConfirm,
}: DepositAmountDialogProps) {
  const suggestedAmount = totalAmount / 2;
  const [depositAmount, setDepositAmount] = useState(suggestedAmount);

  // Reset to suggested amount when dialog opens
  useEffect(() => {
    if (open) {
      setDepositAmount(suggestedAmount);
    }
  }, [open, suggestedAmount]);

  const handleConfirm = () => {
    onConfirm(depositAmount);
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
