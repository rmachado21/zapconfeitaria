import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import { WHATSAPP_TEMPLATES, TemplateType, TemplateContext, processTemplate } from "@/lib/whatsappTemplates";
import { openWhatsApp } from "@/lib/whatsapp";
import { ChevronDown, Send, MessageCircle, Eye, FileText, Cake, Wallet, CheckCircle, Heart, Package, Truck, Star, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const TEMPLATE_ICONS: Record<TemplateType, LucideIcon> = {
  quote: FileText,
  birthday: Cake,
  deposit_collection: Wallet,
  order_confirmed: CheckCircle,
  payment_thanks: Heart,
  pickup_ready: Package,
  out_for_delivery: Truck,
  review_request: Star,
};

interface WhatsAppTemplatePreviewProps {
  phone: string;
  context: TemplateContext;
  availableTemplates: TemplateType[];
  disabled?: boolean;
}

export function WhatsAppTemplatePreview({
  phone,
  context,
  availableTemplates,
  disabled,
}: WhatsAppTemplatePreviewProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(null);
  const [open, setOpen] = useState(false);

  const previewMessage = selectedTemplate && WHATSAPP_TEMPLATES[selectedTemplate]
    ? processTemplate(selectedTemplate, context)
    : null;

  const handleSend = () => {
    if (!selectedTemplate || !phone) return;
    
    const cleanPhone = phone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    
    const link = document.createElement('a');
    link.href = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(previewMessage || '')}`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setOpen(false);
    setSelectedTemplate(null);
  };

  const handleOpenFreeChat = () => {
    const cleanPhone = phone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    
    const link = document.createElement('a');
    link.href = `https://wa.me/${formattedPhone}`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          className="flex-1 h-11 sm:h-10 bg-[#25D366] hover:bg-[#20BD5A] text-white"
          disabled={disabled}
        >
          <WhatsAppIcon className="mr-2 h-4 w-4" />
          WhatsApp
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[calc(100vw-2rem)] sm:w-96 p-0" sideOffset={8}>
        <div className="flex flex-col">
          {/* Template Selection */}
          <div className="p-4 border-b">
            <p className="text-sm font-medium mb-3">Escolha o modelo:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {availableTemplates.map((templateType) => {
                const template = WHATSAPP_TEMPLATES[templateType];
                if (!template) return null;
                const isSelected = selectedTemplate === templateType;
                const Icon = TEMPLATE_ICONS[templateType];
                return (
                  <Button
                    key={templateType}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "text-sm h-10 justify-start gap-2",
                      isSelected && "bg-primary"
                    )}
                    onClick={() => setSelectedTemplate(templateType)}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {template.name}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Preview Area */}
          {selectedTemplate && previewMessage && (
            <div className="p-4 border-b bg-muted/30">
              <div className="flex items-center gap-1.5 mb-2 text-xs text-muted-foreground">
                <Eye className="h-3.5 w-3.5" />
                Preview da mensagem:
              </div>
              <ScrollArea className="h-36">
                <div className="bg-background rounded-lg p-3 text-sm whitespace-pre-wrap border shadow-sm">
                  {previewMessage}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Actions */}
          <div className="p-4 flex flex-col gap-2">
            <Button
              onClick={handleSend}
              disabled={!selectedTemplate}
              className="w-full bg-[#25D366] hover:bg-[#20BD5A] text-white"
            >
              <Send className="mr-2 h-4 w-4" />
              Enviar Mensagem
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleOpenFreeChat}
              className="w-full text-muted-foreground"
            >
              <MessageCircle className="mr-2 h-3.5 w-3.5" />
              Abrir conversa livre
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
