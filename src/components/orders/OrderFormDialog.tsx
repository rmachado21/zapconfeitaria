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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Plus, Trash2, ShoppingBag, Minus, Gift, Check, ChevronsUpDown, X, UserPlus } from 'lucide-react';
import { useClients, ClientFormData } from '@/hooks/useClients';
import { useProducts } from '@/hooks/useProducts';
import { OrderFormData, Order } from '@/hooks/useOrders';
import { CurrencyInput } from '@/components/shared/CurrencyInput';
import { formatCurrency } from '@/lib/masks';
import { useToast } from '@/hooks/use-toast';
import { ClientFormDialog } from '@/components/clients/ClientFormDialog';
import { cn } from '@/lib/utils';

const orderSchema = z.object({
  client_id: z.string().min(1, 'Selecione um cliente'),
  delivery_date: z.string().optional(),
  delivery_time: z.string().optional(),
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
  is_gift?: boolean;
}

interface OrderFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: OrderFormData) => Promise<void>;
  isLoading: boolean;
  editOrder?: Order | null;
}

export function OrderFormDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  editOrder,
}: OrderFormDialogProps) {
  const { clients, createClient } = useClients();
  const { products } = useProducts();
  const [showNewClientDialog, setShowNewClientDialog] = useState(false);
  const { toast } = useToast();
  const [items, setItems] = useState<OrderItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [clientSearchOpen, setClientSearchOpen] = useState(false);
  const [productSearchOpen, setProductSearchOpen] = useState(false);

  const isEditMode = !!editOrder;

  const form = useForm({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      client_id: '',
      delivery_date: '',
      delivery_time: '',
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
    } else if (editOrder) {
      // Populate form with existing order data
      form.reset({
        client_id: editOrder.client_id || '',
        delivery_date: editOrder.delivery_date || '',
        delivery_time: editOrder.delivery_time || '',
        delivery_address: editOrder.delivery_address || '',
        delivery_fee: editOrder.delivery_fee || 0,
        notes: editOrder.notes || '',
      });
      // Populate items
      setItems((editOrder.order_items || []).map(item => ({
        product_id: item.product_id || '',
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        unit_type: item.unit_type || 'unit',
        is_gift: item.is_gift || false,
      })));
    }
  }, [open, form, editOrder]);

  const selectedProductData = products.find(p => p.id === selectedProduct);

  const handleAddItem = () => {
    if (!selectedProduct || !selectedProductData) {
      toast({
        title: 'Selecione um produto',
        variant: 'destructive',
      });
      return;
    }

    // Validate quantity - must be positive
    if (!quantity || quantity <= 0 || isNaN(quantity)) {
      toast({
        title: 'Quantidade inválida',
        description: 'A quantidade deve ser maior que zero.',
        variant: 'destructive',
      });
      return;
    }

    // Validate based on unit type
    const unitType = selectedProductData.unit_type;
    const getMinQuantity = (type: string) => {
      if (type === 'kg') return 0.1;
      return 1;
    };
    const minQuantity = getMinQuantity(unitType);
    const unitLabel = unitType === 'kg' ? 'Kg' : unitType === 'cento' ? 'Cento' : 'Un';
    
    if (quantity < minQuantity) {
      toast({
        title: 'Quantidade mínima',
        description: `Mínimo de ${minQuantity} ${unitLabel}`,
        variant: 'destructive',
      });
      return;
    }

    // Normalize quantity: 2 decimals for Kg, integer for UN/Cento
    const validQuantity = unitType === 'kg' 
      ? Math.round(quantity * 100) / 100
      : Math.floor(quantity);

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
        is_gift: false,
      }]);
    }

    setSelectedProduct('');
    setQuantity(1);
  };

  const handleUpdateItemQuantity = (index: number, delta: number) => {
    const newItems = [...items];
    const item = newItems[index];
    const unitType = item.unit_type;
    
    const getStep = (type: string) => {
      if (type === 'kg') return 0.5;
      return 1;
    };
    const getMinQty = (type: string) => {
      if (type === 'kg') return 0.1;
      return 1;
    };
    
    const step = getStep(unitType);
    const minQty = getMinQty(unitType);
    const newQuantity = item.quantity + (delta * step);
    
    if (newQuantity >= minQty) {
      newItems[index].quantity = unitType === 'kg' ? Math.round(newQuantity * 100) / 100 : Math.floor(newQuantity);
      setItems(newItems);
    }
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleToggleGift = (index: number) => {
    const newItems = [...items];
    newItems[index].is_gift = !newItems[index].is_gift;
    setItems(newItems);
  };

  // Only count non-gift items in total
  const totalItems = items.reduce((sum, item) => {
    if (item.is_gift) return sum;
    return sum + (item.quantity * item.unit_price);
  }, 0);
  const giftDiscount = items.reduce((sum, item) => {
    if (!item.is_gift) return sum;
    return sum + (item.quantity * item.unit_price);
  }, 0);
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
      delivery_time: data.delivery_time,
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
            {isEditMode ? 'Editar Pedido' : 'Novo Pedido'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[75dvh] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              {/* Client Selection with Search */}
              <FormField
                control={form.control}
                name="client_id"
                render={({ field }) => {
                  const selectedClient = clients.find(c => c.id === field.value);
                  return (
                    <FormItem className="flex flex-col">
                      <FormLabel>Cliente *</FormLabel>
                      <Popover open={clientSearchOpen} onOpenChange={setClientSearchOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={clientSearchOpen}
                              className={cn(
                                "w-full justify-between font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {selectedClient ? selectedClient.name : "Buscar cliente..."}
                              <div className="flex items-center gap-1 ml-2 shrink-0">
                                {field.value && (
                                  <X
                                    className="h-4 w-4 opacity-50 hover:opacity-100"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      field.onChange('');
                                    }}
                                  />
                                )}
                                <ChevronsUpDown className="h-4 w-4 opacity-50" />
                              </div>
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Digite para buscar..." />
                            <CommandList>
                              <CommandEmpty>
                                <div className="py-2 text-center">
                                  <p className="text-sm text-muted-foreground mb-2">Nenhum cliente encontrado.</p>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="gap-1"
                                    onClick={() => {
                                      setClientSearchOpen(false);
                                      setShowNewClientDialog(true);
                                    }}
                                  >
                                    <UserPlus className="h-3.5 w-3.5" />
                                    Criar novo cliente
                                  </Button>
                                </div>
                              </CommandEmpty>
                              <CommandGroup>
                                {clients.map((client) => (
                                  <CommandItem
                                    key={client.id}
                                    value={client.name}
                                    onSelect={() => {
                                      field.onChange(client.id);
                                      setClientSearchOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        field.value === client.id ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {client.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                              <div className="p-1 border-t">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start gap-2 text-muted-foreground"
                                  onClick={() => {
                                    setClientSearchOpen(false);
                                    setShowNewClientDialog(true);
                                  }}
                                >
                                  <UserPlus className="h-4 w-4" />
                                  Criar novo cliente
                                </Button>
                              </div>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              {/* Products Section */}
              <div className="space-y-3">
                <FormLabel>Produtos *</FormLabel>
                
                {/* Add Product Row */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <Popover open={productSearchOpen} onOpenChange={setProductSearchOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={productSearchOpen}
                        className={cn(
                          "w-full sm:flex-1 justify-between font-normal",
                          !selectedProduct && "text-muted-foreground"
                        )}
                      >
                        {selectedProductData ? (
                          <span className="truncate">
                            {selectedProductData.name} - {formatCurrency(selectedProductData.sale_price)}/
                            {selectedProductData.unit_type === 'kg' ? 'Kg' : selectedProductData.unit_type === 'cento' ? 'Cento' : 'Un'}
                          </span>
                        ) : (
                          "Buscar produto..."
                        )}
                        <div className="flex items-center gap-1 ml-2 shrink-0">
                          {selectedProduct && (
                            <X
                              className="h-4 w-4 opacity-50 hover:opacity-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedProduct('');
                              }}
                            />
                          )}
                          <ChevronsUpDown className="h-4 w-4 opacity-50" />
                        </div>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Digite para buscar..." />
                        <CommandList>
                          <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
                          <CommandGroup>
                            {products.map((product) => {
                              const unitLabel = product.unit_type === 'kg' ? 'Kg' : product.unit_type === 'cento' ? 'Cento' : 'Un';
                              return (
                                <CommandItem
                                  key={product.id}
                                  value={product.name}
                                  onSelect={() => {
                                    setSelectedProduct(product.id);
                                    setProductSearchOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedProduct === product.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <span className="flex-1 truncate">{product.name}</span>
                                  <span className="text-xs text-muted-foreground ml-2">
                                    {formatCurrency(product.sale_price)}/{unitLabel}
                                  </span>
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <div className="flex gap-2">
                    <div className="relative flex-1 sm:flex-none">
                      <Input
                        type="number"
                        min={selectedProductData?.unit_type === 'kg' ? '0.1' : '1'}
                        step={selectedProductData?.unit_type === 'kg' ? '0.1' : '1'}
                        value={quantity}
                        onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
                        className="w-full sm:w-28 pr-12"
                        placeholder="Qtd"
                      />
                      {selectedProductData && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                          {selectedProductData.unit_type === 'kg' ? 'Kg' : selectedProductData.unit_type === 'cento' ? 'Cento' : 'Un'}
                        </span>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleAddItem}
                      disabled={!selectedProduct}
                      className="shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Items List */}
                {items.length > 0 && (
                  <Card>
                    <CardContent className="p-2 sm:p-3 space-y-2">
                      {items.map((item, index) => {
                        const unitLabel = item.unit_type === 'kg' ? 'Kg' : item.unit_type === 'cento' ? 'Cento' : 'Un';
                        const isGift = item.is_gift;
                        return (
                        <div key={index} className={cn(
                          "flex flex-col gap-2 text-sm p-2 rounded-md transition-colors",
                          isGift && "bg-success/10 border border-success/20"
                        )}>
                          {/* Linha 1: Nome + Preço */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {isGift && <Gift className="h-3.5 w-3.5 text-success flex-shrink-0" />}
                                <span className={cn(
                                  "font-medium",
                                  isGift && "text-success"
                                )}>
                                  {item.product_name}
                                </span>
                                {isGift && <Badge variant="success" className="text-[9px] px-1 py-0">BRINDE</Badge>}
                              </div>
                              <span className="text-muted-foreground text-xs">
                                {formatCurrency(item.unit_price)}/{unitLabel}
                              </span>
                            </div>
                            <div className="text-right shrink-0">
                              {isGift ? (
                                <div className="flex flex-col items-end">
                                  <span className="text-[10px] line-through text-muted-foreground">
                                    {formatCurrency(item.quantity * item.unit_price)}
                                  </span>
                                  <span className="font-medium text-success text-xs">R$ 0,00</span>
                                </div>
                              ) : (
                                <span className="font-medium">
                                  {formatCurrency(item.quantity * item.unit_price)}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Linha 2: Quantidade + Ações */}
                          <div className="flex items-center justify-between gap-2">
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon-sm"
                                onClick={() => handleUpdateItemQuantity(index, -1)}
                                disabled={item.quantity <= (item.unit_type === 'kg' ? 0.5 : 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="min-w-[3.5rem] text-center font-medium text-xs">
                                {item.quantity} {unitLabel}
                              </span>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon-sm"
                                onClick={() => handleUpdateItemQuantity(index, 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                variant={isGift ? "default" : "outline"}
                                size="icon-sm"
                                className={cn(
                                  "flex-shrink-0",
                                  isGift && "bg-success hover:bg-success/90"
                                )}
                                onClick={() => handleToggleGift(index)}
                                title={isGift ? "Remover brinde" : "Marcar como brinde"}
                              >
                                <Gift className="h-3 w-3" />
                              </Button>
                              
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                className="text-destructive flex-shrink-0"
                                onClick={() => handleRemoveItem(index)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )})}
                    </CardContent>
                  </Card>
                )}

                {items.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum produto adicionado
                  </p>
                )}
              </div>

              {/* Delivery Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                <FormField
                  control={form.control}
                  name="delivery_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horário</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                        <span>{formatCurrency(totalItems + giftDiscount)}</span>
                      </div>
                      {giftDiscount > 0 && (
                        <div className="flex justify-between text-success">
                          <span className="flex items-center gap-1">
                            <Gift className="h-3 w-3" />
                            Brinde:
                          </span>
                          <span>-{formatCurrency(giftDiscount)}</span>
                        </div>
                      )}
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

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  variant="warm" 
                  className="w-full sm:w-auto"
                  disabled={isLoading || items.length === 0}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditMode ? 'Salvar Alterações' : 'Criar Pedido'}
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>

      {/* New Client Dialog */}
      <ClientFormDialog
        open={showNewClientDialog}
        onOpenChange={setShowNewClientDialog}
        onSubmit={async (data) => {
          const result = await createClient.mutateAsync(data);
          if (result?.id) {
            form.setValue('client_id', result.id);
          }
        }}
        isLoading={createClient.isPending}
      />
    </Dialog>
  );
}
