

## Plano: Adicionar Borda Escura ao Popover WhatsApp

### Objetivo

Adicionar uma borda verde escura (`emerald-700`) ao popover de templates WhatsApp para melhorar o contraste visual com o conteúdo do painel principal atrás.

### Alteração

**Arquivo**: `src/components/orders/WhatsAppTemplatePreview.tsx`

**Linha 97** - Adicionar borda emerald-700 ao PopoverContent:

```typescript
// Antes
<PopoverContent align="end" className="w-[calc(100vw-2rem)] sm:w-96 p-0 shadow-3xl" sideOffset={8}>

// Depois
<PopoverContent align="end" className="w-[calc(100vw-2rem)] sm:w-96 p-0 shadow-3xl border-emerald-700" sideOffset={8}>
```

### Resultado Visual

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Borda** | Padrão (cinza claro) | Verde escuro (`border-emerald-700`) |
| **Contraste** | Baixo com conteúdo atrás | Alto, popover se destaca claramente |

A cor `emerald-700` (#047857) é escura o suficiente para criar separação visual clara, mas ainda harmoniza com o header verde suave do popover.

