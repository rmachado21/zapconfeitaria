import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Plus, Minus, Check, Package } from "lucide-react";
import { Product } from "@/hooks/useProducts";
import { formatCurrency } from "@/lib/masks";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProductSelectorProps {
  products: Product[];
  onAddProduct: (product: Product, quantity: number) => void;
  addedProductIds?: string[];
}

export function ProductSelector({ products, onAddProduct, addedProductIds = [] }: ProductSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogProduct, setDialogProduct] = useState<Product | null>(null);
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const isMobile = useIsMobile();

  // Filter and group products by category
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const query = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.category?.name?.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  // Group by category
  const groupedProducts = useMemo(() => {
    const groups: Record<string, Product[]> = {};
    const uncategorized: Product[] = [];

    filteredProducts.forEach((product) => {
      if (product.category) {
        const categoryName = product.category.name;
        if (!groups[categoryName]) {
          groups[categoryName] = [];
        }
        groups[categoryName].push(product);
      } else {
        uncategorized.push(product);
      }
    });

    return { groups, uncategorized };
  }, [filteredProducts]);

  const handleProductClick = (product: Product) => {
    setDialogProduct(product);
  };

  const handleConfirmAdd = (quantity: number) => {
    if (!dialogProduct) return;

    onAddProduct(dialogProduct, quantity);
    
    // Visual feedback
    setJustAdded(dialogProduct.id);
    setTimeout(() => setJustAdded(null), 800);

    setDialogProduct(null);
  };

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar produto..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Product Grid */}
      <div className="space-y-4">
        {Object.entries(groupedProducts.groups).map(([categoryName, categoryProducts]) => (
          <div key={categoryName} className="space-y-2">
            <div className="flex items-center gap-2 sticky top-0 bg-background py-1 z-10">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {categoryProducts[0]?.category?.emoji} {categoryName}
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {categoryProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isAdded={addedProductIds.includes(product.id)}
                  justAdded={justAdded === product.id}
                  onClick={() => handleProductClick(product)}
                  isMobile={isMobile}
                />
              ))}
            </div>
          </div>
        ))}

        {groupedProducts.uncategorized.length > 0 && (
          <div className="space-y-2">
            {Object.keys(groupedProducts.groups).length > 0 && (
              <div className="flex items-center gap-2 sticky top-0 bg-background py-1 z-10">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  📦 Outros
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {groupedProducts.uncategorized.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isAdded={addedProductIds.includes(product.id)}
                  justAdded={justAdded === product.id}
                  onClick={() => handleProductClick(product)}
                  isMobile={isMobile}
                />
              ))}
            </div>
          </div>
        )}

        {filteredProducts.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum produto encontrado</p>
          </div>
        )}
      </div>

      {/* Add Product Dialog */}
      <AddProductDialog
        product={dialogProduct}
        open={!!dialogProduct}
        onOpenChange={(open) => !open && setDialogProduct(null)}
        onConfirm={handleConfirmAdd}
      />
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  isAdded: boolean;
  justAdded: boolean;
  onClick: () => void;
  isMobile: boolean;
}

