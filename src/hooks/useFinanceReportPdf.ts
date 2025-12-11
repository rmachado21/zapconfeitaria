import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Transaction, PeriodFilter } from '@/hooks/useTransactions';

interface ReportData {
  period: PeriodFilter;
  periodLabel: string;
  periodDates: { start: string; end: string };
  summary: {
    balance: number;
    totalIncome: number;
    totalExpenses: number;
    grossProfit: { profit: number; margin: number; revenue: number; costs: number };
  };
  transactions: Transaction[];
  expensesByCategory: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
}

interface PdfResult {
  pdf: string;
  fileName: string;
}

export function useFinanceReportPdf() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generatePdf = async (data: ReportData): Promise<PdfResult | null> => {
    setIsGenerating(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Usuário não autenticado');
      }

      const response = await supabase.functions.invoke('generate-finance-report-pdf', {
        body: data,
      });

      if (response.error) {
        throw new Error(response.error.message || 'Erro ao gerar PDF');
      }

      const { pdf, fileName } = response.data;
      return { pdf, fileName };
    } catch (error: any) {
      console.error('Error generating finance report PDF:', error);
      toast({
        title: 'Erro ao gerar relatório',
        description: error.message || 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPdf = async (data: ReportData): Promise<void> => {
    const result = await generatePdf(data);
    if (result) {
      const link = document.createElement('a');
      link.href = result.pdf;
      link.download = result.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Relatório gerado!',
        description: 'O PDF foi baixado com sucesso.',
      });
    }
  };

  return {
    generatePdf,
    downloadPdf,
    isGenerating,
  };
}
