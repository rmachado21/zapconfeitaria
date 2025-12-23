import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ResponsivePanel } from "@/components/ui/responsive-panel";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Plus,
  Trash2,
  ShoppingBag,
  Minus,
  Gift,
  Check,
  ChevronsUpDown,
  X,
  UserPlus,
  PackagePlus,
  User,
  Package,
  CalendarDays,
  Clock,
  MapPin,
  Truck,
  FileText,
} from "lucide-react";
import { useClients, ClientFormData } from "@/hooks/useClients";
import { useProducts, Product } from "@/hooks/useProducts";
import { OrderFormData, Order, formatOrderNumber } from "@/hooks/useOrders";
import { CurrencyInput } from "@/components/shared/CurrencyInput";
import { formatCurrency } from "@/lib/masks";
import { useToast } from "@/hooks/use-toast";
import { ClientFormDialog } from "@/components/clients/ClientFormDialog";
import { ProductSelector } from "@/components/orders/ProductSelector";
import { cn } from "@/lib/utils";

const orderSchema = z.object({
  client_id: z.string().min(1, "Selecione um cliente"),
  delivery_date: z.string().optional(),
  delivery_time: z.string().optional(),
  delivery_address: z.string().max(200).optional(),
  delivery_fee: z.coerce.number().min(0).optional(),
  notes: z.string().max(500).optional(),
});

interface OrderItem {
  product_id: string | null;
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

export function OrderFormDialog({ open, onOpenChange, onSubmit, isLoading, editOrder }: OrderFormDialogProps) {
  const { clients, createClient } = useClients();
  const { products } = useProducts();
  const [showNewClientDialog, setShowNewClientDialog] = useState(false);
  const { toast } = useToast();
  const [items, setItems] = useState<OrderItem[]>([]);
  const [clientSearchOpen, setClientSearchOpen] = useState(false);

  // Additional items state
  const [additionalItemName, setAdditionalItemName] = useState("");
  const [additionalItemQty, setAdditionalItemQty] = useState<number>(1);
  const [additionalItemPrice, setAdditionalItemPrice] = useState<number>(0);
  const [additionalItemError, setAdditionalItemError] = useState(false);
  const [justAddedAdditional, setJustAddedAdditional] = useState(false);

  const isEditMode = !!editOrder;

  const form = useForm({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      client_id: "",
      delivery_date: "",
      delivery_time: "",
      delivery_address: "",
      delivery_fee: 0,
      notes: "",
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset();
      setItems([]);
      setAdditionalItemName("");
      setAdditionalItemQty(1);
      setAdditionalItemPrice(0);
    } else if (editOrder) {
      form.reset({
        client_id: editOrder.client_id || "",
        delivery_date: editOrder.delivery_date || "",
        delivery_time: editOrder.delivery_time || "",
        delivery_address: editOrder.delivery_address || "",
        delivery_fee: editOrder.delivery_fee || 0,
        notes: editOrder.notes || "",
      });
      setItems(
        (editOrder.order_items || []).map((item) => ({
          product_id: item.product_id || null,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          unit_type: item.unit_type || "unit",
          is_gift: item.is_gift || false,
        })),
      );
    }
  }, [open, form, editOrder]);

  // Auto-fill delivery address when client is selected (only for new orders)
  const watchedClientId = form.watch("client_id");
  useEffect(() => {
    if (!isEditMode && watchedClientId) {
      const selectedClient = clients.find((c) => c.id === watchedClientId);
      if (selectedClient?.address) {
        const currentAddress = form.getValues("delivery_address");
        if (!currentAddress) {
          form.setValue("delivery_address", selectedClient.address);
        }
      }
    }
  }, [watchedClientId, clients, form, isEditMode]);

