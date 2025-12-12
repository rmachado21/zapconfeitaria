import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  useProductCategories, 
  ProductCategory, 
  CategoryFormData,
  SUGGESTED_CATEGORIES,
  getCategoryColorClasses 
} from '@/hooks/useProductCategories';
import { CategoryFormDialog } from './CategoryFormDialog';
import { Pencil, Trash2, Plus, Lightbulb, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface CategoryManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CategoryManager({ open, onOpenChange }: CategoryManagerProps) {
  const { categories, isLoading, createCategory, updateCategory, deleteCategory } = useProductCategories();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);

  const handleCreate = () => {
    setSelectedCategory(null);
    setFormOpen(true);
  };

  const handleEdit = (category: ProductCategory) => {
    setSelectedCategory(category);
    setFormOpen(true);
  };

  const handleDeleteClick = (category: ProductCategory) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedCategory) {
      await deleteCategory.mutateAsync(selectedCategory.id);
      setDeleteDialogOpen(false);
      setSelectedCategory(null);
    }
  };

  const handleSubmit = async (data: CategoryFormData) => {
    if (selectedCategory) {
      await updateCategory.mutateAsync({ id: selectedCategory.id, ...data });
    } else {
      await createCategory.mutateAsync(data);
    }
  };

  const handleAddSuggested = async (suggestion: CategoryFormData) => {
    await createCategory.mutateAsync(suggestion);
  };

  const suggestedNotAdded = SUGGESTED_CATEGORIES.filter(
    suggestion => !categories.some(cat => cat.name.toLowerCase() === suggestion.name.toLowerCase())
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[450px]" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="font-display">Gerenciar Categorias</DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[60dvh]">
            <div className="space-y-4 pr-4">
              {/* Suggested Categories */}
              {suggestedNotAdded.length > 0 && categories.length === 0 && (
                <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                      Comece com categorias sugeridas
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestedNotAdded.map((suggestion) => (
                      <Button
                        key={suggestion.name}
                        variant="outline"
                        size="sm"
                        className={cn(
                          "border-2",
                          getCategoryColorClasses(suggestion.color)
                        )}
                        onClick={() => handleAddSuggested(suggestion)}
                        disabled={createCategory.isPending}
                      >
                        {suggestion.emoji} {suggestion.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Category List */}
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <p>Nenhuma categoria cadastrada</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                    >
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium",
                        getCategoryColorClasses(category.color)
                      )}>
                        {category.emoji} {category.name}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(category)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteClick(category)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Button */}
              <Button
                variant="outline"
                className="w-full border-dashed"
                onClick={handleCreate}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Categoria
              </Button>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Category Form Dialog */}
      <CategoryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        category={selectedCategory}
        onSubmit={handleSubmit}
        isLoading={createCategory.isPending || updateCategory.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a categoria "{selectedCategory?.name}"?
              Os produtos desta categoria ficarão sem categoria.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteCategory.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
