

## Plano: Expandir Área de Toque dos Filtros para Toda a Barra

### Problema Identificado

Atualmente, a estrutura é:
```
┌─ TabsList (p-1.5 = 6px padding) ────────────────────┐
│  ┌─ TabsTrigger ───┐  ┌─ TabsTrigger ───┐          │
│  │   min-h-44px    │  │   min-h-44px    │  ...     │ ← Área clicável
│  └─────────────────┘  └─────────────────┘          │
└────────────────────────────────────────────────────┘ ← Não clicável
```

O padding `p-1.5` da `TabsList` cria uma borda de **6px** ao redor dos triggers que **não responde a toques**. Para usuários com dedos maiores, isso causa frustração ao tocar nas bordas.

### Solução

1. **Remover padding da TabsList** e mover para padding interno dos triggers
2. **Aumentar altura mínima dos triggers** para 48px (Apple HIG recomenda 44px mínimo, 48px é mais confortável)
3. **Adicionar items-stretch** para que triggers ocupem toda a altura disponível

### Alterações Técnicas

**Arquivo**: `src/components/orders/OrdersList.tsx`

#### Linha 93 - Ajustar TabsList
```tsx
// ANTES
<TabsList className="w-full h-auto p-1.5 bg-muted/50 rounded-xl overflow-x-auto flex justify-start gap-1.5 scrollbar-hide scroll-smooth snap-x snap-mandatory px-6">

// DEPOIS  
<TabsList className="w-full h-auto p-0 bg-muted/50 rounded-xl overflow-x-auto flex items-stretch justify-start gap-0 scrollbar-hide scroll-smooth snap-x snap-mandatory">
```

#### Linhas 98-102 - Ajustar TabsTrigger
```tsx
// ANTES
className={cn(
  "flex-shrink-0 px-4 py-2.5 rounded-lg text-sm font-medium transition-all snap-start min-h-[44px]",
  "data-[state=active]:bg-card data-[state=active]:border-2 data-[state=active]:border-primary",
  "data-[state=active]:text-primary data-[state=active]:shadow-soft"
)}

// DEPOIS
className={cn(
  "flex-shrink-0 px-5 py-3 first:pl-6 last:pr-6 first:rounded-l-xl last:rounded-r-xl text-sm font-medium transition-all snap-start min-h-[48px]",
  "data-[state=active]:bg-card data-[state=active]:shadow-soft",
  "data-[state=active]:text-primary"
)}
```

### Resultado Visual

```
Antes:
┌────────────────────────────────────────────────────┐
│ ┌──────────┐ ┌──────────┐ ┌──────────┐            │ ← Gaps não clicáveis
│ │  Todos   │ │ Orçamento│ │Aguardando│            │
│ └──────────┘ └──────────┘ └──────────┘            │
└────────────────────────────────────────────────────┘

Depois:
┌────────────────────────────────────────────────────┐
│    Todos   │ Orçamento  │ Aguardando │   ...      │ ← Toda área clicável
└────────────────────────────────────────────────────┘
```

### Benefícios

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Altura touch** | 44px | 48px |
| **Área clicável** | Só o trigger | Toda a altura da barra |
| **Gaps entre triggers** | 6px não clicáveis | Sem gaps mortos |
| **Padding nas bordas** | No container | Integrado aos triggers extremos |

