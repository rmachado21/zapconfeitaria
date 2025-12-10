import { Product } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CakeSlice, ChevronRight, Trash2 } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
  onDelete?: () => void;
}

export function ProductCard({ product, onClick, onDelete }: ProductCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.();
  };

  const profit = product.salePrice - product.costPrice;
  const profitMargin = product.salePrice > 0 ? ((profit / product.salePrice) * 100).toFixed(0) : '0';

  return (
    <Card 
      variant="elevated" 
      className="cursor-pointer group hover:border-primary/30 animate-fade-in"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Image/Icon */}
          <div className="w-14 h-14 rounded-xl bg-cream flex items-center justify-center flex-shrink-0">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <CakeSlice className="h-6 w-6 text-chocolate" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground truncate">{product.name}</h3>
              <Badge variant="cream" className="text-[10px]">
                {product.unitType === 'kg' ? 'Por Kg' : 'Unidade'}
              </Badge>
            </div>
            {product.description && (
              <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                {product.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-xs">
              <span className="text-muted-foreground">
                Custo: {formatCurrency(product.costPrice)}
              </span>
              <Badge variant="success" className="text-[10px]">
                {profitMargin}% margem
              </Badge>
            </div>
          </div>

          {/* Price & Actions */}
          <div className="flex items-center gap-2">
            <span className="font-display font-semibold text-lg text-primary">
              {formatCurrency(product.salePrice)}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
