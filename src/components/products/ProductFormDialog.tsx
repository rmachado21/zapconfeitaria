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
import { Loader2, Package, FileText, DollarSign, Tag, Ruler, Image, Layers, Plus } from 'lucide-react';
import { Product, ProductFormData } from '@/hooks/useProducts';
import { useProductCategories, getCategoryColorClasses } from '@/hooks/useProductCategories';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { CurrencyInput } from '@/components/shared/CurrencyInput';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatCurrency } from '@/lib/masks';
import { CategoryFormDialog } from './CategoryFormDialog';
import { cn } from '@/lib/utils';

const productSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  description: z.string().max(500).optional(),
  cost_price: z.coerce.number().min(0, 'Preço deve ser positivo'),
  sale_price: z.coerce.number().min(0, 'Preço deve ser positivo'),
  unit_type: z.enum(['kg', 'unit', 'cento']),
  photo_url: z.string().url().optional().or(z.literal('')),
  category_id: z.string().optional().nullable(),
});

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSubmit: (data: ProductFormData) => Promise<void>;
  isLoading: boolean;
}

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  onSubmit,
  isLoading,
}: ProductFormDialogProps) {
  const isEditing = !!product;
  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const { categories, createCategory } = useProductCategories();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      cost_price: 0,
      sale_price: 0,
      unit_type: 'unit',
      photo_url: '',
      category_id: null,
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description || '',
        cost_price: product.cost_price,
        sale_price: product.sale_price,
        unit_type: product.unit_type as 'kg' | 'unit' | 'cento',
        photo_url: product.photo_url || '',
        category_id: product.category_id || null,
      });
    } else {
      form.reset({
        name: '',
        description: '',
        cost_price: 0,
        sale_price: 0,
        unit_type: 'unit',
        photo_url: '',
        category_id: null,
      });
    }
  }, [product, form, open]);

  const handleSubmit = async (data: ProductFormData) => {
    await onSubmit(data);
    onOpenChange(false);
    form.reset();
  };

  const handleCategorySubmit = async (data: { name: string; emoji: string; color: string }) => {
    const result = await createCategory.mutateAsync(data);
    if (result) {
      form.setValue('category_id', result.id);
    }
  };

  const costPrice = form.watch('cost_price');
  const salePrice = form.watch('sale_price');
  const profit = salePrice - costPrice;
  const profitMargin = salePrice > 0 ? ((profit / salePrice) * 100).toFixed(0) : '0';

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="font-display">
              {isEditing ? 'Editar Produto' : 'Novo Produto'}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[70dvh] pr-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <Package className="h-4 w-4" />
                        Nome *
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do produto" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <Layers className="h-4 w-4" />
                        Categoria
                      </FormLabel>
                      <div className="flex gap-2">
                        <Select 
                          onValueChange={(value) => field.onChange(value === 'none' ? null : value)} 
                          value={field.value || 'none'}
                        >
                          <FormControl>
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Selecione a categoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Sem categoria</SelectItem>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                <span className={cn(
                                  "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium",
                                  getCategoryColorClasses(cat.color)
                                )}>
                                  {cat.emoji} {cat.name}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon"
                          onClick={() => setCategoryFormOpen(true)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <FileText className="h-4 w-4" />
                        Descrição
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descrição do produto..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="cost_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5">
                          <DollarSign className="h-4 w-4" />
                          Preço de Custo *
                        </FormLabel>
                        <FormControl>
                          <CurrencyInput
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="R$ 0,00"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sale_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5">
                          <Tag className="h-4 w-4" />
                          Preço de Venda *
                        </FormLabel>
                        <FormControl>
                          <CurrencyInput
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="R$ 0,00"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {salePrice > 0 && (
                  <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                    <p className="text-sm text-success font-medium">
                      Lucro: {formatCurrency(profit)} ({profitMargin}% de margem)
                    </p>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="unit_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <Ruler className="h-4 w-4" />
                        Tipo de Unidade *
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="unit">Por Unidade (Un)</SelectItem>
                          <SelectItem value="kg">Por Kg</SelectItem>
                          <SelectItem value="cento">Por Cento</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="photo_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <Image className="h-4 w-4" />
                        Foto do Produto
                      </FormLabel>
                      <FormControl>
                        <ImageUpload
                          bucket="product-images"
                          currentUrl={field.value}
                          onUpload={(url) => field.onChange(url)}
                          onRemove={() => field.onChange('')}
                          aspectRatio="compact"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" variant="warm" className="w-full sm:w-auto" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditing ? 'Salvar' : 'Cadastrar'}
                  </Button>
                </div>
              </form>
            </Form>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <CategoryFormDialog
        open={categoryFormOpen}
        onOpenChange={setCategoryFormOpen}
        onSubmit={handleCategorySubmit}
        isLoading={createCategory.isPending}
      />
    </>
  );
}
