import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export type TemplateType = 'quote' | 'birthday' | 'deposit_collection' | 'order_ready';

export interface TemplateConfig {
  id: TemplateType;
  name: string;
  template: string;
  description: string;
}

export const WHATSAPP_TEMPLATES: Record<TemplateType, TemplateConfig> = {
  quote: {
    id: 'quote',
    name: 'Enviar Orçamento',
    template: `Olá [Nome]! 😊

Segue o orçamento do pedido [Pedido] para entrega em [DataEntrega].

Valor total: [Valor]

Qualquer dúvida, estou à disposição!`,
    description: 'Enviar orçamento com valor e data',
  },
  birthday: {
    id: 'birthday',
    name: 'Feliz Aniversário',
    template: `Olá [Nome]! 🎂

A [NomeEmpresa] deseja um Feliz Aniversário! Que seu dia seja tão doce quanto nossas delícias!

Um grande abraço! 🎉`,
    description: 'Parabenizar cliente pelo aniversário',
  },
  deposit_collection: {
    id: 'deposit_collection',
    name: 'Cobrar Sinal',
    template: `Olá [Nome]! 👋

Estou passando para lembrar sobre o sinal de 50% do pedido [Pedido], no valor de [ValorSinal].

Assim que confirmado, inicio a produção para entrega em [DataEntrega].

Obrigada! 💕`,
    description: 'Cobrar sinal de 50% pendente',
  },
  order_ready: {
    id: 'order_ready',
    name: 'Pedido Pronto',
    template: `Olá [Nome]! ✨

Seu pedido [Pedido] está pronto e aguardando entrega/retirada!

Data combinada: [DataEntrega]
Valor restante: [ValorRestante]

Até logo! 🍰`,
    description: 'Avisar que o pedido está pronto',
  },
};

export interface TemplateContext {
  clientName?: string;
  companyName?: string;
  orderNumber?: number | null;
  totalAmount?: number;
  depositAmount?: number;
  remainingAmount?: number;
  deliveryDate?: string | null;
  deliveryTime?: string | null;
  depositPaid?: boolean;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatDeliveryDate(dateString: string | null, timeString?: string | null): string {
  if (!dateString) return 'a definir';
  try {
    const formatted = format(parseISO(dateString), "dd 'de' MMMM", { locale: ptBR });
    if (timeString) {
      return `${formatted} às ${timeString.slice(0, 5)}`;
    }
    return formatted;
  } catch {
    return 'a definir';
  }
}

function formatOrderNumber(orderNumber: number | null | undefined): string {
  if (!orderNumber) return '';
  return `#${String(orderNumber).padStart(4, '0')}`;
}

/**
 * Process a template by replacing variables with actual values
 */
export function processTemplate(
  templateType: TemplateType,
  context: TemplateContext
): string {
  const config = WHATSAPP_TEMPLATES[templateType];
  let message = config.template;

  // Replace variables
  message = message.replace(/\[Nome\]/g, context.clientName || 'Cliente');
  message = message.replace(/\[NomeEmpresa\]/g, context.companyName || 'nossa confeitaria');
  message = message.replace(/\[Pedido\]/g, formatOrderNumber(context.orderNumber));
  message = message.replace(/\[Valor\]/g, formatCurrency(context.totalAmount || 0));
  message = message.replace(/\[ValorSinal\]/g, formatCurrency(context.depositAmount || (context.totalAmount || 0) / 2));
  message = message.replace(/\[ValorRestante\]/g, formatCurrency(context.remainingAmount || (context.totalAmount || 0) / 2));
  message = message.replace(/\[DataEntrega\]/g, formatDeliveryDate(context.deliveryDate, context.deliveryTime));

  return message;
}

/**
 * Get available templates for a given order context
 */
export function getAvailableTemplates(context: {
  depositPaid?: boolean;
  status?: string;
}): TemplateType[] {
  const templates: TemplateType[] = ['quote'];

  // Add deposit collection if deposit not paid
  if (!context.depositPaid && context.status !== 'delivered' && context.status !== 'cancelled') {
    templates.push('deposit_collection');
  }

  // Add order ready if in ready status
  if (context.status === 'ready') {
    templates.push('order_ready');
  }

  return templates;
}
