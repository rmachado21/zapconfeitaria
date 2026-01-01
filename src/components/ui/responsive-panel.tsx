import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

interface ResponsivePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: React.ReactNode;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onInteractOutside?: (event: Event) => void;
}

export function ResponsivePanel({
  open,
  onOpenChange,
  title,
  subtitle,
  description,
  children,
  footer,
  onInteractOutside,
}: ResponsivePanelProps) {
  const isMobile = useIsMobile();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={
          isMobile
            ? "h-[95dvh] flex flex-col p-0"
            : "h-full flex flex-col p-0"
        }
        onInteractOutside={onInteractOutside}
      >
        {/* Header fixo */}
        <SheetHeader className="shrink-0 px-5 pt-5 pb-4 border-b">
          <SheetTitle>{title}</SheetTitle>
          {subtitle}
          {description && (
            <SheetDescription>{description}</SheetDescription>
          )}
        </SheetHeader>

        {/* Conteúdo com scroll NATIVO */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {children}
        </div>

        {/* Footer fixo */}
        {footer && (
          <div className="shrink-0 px-5 py-4 border-t bg-background">
            {footer}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