  // Handler for additional items
  const handleAddAdditionalItem = () => {
    if (!additionalItemName.trim()) {
      setAdditionalItemError(true);
      toast({
        title: "Descrição obrigatória",
        description: "Informe a descrição do item adicional.",
        variant: "destructive",
      });
      return;
    }

    if (additionalItemQty <= 0) {
      toast({
        title: "Quantidade inválida",
        description: "A quantidade deve ser maior que zero.",
        variant: "destructive",
      });
      return;
    }

    if (additionalItemPrice < 0) {
      toast({
        title: "Valor inválido",
        description: "O valor não pode ser negativo.",
        variant: "destructive",
      });
      return;
    }

    const itemName = additionalItemName.trim();
    const itemQty = additionalItemQty;

    setItems([
      ...items,
      {
        product_id: null,
        product_name: itemName,
        quantity: itemQty,
        unit_price: additionalItemPrice,
        unit_type: "unit",
        is_gift: false,
      },
    ]);

    setAdditionalItemName("");
    setAdditionalItemQty(1);
    setAdditionalItemPrice(0);
    setAdditionalItemError(false);

    // Visual feedback
    setJustAddedAdditional(true);
    setTimeout(() => setJustAddedAdditional(false), 600);
  };

  // Handler for adding products from ProductSelector
  const handleAddProduct = (product: Product, quantity: number) => {
    const unitType = product.unit_type;
    const validQuantity = unitType === "kg" ? Math.round(quantity * 100) / 100 : Math.floor(quantity);

    const existingIndex = items.findIndex((i) => i.product_id === product.id);

    if (existingIndex >= 0) {
      const newItems = [...items];
      newItems[existingIndex].quantity += validQuantity;
      setItems(newItems);
    } else {
      setItems([
        ...items,
        {
          product_id: product.id,
          product_name: product.name,
          quantity: validQuantity,
          unit_price: product.sale_price,
          unit_type: product.unit_type,
          is_gift: false,
        },
      ]);
    }

    toast({
      title: "Produto adicionado",
      description: `${quantity} ${unitType === "kg" ? "Kg" : unitType === "cento" ? "Cento" : "Un"} de ${product.name}`,
    });
  };

  // Get list of added product IDs for visual feedback
  const addedProductIds = useMemo(() => {
    return items.filter(item => item.product_id).map(item => item.product_id as string);
  }, [items]);

