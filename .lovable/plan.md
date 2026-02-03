

## Plano: Unificar Layout do Top 5 Produtos com Quantidade Vendida

### Situação Atual

| Card | Mobile | Desktop |
|------|--------|---------|
| **Top 5 Produtos** | Divs simples | Recharts (BarChart) |
| **Quantidade Vendida** | Divs simples | Divs simples |

Essa diferença gera inconsistência visual: no desktop, "Top 5 Produtos" tem um gráfico horizontal com eixos enquanto "Quantidade Vendida" usa barras de progresso simples.

### Solução

Simplificar o **TopProductsChart** para usar o mesmo layout de divs do **ProductQuantityChart**, removendo a dependência de Recharts e a lógica condicional `isMobile`.

### Alterações em `src/components/finances/TopProductsChart.tsx`

1. **Remover imports desnecessários**:
   - Remover `BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, LabelList` de recharts
   - Remover `useIsMobile` hook

2. **Simplificar estrutura de renderização**:
   - Remover condicional `isMobile ? ... : ...`
   - Usar estrutura única baseada em divs para mobile e desktop
   - Manter o indicador de ranking (`#1`, `#2`, etc.) como diferencial deste card

3. **Remover código não utilizado**:
   - Remover função `renderOrderCountLabel`
   - Remover função `formatQuantity` (não usada)

### Estrutura Final (igual ao ProductQuantityChart)

```text
┌─────────────────────────────────────┐
│ 📈 Top 5 Produtos                   │
├─────────────────────────────────────┤
│ #1  Bolo de Chocolate    12 pedidos │
│ ████████████████████████████████░░░ │
│                                     │
│ #2  Brigadeiro           8 pedidos  │
│ █████████████████████░░░░░░░░░░░░░░ │
│                                     │
│ #3  Torta de Limão       5 pedidos  │
│ █████████████░░░░░░░░░░░░░░░░░░░░░░ │
│                                     │
│ 📦 Baseado em 25 pedidos entregues  │
└─────────────────────────────────────┘
```

### Benefícios

1. **Consistência visual**: Ambos os cards terão o mesmo padrão de layout
2. **Código mais simples**: Remove dependência de Recharts para este componente
3. **Performance**: Menos overhead de renderização sem biblioteca de gráficos
4. **Manutenibilidade**: Um único layout para ajustar em vez de dois

### Arquivo a Modificar
- `src/components/finances/TopProductsChart.tsx`

