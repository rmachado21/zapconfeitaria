import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Loader2, X } from 'lucide-react';

interface PdfPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pdfData: string | null;
  fileName: string;
  isLoading: boolean;
  onDownload: () => void;
}

export function PdfPreviewDialog({
  open,
  onOpenChange,
  pdfData,
  fileName,
  isLoading,
  onDownload,
}: PdfPreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-display">Preview do Orçamento</DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-[400px] max-h-[60vh] bg-muted rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Gerando preview...</p>
              </div>
            </div>
          ) : pdfData ? (
            <iframe
              src={pdfData}
              className="w-full h-full border-0"
              title="PDF Preview"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Erro ao carregar preview</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            <X className="mr-2 h-4 w-4" />
            Fechar
          </Button>
          <Button
            variant="warm"
            onClick={onDownload}
            disabled={!pdfData || isLoading}
          >
            <Download className="mr-2 h-4 w-4" />
            Baixar PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
