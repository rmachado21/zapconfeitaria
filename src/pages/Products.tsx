import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProductCard } from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockProducts } from '@/data/mockData';
import { Plus, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

const Products = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = mockProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              {mockProducts.length} produtos cadastrados
            </p>
          </div>
          <Button variant="warm">
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
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Nenhum produto encontrado</p>
            </div>
          ) : (
            filteredProducts.map((product, index) => (
              <div
                key={product.id}
                className={cn("animate-slide-up", `stagger-${Math.min(index + 1, 5)}`)}
                style={{ opacity: 0, animationFillMode: 'forwards' }}
              >
                <ProductCard product={product} />
              </div>
            ))
          )}
        </section>

        {/* Mobile FAB */}
        <Button
          variant="warm"
          size="icon-lg"
          className="fixed bottom-20 right-4 md:hidden shadow-warm rounded-full z-40"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </AppLayout>
  );
};

export default Products;
