

## Plano: Remover Template "Enviar Orçamento" de Pedidos Entregues

### Situação Atual

O template "Enviar Orçamento" (`quote`) é sempre incluído na lista de templates disponíveis:

```typescript
// Linha 215
const templates: TemplateType[] = ["quote"];
```

Isso faz com que apareça para **todos** os pedidos, inclusive os que já foram entregues - onde não faz sentido enviar orçamento.

### Alteração Proposta

**Arquivo**: `src/lib/whatsappTemplates.ts`

**Linhas 214-215** - Adicionar condição para excluir pedidos entregues e cancelados:

```typescript
// Antes
export function getAvailableTemplates(context: {
  depositPaid?: boolean;
  status?: string;
  fullPaymentReceived?: boolean;
}): TemplateType[] {
  const templates: TemplateType[] = ["quote"];

// Depois
export function getAvailableTemplates(context: {
  depositPaid?: boolean;
  status?: string;
  fullPaymentReceived?: boolean;
}): TemplateType[] {
  const templates: TemplateType[] = [];
  
  // Add quote only for orders not yet delivered or cancelled
  if (context.status !== "delivered" && context.status !== "cancelled") {
    templates.push("quote");
  }
```

### Resultado

| Status do Pedido | Template "Enviar Orçamento" |
|------------------|----------------------------|
| Orçamento | ✅ Disponível |
| Aguardando Sinal | ✅ Disponível |
| Em Produção | ✅ Disponível |
| Pronto | ✅ Disponível |
| **Entregue** | ❌ **Removido** |
| Cancelado | ❌ Removido |

### Templates para Pedidos Entregues

Após a alteração, pedidos entregues terão apenas:
- **Pedir Avaliação** (review_request) - único template relevante para pós-entrega

