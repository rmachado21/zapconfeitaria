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
export function ProductCard({
  product,
  onClick,
  onDelete
}: ProductCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.();
  };
  const profit = product.salePrice - product.costPrice;
  const profitMargin = product.salePrice > 0 ? (profit / product.salePrice * 100).toFixed(0) : '0';
  const unitLabel = product.unitType === 'kg' ? 'Kg' : product.unitType === 'cento' ? 'Cento' : 'Un';
  return <Card variant="elevated" className="cursor-pointer group hover:border-primary/30 animate-fade-in" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex gap-3">
          {/* Image/Icon */}
          <div className="w-16 h-16 rounded-xl bg-cream flex items-center justify-center flex-shrink-0 overflow-hidden">
            {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" /> : <CakeSlice className="h-7 w-7 text-chocolate" />}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
            <div>
              <h3 className="font-semibold text-foreground leading-tight line-clamp-2">
                {product.name}
              </h3>
              {product.description && <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                  {product.description}
                </p>}
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  Custo: {formatCurrency(product.costPrice)}
                </span>
                <Badge variant="success" className="text-[10px]">
                  {profitMargin}%
                </Badge>
              </div>
              <div className="flex items-baseline gap-0.5">
                <span className="font-display font-bold text-primary text-base">
                  {formatCurrency(product.salePrice)}
                </span>
                <span className="text-xs text-muted-foreground">/{unitLabel}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col items-center justify-between py-0.5">
            <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </div>
      </CardContent>
    </Card>;
}