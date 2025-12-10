import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { useProducts } from '@/hooks/useProducts';
import { OrderFormData } from '@/hooks/useOrders';
import { CurrencyInput } from '@/components/shared/CurrencyInput';
import { formatCurrency } from '@/lib/masks';

const orderSchema = z.object({
  client_id: z.string().min(1, 'Selecione um cliente'),
  delivery_date: z.string().optional(),
  delivery_address: z.string().max(200).optional(),
  delivery_fee: z.coerce.number().min(0).optional(),
  notes: z.string().max(500).optional(),
});

interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  unit_type: string;
}

interface OrderFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: OrderFormData) => Promise<void>;
  isLoading: boolean;
}

export function OrderFormDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: OrderFormDialogProps) {
  const { clients } = useClients();
  const { products } = useProducts();
  const [items, setItems] = useState<OrderItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  const form = useForm({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      client_id: '',
      delivery_date: '',
      delivery_address: '',
      delivery_fee: 0,
      notes: '',
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset();
      setItems([]);
      setSelectedProduct('');
      setQuantity(1);
    }
  }, [open, form]);

  const selectedProductData = products.find(p => p.id === selectedProduct);

  const handleAddItem = () => {
    if (!selectedProduct || !selectedProductData) return;
    
    // Validate quantity based on unit type
    const validQuantity = selectedProductData.unit_type === 'kg' 
      ? Math.max(0.1, parseFloat(quantity.toFixed(2)))
      : Math.max(1, Math.floor(quantity));

    const existingIndex = items.findIndex(i => i.product_id === selectedProduct);
    
    if (existingIndex >= 0) {
      const newItems = [...items];
      newItems[existingIndex].quantity += validQuantity;
      setItems(newItems);
    } else {
      setItems([...items, {
        product_id: selectedProductData.id,
        product_name: selectedProductData.name,
        quantity: validQuantity,
        unit_price: selectedProductData.sale_price,
        unit_type: selectedProductData.unit_type,
      }]);
    }

    setSelectedProduct('');
    setQuantity(1);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totalItems = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const deliveryFee = form.watch('delivery_fee') || 0;
  const totalAmount = totalItems + deliveryFee;

  const handleSubmit = async (data: z.infer<typeof orderSchema>) => {
    if (items.length === 0) {
      form.setError('client_id', { message: 'Adicione pelo menos um produto' });
      return;
    }

    if (!data.client_id) {
      form.setError('client_id', { message: 'Selecione um cliente' });
      return;
    }

    await onSubmit({
      client_id: data.client_id,
      delivery_date: data.delivery_date,
      delivery_address: data.delivery_address,
      delivery_fee: data.delivery_fee,
      notes: data.notes,
      items,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Novo Pedido
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              {/* Client Selection */}
              <FormField
                control={form.control}
                name="client_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o cliente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Products Section */}
              <div className="space-y-3">
                <FormLabel>Produtos *</FormLabel>
                
                {/* Add Product Row */}
                <div className="flex gap-2">
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Selecione um produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - {formatCurrency(product.sale_price)}/{product.unit_type === 'kg' ? 'Kg' : 'UN'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="relative">
                    <Input
                      type="number"
                      min={selectedProductData?.unit_type === 'kg' ? '0.1' : '1'}
                      step={selectedProductData?.unit_type === 'kg' ? '0.1' : '1'}
                      value={quantity}
                      onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
                      className="w-24 pr-8"
                      placeholder="Qtd"
                    />
                    {selectedProductData && (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                        {selectedProductData.unit_type === 'kg' ? 'Kg' : 'UN'}
                      </span>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleAddItem}
                    disabled={!selectedProduct}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Items List */}
                {items.length > 0 && (
                  <Card>
                    <CardContent className="p-3 space-y-2">
                      {items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <div className="flex-1">
                            <span className="font-medium">{item.product_name}</span>
                            <span className="text-muted-foreground ml-2">
                              {item.quantity}{item.unit_type === 'kg' ? 'Kg' : 'UN'} × {formatCurrency(item.unit_price)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {formatCurrency(item.quantity * item.unit_price)}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className="text-destructive"
                              onClick={() => handleRemoveItem(index)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {items.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum produto adicionado
                  </p>
                )}
              </div>

              {/* Delivery Date */}
              <FormField
                control={form.control}
                name="delivery_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Entrega</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Delivery Address */}
              <FormField
                control={form.control}
                name="delivery_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço de Entrega</FormLabel>
                    <FormControl>
                      <Input placeholder="Rua, número, bairro..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Delivery Fee */}
              <FormField
                control={form.control}
                name="delivery_fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Taxa de Entrega</FormLabel>
                    <FormControl>
                      <CurrencyInput
                        value={field.value || 0}
                        onChange={field.onChange}
                        placeholder="R$ 0,00"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Detalhes sobre decoração, restrições alimentares..."
                        className="resize-none"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Total */}
              {items.length > 0 && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4">
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal:</span>
                        <span>{formatCurrency(totalItems)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Taxa de entrega:</span>
                        <span>{formatCurrency(deliveryFee)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t font-semibold text-base">
                        <span>Total:</span>
                        <span className="text-primary">{formatCurrency(totalAmount)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground pt-1">
                        <span>Sinal 50%:</span>
                        <Badge variant="warning">{formatCurrency(totalAmount / 2)}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  variant="warm" 
                  disabled={isLoading || items.length === 0}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Criar Pedido
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
