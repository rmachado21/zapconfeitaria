import { Settings2, Eye, EyeOff } from 'lucide-react';
import { OrderStatus, ORDER_STATUS_CONFIG } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

const ALL_COLUMNS: OrderStatus[] = [
  'quote',
  'awaiting_deposit',
  'in_production',
  'ready',
  'delivered',
  'cancelled',
];

interface KanbanColumnSettingsProps {
  hiddenColumns: OrderStatus[];
  onHiddenColumnsChange: (columns: OrderStatus[]) => void;
  isLoading?: boolean;
}

export function KanbanColumnSettings({
  hiddenColumns,
  onHiddenColumnsChange,
  isLoading,
}: KanbanColumnSettingsProps) {
  const toggleColumn = (status: OrderStatus) => {
    if (hiddenColumns.includes(status)) {
      onHiddenColumnsChange(hiddenColumns.filter(s => s !== status));
    } else {
      onHiddenColumnsChange([...hiddenColumns, status]);
    }
  };

  const visibleCount = ALL_COLUMNS.length - hiddenColumns.length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" disabled={isLoading}>
          <Settings2 className="h-4 w-4" />
          <span className="hidden sm:inline">Colunas</span>
          {hiddenColumns.length > 0 && (
            <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">
              {visibleCount}/{ALL_COLUMNS.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-3 bg-popover">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Colunas visíveis</h4>
            <span className="text-xs text-muted-foreground">
              {visibleCount} de {ALL_COLUMNS.length}
            </span>
          </div>
          
          <div className="space-y-1">
            {ALL_COLUMNS.map((status) => {
              const config = ORDER_STATUS_CONFIG[status];
              const isHidden = hiddenColumns.includes(status);
              
              return (
                <label
                  key={status}
                  className={cn(
                    "flex items-center gap-3 px-2 py-2 rounded-md cursor-pointer transition-colors hover:bg-accent",
                    isHidden && "opacity-60"
                  )}
                >
                  <Checkbox
                    checked={!isHidden}
                    onCheckedChange={() => toggleColumn(status)}
                    disabled={isLoading}
                  />
                  <div className={cn("w-3 h-3 rounded-full flex-shrink-0", config.dotColor)} />
                  <span className="text-sm flex-1">{config.label}</span>
                  {isHidden ? (
                    <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </label>
              );
            })}
          </div>

          {hiddenColumns.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => onHiddenColumnsChange([])}
              disabled={isLoading}
            >
              Mostrar todas
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}