function ProductCard({ product, isAdded, justAdded, onClick, isMobile }: ProductCardProps) {
  const unitLabel = product.unit_type === "kg" ? "Kg" : product.unit_type === "cento" ? "Cento" : "Un";

  return (
    <Card
      onClick={onClick}
      className={cn(
        "p-2 cursor-pointer transition-all duration-200 relative overflow-hidden group",
        "hover:shadow-md hover:border-primary/30",
        justAdded && "animate-pulse bg-success/20 ring-2 ring-success border-success",
        isAdded && !justAdded && "border-success/50 bg-success/5"
      )}
    >
      {/* Horizontal Layout - Compact */}
      <div className="flex items-center gap-2">
        {/* Photo - Smaller and on the side */}
        {product.photo_url ? (
          <div className="h-10 w-10 rounded-md overflow-hidden bg-muted shrink-0">
            <img
              src={product.photo_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="h-10 w-10 rounded-md bg-muted/50 flex items-center justify-center shrink-0">
            <Package className="h-4 w-4 text-muted-foreground/30" />
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium leading-tight line-clamp-1">
            {product.name}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs font-semibold text-primary">
              {formatCurrency(product.sale_price)}
            </span>
            <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">
              {unitLabel}
            </Badge>
          </div>
        </div>

        {/* Quick Add Button - Always visible on mobile */}
        <Button
          type="button"
          size="icon"
          variant="default"
          className={cn(
            "h-7 w-7 shrink-0 shadow-sm transition-opacity",
            isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Added Indicator */}
      {isAdded && !justAdded && (
        <div className="absolute top-1 left-1">
          <div className="h-4 w-4 rounded-full bg-success flex items-center justify-center">
            <Check className="h-2.5 w-2.5 text-success-foreground" />
          </div>
        </div>
      )}

      {/* Just Added Animation */}
      {justAdded && (
        <div className="absolute inset-0 flex items-center justify-center bg-success/20 animate-fade-in">
          <div className="h-8 w-8 rounded-full bg-success flex items-center justify-center animate-scale-in">
            <Check className="h-4 w-4 text-success-foreground" />
          </div>
        </div>
      )}
    </Card>
  );
}

interface AddProductDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (quantity: number) => void;
}

function AddProductDialog({ product, open, onOpenChange, onConfirm }: AddProductDialogProps) {
  const [quantity, setQuantity] = useState(1);

  // Reset quantity when product changes
  useEffect(() => {
    if (product) {
      setQuantity(product.unit_type === "kg" ? 0.5 : 1);
    }
  }, [product]);

  if (!product) return null;

  const unitLabel = product.unit_type === "kg" ? "Kg" : product.unit_type === "cento" ? "Cento" : "Un";
  const step = product.unit_type === "kg" ? 0.5 : 1;
  const minQty = product.unit_type === "kg" ? 0.5 : 1;

  const handleDecrement = () => {
    setQuantity(Math.max(minQty, quantity - step));
  };

  const handleIncrement = () => {
    setQuantity(quantity + step);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(",", ".");
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setQuantity(numValue);
    } else if (value === "" || value === ".") {
      setQuantity(0);
    }
  };

  const handleConfirm = () => {
    const finalQty = quantity < minQty ? minQty : quantity;
    onConfirm(finalQty);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle className="sr-only">Adicionar Produto</DialogTitle>
        </DialogHeader>

        {/* Product Info */}
        <div className="flex items-center gap-3">
          {product.photo_url ? (
            <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted shrink-0">
              <img
                src={product.photo_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="h-16 w-16 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
              <Package className="h-6 w-6 text-muted-foreground/30" />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-medium leading-tight">{product.name}</p>
            <p className="text-sm text-muted-foreground">
              {formatCurrency(product.sale_price)} / {unitLabel}
            </p>
          </div>
        </div>

        {/* Quantity Controls */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Quantidade</label>
          <div className="flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10"
              onClick={handleDecrement}
              disabled={quantity <= minQty}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <div className="relative">
              <Input
                type="text"
                inputMode="decimal"
                value={quantity}
                onChange={handleQuantityChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleConfirm();
                  }
                }}
                className="w-20 h-10 text-center text-lg font-medium pr-7"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                {unitLabel.substring(0, 2)}
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10"
              onClick={handleIncrement}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Subtotal */}
        <div className="flex justify-between items-center py-3 border-t">
          <span className="text-sm text-muted-foreground">Subtotal</span>
          <span className="text-lg font-semibold">
            {formatCurrency(product.sale_price * (quantity < minQty ? minQty : quantity))}
          </span>
        </div>

        {/* Add Button */}
        <Button onClick={handleConfirm} className="w-full gap-2">
          <Plus className="h-4 w-4" />
          Adicionar ao Pedido
        </Button>
      </DialogContent>
    </Dialog>
  );
}
