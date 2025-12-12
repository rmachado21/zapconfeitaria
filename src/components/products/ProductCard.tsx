import { Product } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CakeSlice, Camera, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.();
  };

  const profit = product.salePrice - product.costPrice;
  const profitMargin = product.salePrice > 0 ? Math.round((profit / product.salePrice) * 100) : 0;
  const unitLabel = product.unitType === 'kg' ? 'Kg' : product.unitType === 'cento' ? 'Cento' : 'Un';

  const getMarginColor = (margin: number) => {
    if (margin >= 50) return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800";
    if (margin >= 30) return "bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800";
    if (margin >= 15) return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800";
    return "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800";
  };

  return (
    <Card 
      variant="elevated" 
      className="cursor-pointer group hover:border-primary/30 animate-fade-in" 
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex gap-3">
          {/* Image/Icon */}
          <div className="flex-shrink-0">
            {product.imageUrl ? (
              <div className="w-16 h-16 rounded-xl overflow-hidden">
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="w-full h-full object-cover" 
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-xl bg-muted/50 border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center gap-0.5">
                <Camera className="h-5 w-5 text-muted-foreground/40" />
                <span className="text-[9px] text-muted-foreground/40 font-medium">Sem foto</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
            <div>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-foreground leading-tight line-clamp-1">
                  {product.name}
                </h3>
                <div className="text-right flex-shrink-0">
                  <div className="font-display font-bold text-primary text-base leading-tight">
                    {formatCurrency(product.salePrice)}
                  </div>
                  <span className="text-[10px] text-muted-foreground">/{unitLabel}</span>
                </div>
              </div>
              {product.description && (
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                  {product.description}
                </p>
              )}
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground">
                  Custo: {formatCurrency(product.costPrice)}
                </span>
                <Badge 
                  variant="outline" 
                  className={`text-[10px] px-1.5 py-0 h-5 font-semibold border ${getMarginColor(profitMargin)}`}
                >
                  {profitMargin}%
                </Badge>
              </div>
              
              {/* Actions Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <button className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={handleEdit}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleDelete}
                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}