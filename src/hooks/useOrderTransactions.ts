import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface OrderTransaction {
  id: string;
  amount: number;
  type: "income" | "expense";
  description: string | null;
  date: string;
  created_at: string;
}

export function useOrderTransactions(orderId: string | null) {
  return useQuery({
    queryKey: ["order-transactions", orderId],
    queryFn: async () => {
      if (!orderId) return [];
      
      const { data, error } = await supabase
        .from("transactions")
        .select("id, amount, type, description, date, created_at")
        .eq("order_id", orderId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as OrderTransaction[];
    },
    enabled: !!orderId,
  });
}
