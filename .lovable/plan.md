

## Novo Card: Quantidade Vendida por Produto

### Objetivo

Criar um card complementar ao "Top 5 Produtos" que mostra a **quantidade vendida** de cada produto no período, permitindo ao usuário ter uma visão de uso de matéria-prima. O card exibe 5 produtos inicialmente e permite expandir para ver todos.

### Visual Proposto

```text
┌─────────────────────────────────────────┐
│ 📦 Quantidade Vendida                    │
├─────────────────────────────────────────┤
│ Brigadeiro           ████████  250 un   │
│ Bolo de Chocolate    ██████    12 Kg    │
│ Cupcake Morango      █████     48 un    │
│ Bem-casado           ████      3 centos │
│ Bolo de Cenoura      ███       8 Kg     │
├─────────────────────────────────────────┤
│         ▼ Ver todos (12 produtos)       │
└─────────────────────────────────────────┘
```

### Comportamento

1. **Estado inicial**: Mostra top 5 produtos ordenados por quantidade
2. **Expansível**: Botão "Ver todos (X produtos)" abre lista completa
3. **Unidades corretas**: Exibe Kg, Un, ou Cento conforme o tipo do produto
4. **Período sincronizado**: Respeita o filtro de período/mês selecionado

---

## Detalhes Técnicos

### Novo Arquivo

**`src/components/finances/ProductQuantityChart.tsx`**

#### Interface e Props
```typescript
interface ProductQuantityChartProps {
  orders: Order[];
  selectedMonth: { month: number; year: number } | null;
  period: 'week' | 'month' | 'year' | 'all';
}

interface ProductQuantity {
  productName: string;
  quantity: number;
  unitType: string;
}
```

#### Lógica Principal

1. **Reutilizar filtro de período** do TopProductsChart (mesmo padrão de filtragem por `delivery_date`)

2. **Agregar quantidades por produto**:
   - Iterar pelos pedidos entregues no período
   - Somar `quantity` por `product_name`
   - Capturar `unit_type` de cada item

3. **Ordenar por quantidade** (decrescente)

4. **Estado de expansão**:
   - `expanded: boolean` controla se mostra todos ou apenas 5
   - Usar Collapsible para animação suave

#### Formatação de Unidades

```typescript
const formatQuantity = (qty: number, unitType: string) => {
  if (unitType === 'kg') {
    return `${qty.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Kg`;
  }
  if (unitType === 'cento') {
    return qty === 1 ? '1 cento' : `${qty} centos`;
  }
  return `${qty} un`;
};
```

#### Componentes Utilizados

- `Card`, `CardHeader`, `CardTitle`, `CardContent` (UI)
- `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent` (expansão)
- `Button` (trigger de expansão)
- `Package`, `ChevronDown` (ícones do lucide-react)
- `useIsMobile()` hook (responsividade)

---

### Modificação em Finances.tsx

**Linha 17** - Adicionar import:
```typescript
import { ProductQuantityChart } from '@/components/finances/ProductQuantityChart';
```

**Linhas 513-521** - Atualizar grid de charts para 3 colunas no desktop:
```typescript
{/* Charts Grid */}
<section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
  <ExpenseCategoryChart transactions={filteredTransactions} />
</section>
```

---

### Layout Responsivo

| Dispositivo | Comportamento |
|------------|---------------|
| Mobile | Lista vertical compacta, barras de progresso horizontais |
| Desktop | Mesma lista, ocupa 1/3 do grid |

### Estado Vazio

Quando não há pedidos entregues no período:
```text
📦 Nenhum pedido entregue no período
   As quantidades vendidas aparecerão aqui
```

---

## Resultado Esperado

O usuário terá:
- **Top 5 Produtos** → Demanda por frequência de pedidos
- **Quantidade Vendida** → Volume total para planejamento de matéria-prima
- **Despesas por Categoria** → Visão de gastos

Três cards complementares que dão uma visão completa do negócio.

