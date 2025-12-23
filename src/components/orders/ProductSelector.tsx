import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Search, Plus, Minus, Check, Package } from "lucide-react";
import { Product } from "@/hooks/useProducts";
import { formatCurrency } from "@/lib/masks";
import { cn } from "@/lib/utils";

interface ProductSelectorProps {
  products: Product[];
  onAddProduct: (product: Product, quantity: number) => void;
  addedProductIds?: string[];
}

export function ProductSelector({ products, onAddProduct, addedProductIds = [] }: ProductSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [justAdded, setJustAdded] = useState<string | null>(null);

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
    if (selectedProduct?.id === product.id) {
      setSelectedProduct(null);
      setQuantity(1);
    } else {
      setSelectedProduct(product);
      setQuantity(product.unit_type === "kg" ? 0.5 : 1);
    }
  };

  const handleAddProduct = () => {
    if (!selectedProduct) return;

    onAddProduct(selectedProduct, quantity);
    
    // Visual feedback
    setJustAdded(selectedProduct.id);
    setTimeout(() => setJustAdded(null), 800);

    setSelectedProduct(null);
    setQuantity(1);
  };

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    const defaultQty = product.unit_type === "kg" ? 0.5 : 1;
    onAddProduct(product, defaultQty);
    
    // Visual feedback
    setJustAdded(product.id);
    setTimeout(() => setJustAdded(null), 800);
  };

  const getUnitLabel = (unitType: string) => {
    switch (unitType) {
      case "kg": return "Kg";
      case "cento": return "Cento";
      default: return "Un";
    }
  };

  const getStep = (unitType: string) => unitType === "kg" ? 0.5 : 1;
  const getMinQty = (unitType: string) => unitType === "kg" ? 0.5 : 1;

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
      <div className="max-h-[280px] overflow-y-auto space-y-4 pr-1">
        {Object.entries(groupedProducts.groups).map(([categoryName, categoryProducts]) => (
          <div key={categoryName} className="space-y-2">
            <div className="flex items-center gap-2 sticky top-0 bg-background py-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {categoryProducts[0]?.category?.emoji} {categoryName}
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {categoryProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isSelected={selectedProduct?.id === product.id}
                  isAdded={addedProductIds.includes(product.id)}
                  justAdded={justAdded === product.id}
                  onClick={() => handleProductClick(product)}
                  onQuickAdd={(e) => handleQuickAdd(product, e)}
                />
              ))}
            </div>
          </div>
        ))}

        {groupedProducts.uncategorized.length > 0 && (
          <div className="space-y-2">
            {Object.keys(groupedProducts.groups).length > 0 && (
              <div className="flex items-center gap-2 sticky top-0 bg-background py-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  📦 Outros
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              {groupedProducts.uncategorized.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isSelected={selectedProduct?.id === product.id}
                  isAdded={addedProductIds.includes(product.id)}
                  justAdded={justAdded === product.id}
                  onClick={() => handleProductClick(product)}
                  onQuickAdd={(e) => handleQuickAdd(product, e)}
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

      {/* Quantity Controls (shown when product is selected) */}
      {selectedProduct && (
        <Card className="p-3 bg-primary/5 border-primary/20 animate-fade-in">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{selectedProduct.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(selectedProduct.sale_price)}/{getUnitLabel(selectedProduct.unit_type)}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    const step = getStep(selectedProduct.unit_type);
                    const min = getMinQty(selectedProduct.unit_type);
                    setQuantity(Math.max(min, quantity - step));
                  }}
                  disabled={quantity <= getMinQty(selectedProduct.unit_type)}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                
                <div className="relative">
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={quantity}
                    onChange={(e) => {
                      const value = e.target.value.replace(",", ".");
                      const numValue = parseFloat(value);
                      if (!isNaN(numValue) && numValue >= 0) {
                        setQuantity(numValue);
                      } else if (value === "" || value === ".") {
                        setQuantity(0);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddProduct();
                      }
                    }}
                    className="w-16 h-8 text-center text-sm pr-6"
                  />
                  <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                    {getUnitLabel(selectedProduct.unit_type).substring(0, 2)}
                  </span>
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    const step = getStep(selectedProduct.unit_type);
                    setQuantity(quantity + step);
                  }}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              
              <Button
                type="button"
                size="sm"
                onClick={handleAddProduct}
                className="gap-1 shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                Adicionar
              </Button>
            </div>
          </div>
          
          <div className="mt-2 pt-2 border-t border-primary/10 flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Subtotal</span>
            <span className="font-semibold text-sm">
              {formatCurrency(selectedProduct.sale_price * quantity)}
            </span>
          </div>
        </Card>
      )}
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  isSelected: boolean;
  isAdded: boolean;
  justAdded: boolean;
  onClick: () => void;
  onQuickAdd: (e: React.MouseEvent) => void;
}

function ProductCard({ product, isSelected, isAdded, justAdded, onClick, onQuickAdd }: ProductCardProps) {
  const unitLabel = product.unit_type === "kg" ? "Kg" : product.unit_type === "cento" ? "Cento" : "Un";

  return (
    <Card
      onClick={onClick}
      className={cn(
        "p-2.5 cursor-pointer transition-all duration-200 relative overflow-hidden group",
        "hover:shadow-md hover:border-primary/30",
        isSelected && "ring-2 ring-primary border-primary bg-primary/5",
        justAdded && "animate-pulse bg-success/20 ring-2 ring-success border-success",
        isAdded && !isSelected && !justAdded && "border-success/50 bg-success/5"
      )}
    >
      {/* Photo or Placeholder */}
      {product.photo_url ? (
        <div className="aspect-square w-full mb-2 rounded-md overflow-hidden bg-muted">
          <img
            src={product.photo_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="aspect-square w-full mb-2 rounded-md bg-muted/50 flex items-center justify-center">
          <Package className="h-8 w-8 text-muted-foreground/30" />
        </div>
      )}

      {/* Product Info */}
      <div className="space-y-1">
        <p className="text-xs font-medium leading-tight line-clamp-2 min-h-[2rem]">
          {product.name}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-primary">
            {formatCurrency(product.sale_price)}
          </span>
          <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">
            {unitLabel}
          </Badge>
        </div>
      </div>

      {/* Quick Add Button */}
      <Button
        type="button"
        size="icon"
        variant="default"
        className={cn(
          "absolute top-1.5 right-1.5 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity",
          "shadow-sm"
        )}
        onClick={onQuickAdd}
      >
        <Plus className="h-3 w-3" />
      </Button>

      {/* Added Indicator */}
      {isAdded && !justAdded && (
        <div className="absolute top-1.5 left-1.5">
          <div className="h-5 w-5 rounded-full bg-success flex items-center justify-center">
            <Check className="h-3 w-3 text-success-foreground" />
          </div>
        </div>
      )}

      {/* Just Added Animation */}
      {justAdded && (
        <div className="absolute inset-0 flex items-center justify-center bg-success/20 animate-fade-in">
          <div className="h-10 w-10 rounded-full bg-success flex items-center justify-center animate-scale-in">
            <Check className="h-5 w-5 text-success-foreground" />
          </div>
        </div>
      )}
    </Card>
  );
}
