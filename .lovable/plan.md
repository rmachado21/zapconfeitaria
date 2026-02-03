

## Novo Card: Receitas por Produto

### Objetivo

Criar um card no estilo de "Despesas por Categoria" (donut chart) que mostra a receita gerada por cada produto no período, permitindo ao usuário identificar quais produtos geram mais faturamento.

### Visual Proposto

```text
┌─────────────────────────────────────────┐
│ 💰 Receitas por Produto                 │
├─────────────────────────────────────────┤
│                                         │
│            ┌────────┐                   │
│           /          \                  │
│          |   DONUT    |                 │
│           \  CHART   /                  │
│            └────────┘                   │
│                                         │
│  ● Bolo Chocolate 45%  ● Brigadeiro 28% │
│  ● Cupcake 15%  ● Bem-casado 12%        │
│                                         │
│           Total de Receitas             │
│             R$ 3.450,00                 │
└─────────────────────────────────────────┘
```

### Comportamento

1. **Donut Chart**: Mesmo estilo visual do "Despesas por Categoria"
2. **Legenda com porcentagem**: Mostra produto + % da receita total
3. **Tooltip**: Exibe valor em R$ e porcentagem ao passar o mouse
4. **Total no rodapé**: Mostra soma total de receitas por produtos
5. **Período sincronizado**: Respeita o filtro de período/mês selecionado
6. **Top 6 produtos**: Agrupa os demais em "Outros" para não poluir o gráfico

---

## Detalhes Técnicos

### Novo Arquivo

**`src/components/finances/ProductRevenueChart.tsx`**

#### Estrutura do Componente

```typescript
interface ProductRevenueChartProps {
  orders: Order[];
  selectedMonth: { month: number; year: number } | null;
  period: 'week' | 'month' | 'year' | 'all';
}

interface ProductRevenue {
  name: string;
  value: number;
}
```

#### Lógica Principal

1. **Reutilizar filtro de período** (mesmo padrão do TopProductsChart/ProductQuantityChart)

2. **Agregar receita por produto**:
   - Filtrar pedidos entregues no período
   - Somar `unit_price * quantity` por `product_name`
   - Excluir itens marcados como `is_gift`

3. **Ordenar por valor** (decrescente) e limitar a 6 produtos
   - Se houver mais de 6 produtos, agrupar restantes em "Outros"

4. **Calcular porcentagens** para legenda e tooltip

#### Componentes e Dependências

- `PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip` (recharts)
- `Card, CardContent, CardHeader, CardTitle` (UI)
- `DollarSign` ou `TrendingUp` (lucide-react)

#### Paleta de Cores

Usar cores verdes/emerald para diferenciar de despesas (tons quentes):
```typescript
const COLORS = [
  'hsl(155, 60%, 40%)',   // Emerald
  'hsl(165, 55%, 45%)',   // Teal
  'hsl(145, 50%, 50%)',   // Green
  'hsl(175, 45%, 40%)',   // Cyan-green
  'hsl(135, 40%, 55%)',   // Light green
  'hsl(185, 35%, 45%)',   // Blue-green
];
```

#### CustomTooltip

```typescript
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const percentage = totalRevenue > 0 
      ? ((data.value / totalRevenue) * 100).toFixed(1) 
      : 0;
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium text-sm">{data.name}</p>
        <p className="text-sm text-muted-foreground">
          {formatCurrency(data.value)} ({percentage}%)
        </p>
      </div>
    );
  }
  return null;
};
```

#### CustomLegend

Mesmo padrão de "Despesas por Categoria" com badges arredondados:
```typescript
<div className="flex flex-wrap gap-2 justify-center mt-2">
  {payload?.map((entry, index) => (
    <div className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-muted/50">
      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
      <span>{entry.value} <span className="font-medium">{percentage}%</span></span>
    </div>
  ))}
</div>
```

#### Estado Vazio

```typescript
if (chartData.length === 0) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          Receitas por Produto
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
          Nenhuma receita registrada
        </div>
      </CardContent>
    </Card>
  );
}
```

---

### Modificação em Finances.tsx

**Adicionar import:**
```typescript
import { ProductRevenueChart } from '@/components/finances/ProductRevenueChart';
```

**Atualizar grid de charts (linhas 514-527):**

Expandir para 4 cards em grid responsivo:
```typescript
{/* Charts Grid */}
<section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <TopProductsChart 
    orders={orders} 
    selectedMonth={selectedMonth} 
    period={period} 
  />
  <ProductQuantityChart 
    orders={orders} 
    selectedMonth={selectedMonth} 
    period={period} 
  />
  <ProductRevenueChart 
    orders={orders} 
    selectedMonth={selectedMonth} 
    period={period} 
  />
  <ExpenseCategoryChart transactions={filteredTransactions} />
</section>
```

---

### Layout Responsivo

| Dispositivo | Comportamento |
|------------|---------------|
| Mobile (< 768px) | 1 card por linha, empilhados verticalmente |
| Tablet (768px - 1024px) | 2 cards por linha |
| Desktop (> 1024px) | 4 cards em linha única |

---

### Resultado Final

O usuário terá 4 cards complementares:
- **Top 5 Produtos** → Frequência de pedidos (demanda)
- **Quantidade Vendida** → Volume para planejamento de matéria-prima
- **Receitas por Produto** → Quais produtos geram mais faturamento
- **Despesas por Categoria** → Distribuição de gastos

Visão completa do negócio: demanda, produção, receita e despesas.

