import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductFormDialog } from '@/components/products/ProductFormDialog';
import { DeleteProductDialog } from '@/components/products/DeleteProductDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProducts, Product, ProductFormData } from '@/hooks/useProducts';
import { Plus, Search, Loader2, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'date-desc' | 'date-asc';

const Products = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { products, isLoading, createProduct, updateProduct, deleteProduct } = useProducts();

  const filteredAndSortedProducts = useMemo(() => {
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name, 'pt-BR');
        case 'name-desc':
          return b.name.localeCompare(a.name, 'pt-BR');
        case 'price-asc':
          return a.sale_price - b.sale_price;
        case 'price-desc':
          return b.sale_price - a.sale_price;
        case 'date-desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'date-asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        default:
          return 0;
      }
    });
  }, [products, searchQuery, sortBy]);

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

        {/* Search & Sort */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-full sm:w-48">
              <ArrowUpDown className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Nome (A-Z)</SelectItem>
              <SelectItem value="name-desc">Nome (Z-A)</SelectItem>
              <SelectItem value="price-asc">Preço (menor)</SelectItem>
              <SelectItem value="price-desc">Preço (maior)</SelectItem>
              <SelectItem value="date-desc">Mais recentes</SelectItem>
              <SelectItem value="date-asc">Mais antigos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Products List */}
        <section className="space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredAndSortedProducts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>{products.length === 0 ? 'Nenhum produto cadastrado' : 'Nenhum produto encontrado'}</p>
              {products.length === 0 && (
                <Button variant="link" className="mt-2" onClick={handleCreate}>
                  Cadastrar primeiro produto
                </Button>
              )}
            </div>
          ) : (
            filteredAndSortedProducts.map((product, index) => (
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
