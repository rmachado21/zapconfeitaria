
## Plano: Adicionar Sombra e Header Verde ao Popover de WhatsApp

### Objetivo

Melhorar o contraste visual entre o popover de templates WhatsApp e o painel principal, adicionando:
1. **Sombra pronunciada** para criar elevação
2. **Header verde suave** com título em verde escuro para identidade visual

### Alterações

**Arquivo**: `src/components/orders/WhatsAppTemplatePreview.tsx`

#### 1. Adicionar sombra pronunciada ao PopoverContent (linha 91)

```typescript
// Antes
<PopoverContent align="end" className="w-[calc(100vw-2rem)] sm:w-96 p-0" sideOffset={8}>

// Depois
<PopoverContent align="end" className="w-[calc(100vw-2rem)] sm:w-96 p-0 shadow-xl" sideOffset={8}>
```

#### 2. Adicionar header verde com título (linhas 92-95)

```typescript
// Antes
<div className="flex flex-col">
  {/* Template Selection */}
  <div className="p-4 border-b">
    <p className="text-sm font-medium mb-3">Escolha o modelo:</p>

// Depois
<div className="flex flex-col">
  {/* Header */}
  <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border-b border-emerald-100 rounded-t-md">
    <WhatsAppIcon className="h-5 w-5 text-emerald-600" />
    <span className="font-semibold text-emerald-700">Mensagens WhatsApp</span>
  </div>
  
  {/* Template Selection */}
  <div className="p-4 border-b">
    <p className="text-sm font-medium mb-3">Escolha o modelo:</p>
```

### Resultado Visual

| Elemento | Antes | Depois |
|----------|-------|--------|
| **Sombra** | Padrão (`shadow-md`) | Pronunciada (`shadow-xl`) |
| **Header** | Nenhum | Fundo verde suave (`bg-emerald-50`) |
| **Ícone WhatsApp** | Não visível no header | Verde escuro (`text-emerald-600`) |
| **Título** | "Escolha o modelo:" | "Mensagens WhatsApp" em verde escuro |
| **Borda header** | Nenhuma | Verde suave (`border-emerald-100`) |

### Paleta de Cores Escolhida

- **Fundo header**: `bg-emerald-50` (verde muito claro, quase branco)
- **Borda header**: `border-emerald-100` (verde suave)
- **Ícone**: `text-emerald-600` (verde médio-escuro)
- **Título**: `text-emerald-700` (verde escuro para legibilidade)

Esta paleta mantém a identidade WhatsApp mas com tons suaves que não competem com o botão de ação principal.
