import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductFormDialog } from '@/components/products/ProductFormDialog';
import { DeleteProductDialog } from '@/components/products/DeleteProductDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProducts, Product, ProductFormData } from '@/hooks/useProducts';
import { Plus, Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const Products = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { products, isLoading, createProduct, updateProduct, deleteProduct } = useProducts();

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = () => {
    setSelectedProduct(null);
    setFormOpen(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setFormOpen(true);
  };

  const handleDelete = (product: Product) => {
    setSelectedProduct(product);
    setDeleteOpen(true);
  };

  const handleSubmit = async (data: ProductFormData) => {
    if (selectedProduct) {
      await updateProduct.mutateAsync({ id: selectedProduct.id, ...data });
    } else {
      await createProduct.mutateAsync(data);
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedProduct) {
      await deleteProduct.mutateAsync(selectedProduct.id);
      setDeleteOpen(false);
      setSelectedProduct(null);
    }
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
              Produtos
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {products.length} produtos cadastrados
            </p>
          </div>
          <Button variant="warm" onClick={handleCreate}>
            <Plus className="h-5 w-5" />
            Novo Produto
          </Button>
        </header>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produtos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Products List */}
        <section className="space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>{products.length === 0 ? 'Nenhum produto cadastrado' : 'Nenhum produto encontrado'}</p>
              {products.length === 0 && (
                <Button variant="link" className="mt-2" onClick={handleCreate}>
                  Cadastrar primeiro produto
                </Button>
              )}
            </div>
          ) : (
            filteredProducts.map((product, index) => (
              <div
                key={product.id}
                className={cn("animate-slide-up", `stagger-${Math.min(index + 1, 5)}`)}
                style={{ opacity: 0, animationFillMode: 'forwards' }}
              >
                <ProductCard
                  product={{
                    id: product.id,
                    name: product.name,
                    description: product.description || undefined,
                    costPrice: product.cost_price,
                    salePrice: product.sale_price,
                    unitType: product.unit_type as 'kg' | 'unit',
                    imageUrl: product.photo_url || undefined,
                    createdAt: product.created_at,
                  }}
                  onClick={() => handleEdit(product)}
                  onDelete={() => handleDelete(product)}
                />
              </div>
            ))
          )}
        </section>

        {/* Mobile FAB */}
        <Button
          variant="warm"
          size="icon-lg"
          className="fixed bottom-20 right-4 md:hidden shadow-warm rounded-full z-40"
          onClick={handleCreate}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Form Dialog */}
      <ProductFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        product={selectedProduct}
        onSubmit={handleSubmit}
        isLoading={createProduct.isPending || updateProduct.isPending}
      />

      {/* Delete Dialog */}
      <DeleteProductDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        productName={selectedProduct?.name || ''}
        onConfirm={handleConfirmDelete}
        isLoading={deleteProduct.isPending}
      />
    </AppLayout>
  );
};

export default Products;
