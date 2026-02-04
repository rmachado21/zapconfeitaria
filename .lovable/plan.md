

## Plano: Botões PDF e WhatsApp Lado a Lado

### Alteração

Modificar o container dos botões para sempre usar `flex-row`, economizando espaço vertical no painel de detalhes.

**Arquivo**: `src/components/orders/OrderDetailDialog.tsx`

#### Linha 348 - Ajustar container

```tsx
// ANTES
<div className="flex flex-col sm:flex-row gap-2">

// DEPOIS
<div className="flex flex-row gap-2">
```

### Resultado Visual

```
Antes (mobile):
┌─────────────────────────────────┐
│   📄 Orçamento em PDF           │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│   💬 WhatsApp              ▾    │
└─────────────────────────────────┘

Depois (mobile):
┌──────────────────┐ ┌──────────────────┐
│ 📄 Orçamento PDF │ │ 💬 WhatsApp   ▾  │
└──────────────────┘ └──────────────────┘
```

### Benefícios

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Espaço vertical** | 2 linhas (~88px) | 1 linha (~44px) |
| **Área de toque** | Mantida | Mantida (flex-1 divide igualmente) |
| **Consistência** | Diferente em mobile/desktop | Igual em todas as telas |

### Nota

Como ambos os botões já usam `flex-1`, eles dividirão o espaço igualmente. A altura `h-11` (44px) é mantida garantindo touch targets adequados.

