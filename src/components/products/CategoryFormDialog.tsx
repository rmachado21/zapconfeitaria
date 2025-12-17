import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ResponsivePanel } from '@/components/ui/responsive-panel';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Tag, Palette, Smile } from 'lucide-react';
import { 
  ProductCategory, 
  CategoryFormData, 
  CATEGORY_COLORS, 
  CATEGORY_EMOJIS,
  getCategoryColorClasses 
} from '@/hooks/useProductCategories';
import { cn } from '@/lib/utils';

const categorySchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(50),
  emoji: z.string().min(1, 'Selecione um emoji'),
  color: z.string().min(1, 'Selecione uma cor'),
});

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: ProductCategory | null;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  isLoading: boolean;
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  onSubmit,
  isLoading,
}: CategoryFormDialogProps) {
  const isEditing = !!category;

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      emoji: '📋',
      color: 'gray',
    },
  });

  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        emoji: category.emoji,
        color: category.color,
      });
    } else {
      form.reset({
        name: '',
        emoji: '📋',
        color: 'gray',
      });
    }
  }, [category, form, open]);

  const handleSubmit = async (data: CategoryFormData) => {
    await onSubmit(data);
    onOpenChange(false);
    form.reset();
  };

  const selectedEmoji = form.watch('emoji');
  const selectedColor = form.watch('color');

  const footerContent = (
    <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
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
        disabled={isLoading}
        form="category-form"
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isEditing ? 'Salvar' : 'Criar'}
      </Button>
    </div>
  );

  return (
    <ResponsivePanel
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Editar Categoria' : 'Nova Categoria'}
      footer={footerContent}
      onInteractOutside={(e) => e.preventDefault()}
    >
      <Form {...form}>
        <form id="category-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
          {/* Preview */}
          <div className="flex items-center justify-center">
            <span className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium",
              getCategoryColorClasses(selectedColor)
            )}>
              {selectedEmoji} {form.watch('name') || 'Nome da categoria'}
            </span>
          </div>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5">
                  <Tag className="h-4 w-4" />
                  Nome *
                </FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Bolos Decorados" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="emoji"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5">
                  <Smile className="h-4 w-4" />
                  Emoji
                </FormLabel>
                <FormControl>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORY_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => field.onChange(emoji)}
                        className={cn(
                          "w-9 h-9 text-lg rounded-lg border-2 transition-all hover:scale-110",
                          field.value === emoji
                            ? "border-primary bg-primary/10"
                            : "border-transparent bg-muted hover:bg-muted/80"
                        )}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5">
                  <Palette className="h-4 w-4" />
                  Cor
                </FormLabel>
                <FormControl>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORY_COLORS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => field.onChange(color.value)}
                        className={cn(
                          "w-9 h-9 rounded-lg border-2 transition-all hover:scale-110",
                          color.bg,
                          field.value === color.value
                            ? "border-primary ring-2 ring-primary/30"
                            : "border-transparent"
                        )}
                        title={color.label}
                      />
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </ResponsivePanel>
  );
}
