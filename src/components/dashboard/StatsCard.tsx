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
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'delivered';
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
    delivered: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800',
  };

  const iconStyles = {
    default: 'bg-primary/10 text-primary',
    primary: 'bg-primary-foreground/20 text-primary-foreground',
    success: 'bg-success/20 text-success',
    warning: 'bg-warning/20 text-warning',
    delivered: 'bg-sky-200 dark:bg-sky-800 text-sky-700 dark:text-sky-200',
  };

  const getTextColor = (type: 'title' | 'value' | 'subtitle' | 'icon') => {
    if (variant === 'primary') {
      return type === 'title' ? 'text-primary-foreground/80' 
           : type === 'value' ? 'text-primary-foreground'
           : type === 'subtitle' ? 'text-primary-foreground/70'
           : 'text-primary-foreground/80';
    }
    if (variant === 'delivered') {
      return type === 'title' ? 'text-sky-600 dark:text-sky-400' 
           : type === 'value' ? 'text-sky-900 dark:text-sky-100'
           : type === 'subtitle' ? 'text-sky-600/80 dark:text-sky-400/80'
           : 'text-sky-600 dark:text-sky-400';
    }
    return type === 'title' ? 'text-muted-foreground' 
         : type === 'value' ? 'text-foreground'
         : type === 'subtitle' ? 'text-muted-foreground'
         : 'text-primary';
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
              <Icon className={cn(
                "md:hidden h-4 w-4",
                getTextColor('icon')
              )} />
              <p className={cn(
                "text-xs font-medium",
                getTextColor('title')
              )}>
                {title}
              </p>
              {tooltip && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className={cn(
                        "hidden md:block h-3.5 w-3.5 cursor-help",
                        variant === 'primary' ? 'text-primary-foreground/60' 
                          : variant === 'delivered' ? 'text-sky-500/60 dark:text-sky-400/60'
                          : 'text-muted-foreground/60'
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
              getTextColor('value')
            )}>
              {value}
            </p>
            {subtitle && (
              <p className={cn(
                "text-xs mt-1",
                getTextColor('subtitle')
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
                getTextColor('subtitle')
              )}>
                {mobileDescription}
              </p>
            )}
          </div>
          <div className={cn(
            "hidden md:flex w-10 h-10 rounded-xl items-center justify-center",
            iconStyles[variant]
          )}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        {/* Mobile tap indicator */}
        {onClick && (
          <div className={cn(
            "md:hidden absolute right-2 top-1/2 -translate-y-1/2",
            variant === 'primary' ? 'text-primary-foreground/40' 
              : variant === 'delivered' ? 'text-sky-400/40 dark:text-sky-500/40'
              : 'text-muted-foreground/40'
          )}>
            <ChevronRight className="h-5 w-5" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
