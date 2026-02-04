

## Plano: Melhorar UX dos Filtros de Status Mobile

### Problemas Identificados

| Problema | Impacto |
|----------|---------|
| **Sem indicador visual de rolagem** | Usuário não percebe que há mais opções à direita |
| **Scroll preso nas bordas** | Difícil alcançar os filtros nas extremidades |
| **Touch targets pequenos** | Botões com `px-3 py-2` são pequenos para toque |
| **Sem scroll snap** | Rolagem não para em posições naturais |

### Sugestões de Melhoria

#### 1. Adicionar Indicador de Fade nas Bordas
Efeito de gradiente sutil nas extremidades sinalizando conteúdo oculto:

```text
┌─────────────────────────────────────┐
│ [Todos] [Orçam] [Aguard...  ░░░▓▓▓▓ │ ← Fade indica mais conteúdo
└─────────────────────────────────────┘
```

#### 2. Aumentar Área de Toque
Aumentar padding dos botões de `px-3 py-2` para `px-4 py-2.5` (mínimo 44px de altura recomendado pelo iOS HIG).

#### 3. Adicionar Scroll Snap
Propriedade CSS `scroll-snap-type: x mandatory` para que a rolagem pare em posições naturais entre os filtros.

#### 4. Adicionar Padding Horizontal no Container
Padding extra no início/fim da lista para facilitar alcance dos filtros extremos.

#### 5. Esconder Scrollbar
Manter funcionalidade mas ocultar a barra visual que polui o design.

### Alterações Técnicas

**Arquivo**: `src/components/orders/OrdersList.tsx`

#### Container com Fade Indicators (linhas 88-106)

```tsx
// Envolver TabsList em container com máscaras de gradiente
<div className="relative">
  {/* Fade esquerdo */}
  <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
  
  <TabsList className="w-full h-auto p-1.5 bg-muted/50 rounded-xl overflow-x-auto flex justify-start gap-1.5 scrollbar-hide scroll-smooth snap-x snap-mandatory px-6">
    {STATUS_TABS.map((tab) => (
      <TabsTrigger
        key={tab.value}
        value={tab.value}
        className={cn(
          "flex-shrink-0 px-4 py-2.5 rounded-lg text-sm font-medium transition-all snap-start",
          "data-[state=active]:bg-card data-[state=active]:border-2 data-[state=active]:border-primary",
          "data-[state=active]:text-primary data-[state=active]:shadow-soft",
          "min-h-[44px]" // iOS HIG touch target
        )}
      >
        {tab.label}
        <span className="ml-1.5 text-xs opacity-70">
          ({getFilteredOrders(tab.value).length})
        </span>
      </TabsTrigger>
    ))}
  </TabsList>
  
  {/* Fade direito */}
  <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
</div>
```

#### CSS para Esconder Scrollbar

Adicionar ao `src/index.css`:

```css
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
```

### Resultado Visual Esperado

```text
Antes:
┌──────────────────────────────────────┐
│[Todos(86)][Orçamento(10)][Aguardando│ ← Corte abrupto
└──────────────────────────────────────┘

Depois:
┌──────────────────────────────────────┐
│ [Todos (86)] [Orçamento (10)] ░░░▓▓▓ │ ← Fade suave + snap
└──────────────────────────────────────┘
```

### Benefícios

- Usuário percebe imediatamente que há mais opções
- Touch targets maiores reduzem erros de toque
- Scroll snap melhora sensação de controle
- Visual mais limpo sem scrollbar visível

