import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon, Info, ChevronRight } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning';
  className?: string;
  tooltip?: string;
  mobileDescription?: string;
  onClick?: () => void;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  className,
  tooltip,
  mobileDescription,
  onClick,
}: StatsCardProps) {
  const variantStyles = {
    default: 'bg-card',
    primary: 'gradient-warm text-primary-foreground',
    success: 'bg-success/10 border-success/20',
    warning: 'bg-warning/10 border-warning/20',
  };

  const iconStyles = {
    default: 'bg-primary/10 text-primary',
    primary: 'bg-primary-foreground/20 text-primary-foreground',
    success: 'bg-success/20 text-success',
    warning: 'bg-warning/20 text-warning',
  };

  return (
    <Card 
      className={cn(
        "border transition-all duration-200 hover:shadow-medium",
        variantStyles[variant],
        onClick && "cursor-pointer hover:scale-[1.02] active:scale-[0.98]",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4 relative">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-1">
              <p className={cn(
                "text-xs font-medium",
                variant === 'primary' ? 'text-primary-foreground/80' : 'text-muted-foreground'
              )}>
                {title}
              </p>
              {tooltip && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className={cn(
                        "hidden md:block h-3.5 w-3.5 cursor-help",
                        variant === 'primary' ? 'text-primary-foreground/60' : 'text-muted-foreground/60'
                      )} />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[250px] text-xs">
                      <p>{tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <p className={cn(
              "text-2xl font-display font-bold",
              variant === 'primary' ? 'text-primary-foreground' : 'text-foreground'
            )}>
              {value}
            </p>
            {subtitle && (
              <p className={cn(
                "text-xs mt-1",
                variant === 'primary' ? 'text-primary-foreground/70' : 'text-muted-foreground'
              )}>
                {subtitle}
              </p>
            )}
            {trend && (
              <div className={cn(
                "flex items-center gap-1 mt-2 text-xs font-medium",
                trend.isPositive ? 'text-success' : 'text-destructive'
              )}>
                <span>{trend.isPositive ? '↑' : '↓'}</span>
                <span>{Math.abs(trend.value)}% vs mês anterior</span>
              </div>
            )}
            {mobileDescription && (
              <p className={cn(
                "md:hidden text-[10px] mt-1.5 leading-tight",
                variant === 'primary' ? 'text-primary-foreground/70' : 'text-muted-foreground'
              )}>
                {mobileDescription}
              </p>
            )}
          </div>
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            iconStyles[variant]
          )}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        {/* Mobile tap indicator */}
        {onClick && (
          <div className={cn(
            "md:hidden absolute right-2 top-1/2 -translate-y-1/2",
            variant === 'primary' ? 'text-primary-foreground/40' : 'text-muted-foreground/40'
          )}>
            <ChevronRight className="h-5 w-5" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
