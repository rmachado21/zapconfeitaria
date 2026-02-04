import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export type TemplateType =
  | "quote"
  | "birthday"
  | "deposit_collection"
  | "order_confirmed"
  | "payment_thanks"
  | "pickup_ready"
  | "out_for_delivery"
  | "review_request";

export interface TemplateConfig {
  id: TemplateType;
  name: string;
  template: string;
  description: string;
}

export const WHATSAPP_TEMPLATES: Record<TemplateType, TemplateConfig> = {
  quote: {
    id: "quote",
    name: "Enviar Orçamento",
    template: `Olá [Nome]! 😊

Segue o orçamento do pedido [Pedido] para entrega em [DataEntrega].

Valor total: [Valor]

Qualquer dúvida, estou à disposição!`,
    description: "Enviar orçamento com valor e data",
  },
  birthday: {
    id: "birthday",
    name: "Feliz Aniversário",
    template: `Olá [Nome]! 🎂

A [NomeEmpresa] deseja um Feliz Aniversário! Que seu dia seja tão doce quanto nossas delícias!

Um grande abraço! 🎉`,
    description: "Parabenizar cliente pelo aniversário",
  },
  deposit_collection: {
    id: "deposit_collection",
    name: "Cobrar Sinal",
    template: `Olá [Nome]! 👋

Estou passando para lembrar sobre o sinal de 50% do pedido [Pedido], no valor de [ValorSinal].

Assim que confirmado, inicio a produção para entrega em [DataEntrega].

Obrigada! 💕`,
    description: "Cobrar sinal de 50% pendente",
  },
  order_confirmed: {
    id: "order_confirmed",
    name: "Confirmar Pgto Sinal",
    template: `Olá [Nome]! ✨

Seu pedido [Pedido] está confirmado! 🎉
Obrigada pelo pagamento do sinal.
📅 Entrega: [DataEntrega]
[InfoPagamento]

Vamos preparar tudo com carinho! Qualquer dúvida, estou à disposição.

Obrigada pela preferência! 💕`,
    description: "Confirmar pedido após pagamento do sinal",
  },
  payment_thanks: {
    id: "payment_thanks",
    name: "Agradecer Pgto 100%",
    template: `Olá [Nome]! 💚

Muito obrigada pelo pagamento do pedido [Pedido]! ✅

Valor recebido: [Valor]

Seu pedido está confirmado para [DataEntrega]. Qualquer novidade, aviso por aqui!

Obrigada pela confiança! 🎂`,
    description: "Agradecer pelo pagamento completo recebido",
  },
  pickup_ready: {
    id: "pickup_ready",
    name: "Pronto para Retirada",
    template: `Olá [Nome]! ✨

Seu pedido [Pedido] está pronto para retirada!

📍 Retirada: [DataEntrega]
[InfoPagamento]

Aguardamos você! 🎂`,
    description: "Avisar que o pedido está pronto para retirada",
  },
  out_for_delivery: {
    id: "out_for_delivery",
    name: "Saiu para Entrega",
    template: `Olá [Nome]! 🚗

Seu pedido [Pedido] saiu para entrega!

📍 Endereço: [EnderecoEntrega]
🕐 Previsão: [DataEntrega]
[InfoPagamento]

Em breve estaremos aí! 🎂`,
    description: "Avisar que o pedido saiu para entrega",
  },
  review_request: {
    id: "review_request",
    name: "Pedir Avaliação",
    template: `Olá [Nome]! 😊

Muito obrigada por escolher a [NomeEmpresa]! 💕

Ficamos muito felizes em fazer parte do seu momento especial. Se você gostou do nosso trabalho, ficaríamos muito gratos se pudesse deixar uma avaliação no Google:

👉 [LinkAvaliacao]

Sua opinião é muito importante para nós! ⭐

Obrigada pela confiança e até a próxima! 🎂`,
    description: "Agradecer e pedir avaliação no Google após entrega",
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
  deliveryAddress?: string | null;
  depositPaid?: boolean;
  fullPaymentReceived?: boolean;
  googleReviewUrl?: string | null;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDeliveryDate(dateString: string | null, timeString?: string | null): string {
  if (!dateString) return "a definir";
  try {
    const formatted = format(parseISO(dateString), "dd 'de' MMMM", { locale: ptBR });
    if (timeString) {
      return `${formatted} às ${timeString.slice(0, 5)}`;
    }
    return formatted;
  } catch {
    return "a definir";
  }
}

function formatOrderNumber(orderNumber: number | null | undefined): string {
  if (!orderNumber) return "";
  return `#${String(orderNumber).padStart(4, "0")}`;
}

function getFirstName(fullName: string | undefined): string {
  if (!fullName) return "Cliente";
  return fullName.split(" ")[0];
}

/**
 * Process a template by replacing variables with actual values
 */
export function processTemplate(templateType: TemplateType, context: TemplateContext): string {
  const config = WHATSAPP_TEMPLATES[templateType];
  let message = config.template;

  // Replace variables - use only first name for a friendlier tone
  message = message.replace(/\[Nome\]/g, getFirstName(context.clientName));
  message = message.replace(/\[NomeEmpresa\]/g, context.companyName || "nossa confeitaria");
  message = message.replace(/\[Pedido\]/g, formatOrderNumber(context.orderNumber));
  message = message.replace(/\[Valor\]/g, formatCurrency(context.totalAmount || 0));
  message = message.replace(/\[ValorSinal\]/g, formatCurrency(context.depositAmount || (context.totalAmount || 0) / 2));
  message = message.replace(
    /\[ValorRestante\]/g,
    formatCurrency(context.remainingAmount || (context.totalAmount || 0) / 2),
  );
  message = message.replace(/\[DataEntrega\]/g, formatDeliveryDate(context.deliveryDate, context.deliveryTime));
  message = message.replace(/\[EnderecoEntrega\]/g, context.deliveryAddress || "endereço combinado");
  message = message.replace(/\[LinkAvaliacao\]/g, context.googleReviewUrl || "https://g.page/r/CQjuiJbRcD4-EAE/review");

  // Smart payment info replacement
  if (context.fullPaymentReceived) {
    message = message.replace(/\[InfoPagamento\]/g, "✅ Pagamento confirmado!");
  } else {
    const remaining = context.remainingAmount || (context.totalAmount || 0) / 2;
    message = message.replace(/\[InfoPagamento\]/g, `💰 Valor restante: ${formatCurrency(remaining)}`);
  }

  return message;
}

/**
 * Get available templates for a given order context
 */
export function getAvailableTemplates(context: {
  depositPaid?: boolean;
  status?: string;
  fullPaymentReceived?: boolean;
}): TemplateType[] {
  const templates: TemplateType[] = [];

  // Add quote only for orders not yet ready, delivered or cancelled
  if (context.status !== "ready" && context.status !== "delivered" && context.status !== "cancelled") {
    templates.push("quote");
  }

  // Add deposit collection only if deposit not paid AND full payment not received
  if (
    !context.depositPaid &&
    !context.fullPaymentReceived &&
    context.status !== "delivered" &&
    context.status !== "cancelled"
  ) {
    templates.push("deposit_collection");
  }

  // Add order confirmed if deposit paid or full payment received (order is confirmed)
  if (
    (context.depositPaid || context.fullPaymentReceived) &&
    context.status !== "delivered" &&
    context.status !== "cancelled"
  ) {
    templates.push("order_confirmed");
  }

  // Add payment thanks if full payment was received
  if (context.fullPaymentReceived && context.status !== "delivered" && context.status !== "cancelled") {
    templates.push("payment_thanks");
  }

  // Add pickup/delivery options for in_production and ready status
  if (context.status === "in_production" || context.status === "ready") {
    templates.push("pickup_ready");
    templates.push("out_for_delivery");
  }

  // Add review request for delivered orders
  if (context.status === "delivered") {
    templates.push("review_request");
  }

  return templates;
}
