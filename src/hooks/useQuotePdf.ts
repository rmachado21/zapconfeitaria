import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PdfResult {
  pdf: string;
  fileName: string;
  publicUrl?: string | null;
}

export function useQuotePdf() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generatePdf = async (orderId: string, saveToStorage = false): Promise<PdfResult | null> => {
    setIsGenerating(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Usuário não autenticado');
      }

      const response = await supabase.functions.invoke('generate-quote-pdf', {
        body: { orderId, saveToStorage },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Erro ao gerar PDF');
      }

      const { pdf, fileName, publicUrl } = response.data;

      return { pdf, fileName, publicUrl };
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

  const downloadPdf = async (orderId: string): Promise<void> => {
    const result = await generatePdf(orderId, false);
    if (result) {
      const link = document.createElement('a');
      link.href = result.pdf;
      link.download = result.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'PDF gerado!',
        description: 'O orçamento foi baixado com sucesso.',
      });
    }
  };

  const shareViaWhatsApp = async (orderId: string, phone: string, clientName: string, companyName: string): Promise<void> => {
    const result = await generatePdf(orderId, true);
    if (result && result.publicUrl) {
      const formattedPhone = phone.replace(/\D/g, '').startsWith('55') 
        ? phone.replace(/\D/g, '') 
        : `55${phone.replace(/\D/g, '')}`;
      
      const message = `Olá ${clientName}! 👋

Aqui é da *${companyName}*!

Segue o orçamento do seu pedido:
${result.publicUrl}

Ficamos à disposição! 🍰`;

      const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
      
      const link = document.createElement('a');
      link.href = whatsappUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'PDF pronto para envio!',
        description: 'O WhatsApp será aberto com o link do orçamento.',
      });
    }
  };

  return {
    generatePdf,
    downloadPdf,
    shareViaWhatsApp,
    isGenerating,
  };
}
