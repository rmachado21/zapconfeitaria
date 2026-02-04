

## Plano: Simplificar Lógica com Lista de Status Permitidos

### Situação Atual

A lógica atual usa **múltiplas negações**, o que dificulta a leitura:

```typescript
// Linha 218 - difícil de ler
if (context.status !== "in_production" && context.status !== "ready" && context.status !== "delivered" && context.status !== "cancelled") {
  templates.push("quote");
}
```

### Solução Proposta

Usar uma lista explícita de **status permitidos** com `includes()`:

```typescript
// Muito mais claro e legível
if (["quote", "awaiting_deposit"].includes(context.status || "")) {
  templates.push("quote");
}
```

### Alteração

**Arquivo**: `src/lib/whatsappTemplates.ts`

**Linha 217-220** - Substituir condição negativa por lista positiva:

```typescript
// Antes
// Add quote only for orders in quote or awaiting_deposit status
if (context.status !== "in_production" && context.status !== "ready" && context.status !== "delivered" && context.status !== "cancelled") {
  templates.push("quote");
}

// Depois
// Add quote only for orders in quote or awaiting_deposit status
if (["quote", "awaiting_deposit"].includes(context.status || "")) {
  templates.push("quote");
}
```

### Benefícios

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Legibilidade** | 4 negações encadeadas | Lista explícita de 2 status |
| **Manutenção** | Precisa lembrar de adicionar novos status | Status permitidos são claros |
| **Intenção** | "Não mostrar para X, Y, Z, W" | "Mostrar apenas para A, B" |
| **Linhas** | Condição longa em 1 linha | Código conciso e claro |

### Mapeamento de Status

Para referência, os status permitidos para "Enviar Orçamento":

| Status | Valor Interno | Template "Enviar Orçamento" |
|--------|---------------|----------------------------|
| Orçamento | `quote` | ✅ Disponível |
| Aguardando Sinal | `awaiting_deposit` | ✅ Disponível |
| Em Produção | `in_production` | ❌ Não disponível |
| Pronto | `ready` | ❌ Não disponível |
| Entregue | `delivered` | ❌ Não disponível |
| Cancelado | `cancelled` | ❌ Não disponível |

