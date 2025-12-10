import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PdfResult {
  pdf: string;
  fileName: string;
}

export function useQuotePdf() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generatePdf = async (orderId: string): Promise<PdfResult | null> => {
    setIsGenerating(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Usuário não autenticado');
      }

      const response = await supabase.functions.invoke('generate-quote-pdf', {
        body: { orderId },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Erro ao gerar PDF');
      }

      const { pdf, fileName } = response.data;

      // Download the PDF
      const link = document.createElement('a');
      link.href = pdf;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'PDF gerado!',
        description: 'O orçamento foi baixado com sucesso.',
      });

      return { pdf, fileName };
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Erro ao gerar PDF',
        description: error.message || 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generatePdf,
    isGenerating,
  };
}