  const handleUpdateItemQuantity = (index: number, delta: number) => {
    const newItems = [...items];
    const item = newItems[index];
    const unitType = item.unit_type;

    const getStep = (type: string) => {
      if (type === "kg") return 0.5;
      return 1;
    };
    const getMinQty = (type: string) => {
      if (type === "kg") return 0.5;
      return 1;
    };

    const step = getStep(unitType);
    const minQty = getMinQty(unitType);
    const newQuantity = item.quantity + delta * step;

    if (newQuantity >= minQty) {
      newItems[index].quantity = unitType === "kg" ? Math.round(newQuantity * 100) / 100 : Math.floor(newQuantity);
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

  const totalItems = items.reduce((sum, item) => {
    if (item.is_gift) return sum;
    return sum + item.quantity * item.unit_price;
  }, 0);
  const giftDiscount = items.reduce((sum, item) => {
    if (!item.is_gift) return sum;
    return sum + item.quantity * item.unit_price;
  }, 0);
  const deliveryFee = form.watch("delivery_fee") || 0;
  const totalAmount = totalItems + deliveryFee;

  const handleSubmit = async (data: z.infer<typeof orderSchema>) => {
    if (items.length === 0) {
      form.setError("client_id", { message: "Adicione pelo menos um produto" });
      return;
    }

    if (!data.client_id) {
      form.setError("client_id", { message: "Selecione um cliente" });
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

  const title = isEditMode
    ? `Editar Pedido ${editOrder?.order_number ? formatOrderNumber(editOrder.order_number) : ""}`
    : "Novo Pedido";

  const footerContent = (
    <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
      <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => onOpenChange(false)}>
        Cancelar
      </Button>
      <Button
        type="submit"
        variant="warm"
        className="w-full sm:w-auto"
        disabled={isLoading || items.length === 0}
        form="order-form"
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isEditMode ? "Salvar Alterações" : "Criar Pedido"}
      </Button>
    </div>
  );

  return (
    <>
      <ResponsivePanel
        open={open}
        onOpenChange={onOpenChange}
        title={title}
        footer={footerContent}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <Form {...form}>
          <form id="order-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Client Selection with Search */}
            <FormField
              control={form.control}
              name="client_id"
              render={({ field }) => {
                const selectedClient = clients.find((c) => c.id === field.value);
                return (
                  <FormItem className="flex flex-col">
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-4 w-4 text-orange-600" />
                      Cliente *
                    </FormLabel>
                    <Popover open={clientSearchOpen} onOpenChange={setClientSearchOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={clientSearchOpen}
                            className={cn(
                              "w-full justify-between font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {selectedClient ? selectedClient.name : "Buscar cliente..."}
                            <div className="flex items-center gap-1 ml-2 shrink-0">
                              {field.value && (
                                <X
                                  className="h-4 w-4 opacity-50 hover:opacity-100"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    field.onChange("");
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
                                      field.value === client.id ? "opacity-100" : "opacity-0",
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
            <div className="space-y-3 overflow-hidden min-w-0">
              <FormLabel className="flex items-center gap-2">
                <Package className="h-4 w-4 text-red-600" />
                Produtos *
              </FormLabel>

              {/* Product Selector with Cards */}
              <ProductSelector
                products={products}
                onAddProduct={handleAddProduct}
                addedProductIds={addedProductIds}
              />

              {/* Items List */}
              {items.length > 0 && (
                <Card className="overflow-hidden">
                  <CardContent className="p-2 sm:p-3 space-y-2 overflow-hidden">
                    {items.map((item, index) => {
                      const unitLabel = item.unit_type === "kg" ? "Kg" : item.unit_type === "cento" ? "Cento" : "Un";
                      const isGift = item.is_gift;
                      const isAdditional = item.product_id === null;
                      return (
                        <div
                          key={index}
                          className={cn(
                            "flex flex-col gap-2 text-sm p-2 rounded-md transition-colors overflow-hidden max-w-full",
                            isGift && "bg-success/10 border border-success/20",
                            isAdditional &&
                              !isGift &&
                              "bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/30",
                          )}
                        >
                          <div className="flex items-start justify-between gap-2 min-w-0">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {isGift && <Gift className="h-3.5 w-3.5 text-success flex-shrink-0" />}
                                {isAdditional && !isGift && (
                                  <PackagePlus className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                )}
                                <span
                                  className={cn(
                                    "font-medium",
                                    isGift && "text-success",
                                    isAdditional && !isGift && "text-blue-700 dark:text-blue-300",
                                  )}
                                >
                                  {item.product_name}
                                </span>
                                {isGift && (
                                  <Badge variant="success" className="text-[9px] px-1 py-0">
                                    BRINDE
                                  </Badge>
                                )}
                                {isAdditional && !isGift && (
                                  <Badge className="text-[9px] px-1 py-0 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                                    ADICIONAL
                                  </Badge>
                                )}
                              </div>
                              {isAdditional ? (
                                <div className="flex items-center gap-1 mt-1">
                                  <CurrencyInput
                                    value={item.unit_price}
                                    onChange={(value) => {
                                      const newItems = [...items];
                                      newItems[index].unit_price = value;
                                      setItems(newItems);
                                    }}
                                    className="h-7 text-xs w-24"
                                  />
                                  <span className="text-muted-foreground text-xs">/{unitLabel}</span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-xs">
                                  {formatCurrency(item.unit_price)}/{unitLabel}
                                </span>
                              )}
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
                                <span className="font-medium">{formatCurrency(item.quantity * item.unit_price)}</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-2 min-w-0">
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon-sm"
                                onClick={() => handleUpdateItemQuantity(index, -1)}
                                disabled={item.quantity <= (item.unit_type === "kg" ? 0.5 : 1)}
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

                            <div className="flex items-center gap-1 shrink-0">
                              <Button
                                type="button"
                                variant={isGift ? "default" : "outline"}
                                size="icon-sm"
                                className={cn("flex-shrink-0", isGift && "bg-success hover:bg-success/90")}
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
                      );
                    })}
                  </CardContent>
                </Card>
              )}

              {items.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhum produto adicionado</p>
              )}
            </div>

            {/* Additional Items Section */}
            <div className="space-y-3 overflow-hidden min-w-0">
              <FormLabel className="flex items-center gap-2">
                <PackagePlus className="h-4 w-4 text-blue-600" />
                Itens Adicionais
              </FormLabel>
              <p className="text-xs text-muted-foreground -mt-1">Para itens avulsos não cadastrados como produto</p>

              <div className="space-y-2">
                {/* Line 1: Description Input */}
                <Input
                  placeholder="Descrição do item"
                  value={additionalItemName}
                  onChange={(e) => {
                    setAdditionalItemName(e.target.value);
                    if (additionalItemError) setAdditionalItemError(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddAdditionalItem();
                    }
                  }}
                  className={cn(
                    "min-w-0 w-full transition-all",
                    additionalItemError && "border-destructive focus-visible:ring-destructive",
                    justAddedAdditional && "animate-pulse bg-success/10 ring-2 ring-success/50 border-success",
                  )}
                />

                {/* Line 2: Quantity + Price + Add Button */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setAdditionalItemQty(Math.max(1, additionalItemQty - 1))}
                      disabled={additionalItemQty <= 1}
                      className="h-9 w-9 shrink-0"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>

                    <div className="relative">
                      <Input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={additionalItemQty}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (!isNaN(value) && value >= 1) {
                            setAdditionalItemQty(value);
                          } else if (e.target.value === "") {
                            setAdditionalItemQty(1);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddAdditionalItem();
                          }
                        }}
                        className="w-20 pr-8 text-center"
                        placeholder="Qtd"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                        Un
                      </span>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setAdditionalItemQty(additionalItemQty + 1)}
                      className="h-9 w-9 shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <CurrencyInput
                    value={additionalItemPrice}
                    onChange={setAdditionalItemPrice}
                    placeholder="R$ 0,00"
                    className="w-24 min-w-0"
                  />

                  <Button
                    type="button"
                    variant="default"
                    onClick={handleAddAdditionalItem}
                    className="shrink-0 gap-1.5"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Delivery Date and Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="delivery_date"
                render={({ field }) => (
                  <FormItem className="overflow-hidden">
                    <FormLabel className="flex items-center gap-1.5">
                      <CalendarDays className="h-4 w-4" />
                      Data de Entrega
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="max-w-full" />
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
                    <FormLabel className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      Horário
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.from({ length: 36 }, (_, i) => {
                          const hour = Math.floor(i / 2) + 6;
                          const minute = (i % 2) * 30;
                          const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
                          return (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
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
                  <FormLabel className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    Endereço de Entrega
                  </FormLabel>
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
                  <FormLabel className="flex items-center gap-1.5">
                    <Truck className="h-4 w-4" />
                    Taxa de Entrega
                  </FormLabel>
                  <FormControl>
                    <CurrencyInput value={field.value || 0} onChange={field.onChange} placeholder="R$ 0,00" />
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
                  <FormLabel className="flex items-center gap-1.5">
                    <FileText className="h-4 w-4" />
                    Observações
                  </FormLabel>
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
          </form>
        </Form>
      </ResponsivePanel>

      {/* New Client Dialog */}
      <ClientFormDialog
        open={showNewClientDialog}
        onOpenChange={setShowNewClientDialog}
        onSubmit={async (data) => {
          const result = await createClient.mutateAsync(data);
          if (result?.id) {
            form.setValue("client_id", result.id);
          }
        }}
        isLoading={createClient.isPending}
      />
    </>
  );
}
