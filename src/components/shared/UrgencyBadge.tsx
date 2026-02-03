import { useMemo } from "react";
import { parseISO, differenceInDays, startOfDay, isToday, isPast } from "date-fns";
import { cn } from "@/lib/utils";

type UrgencyLevel = "critical" | "warning" | "normal";

interface UrgencyBadgeProps {
  deliveryDate: string | null | undefined;
  className?: string;
}

interface UrgencyInfo {
  text: string;
  level: UrgencyLevel;
}

export function UrgencyBadge({ deliveryDate, className }: UrgencyBadgeProps) {
  const urgency = useMemo((): UrgencyInfo | null => {
    if (!deliveryDate) return null;

    try {
      const date = parseISO(deliveryDate);
      const today = startOfDay(new Date());
      const deliveryDay = startOfDay(date);
      const daysUntilDelivery = differenceInDays(deliveryDay, today);
      const isDeliveryToday = isToday(date);
      const isOverdue = isPast(date) && !isToday(date);

      if (isOverdue) {
        return { text: "Atrasado", level: "critical" };
      }
      if (isDeliveryToday) {
        return { text: "Hoje!", level: "critical" };
      }
      if (daysUntilDelivery === 1) {
        return { text: "Amanhã", level: "critical" };
      }
      if (daysUntilDelivery >= 2 && daysUntilDelivery <= 3) {
        return { text: `${daysUntilDelivery} dias`, level: "warning" };
      }
      if (daysUntilDelivery > 3) {
        return { text: `${daysUntilDelivery} dias`, level: "normal" };
      }
      return null;
    } catch {
      return null;
    }
  }, [deliveryDate]);

  if (!urgency) return null;

  return (
    <span
      className={cn(
        "text-[10px] font-medium px-1.5 py-0.5 rounded",
        urgency.level === "critical" && "bg-red-500/50 text-red-900 dark:text-red-100",
        urgency.level === "warning" && "bg-amber-500/50 text-amber-900 dark:text-amber-100",
        urgency.level === "normal" && "bg-muted text-muted-foreground",
        className
      )}
    >
      {urgency.text}
    </span>
  );
}
