

## Substituir Evolução Financeira por Top 5 Produtos Mais Vendidos

### Justificativa da Escolha

Entre as duas opções sugeridas ("Top 5 produtos mais vendidos" ou "Previsão de recebimentos"), optei pelo **Top 5 Produtos** porque:

1. **Dados já disponíveis** - Temos `order_items` com `product_name` e `quantity`, e `orders` com `delivery_date` e `status`
2. **Acionável para o negócio** - Ajuda a confeiteira a entender quais produtos priorizar, estocar ingredientes e precificar
3. **Alinhado com filtros existentes** - Pode respeitar o período/mês selecionado na página
4. **Previsão de recebimentos** exigiria lógica mais complexa de pagamentos pendentes e estimativas

### Implementação

#### 1. Criar Componente `TopProductsChart`

Novo arquivo: `src/components/finances/TopProductsChart.tsx`

**Props:**
- `orders`: lista de pedidos com `order_items`
- `selectedMonth`: mês selecionado (opcional)
- `period`: período do filtro

**Lógica:**
```text
1. Filtrar pedidos por período (mesma lógica do estimatedProfit)
2. Considerar apenas pedidos "delivered" (entregues = confirmados)
3. Agrupar order_items por product_name
4. Somar quantity por produto
5. Ordenar por quantidade decrescente
6. Pegar top 5
```

**Visualização:**
- Gráfico de barras horizontal (Recharts BarChart)
- Mostrar nome do produto e quantidade vendida
- Badge com posição (#1, #2, etc.)
- Cores em gradiente do primário ao muted

#### 2. Layout do Componente

```text
+--------------------------------------------------+
|  Top 5 Produtos Mais Vendidos          [período] |
+--------------------------------------------------+
|                                                  |
|  #1  Bolo de Chocolate        ████████████  47   |
|  #2  Cupcake Morango          ████████      32   |
|  #3  Brownie                  ██████        24   |
|  #4  Torta de Limão           ████          18   |
|  #5  Brigadeiro (cento)       ███           12   |
|                                                  |
|  [ícone] Baseado em 23 pedidos entregues         |
+--------------------------------------------------+
```

#### 3. Atualizar Página Finances.tsx

**Remover:**
- Import do `FinanceChart`
- Uso do `<FinanceChart />` na section de charts

**Adicionar:**
- Import do `TopProductsChart`
- Passar `orders`, `selectedMonth` e `period` como props

**Grid atualizado:**
```tsx
<section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
  <TopProductsChart 
    orders={orders} 
    selectedMonth={selectedMonth} 
    period={period} 
  />
  <ExpenseCategoryChart transactions={filteredTransactions} />
</section>
```

#### 4. Detalhes Técnicos

**Estrutura de dados:**
```typescript
interface TopProduct {
  productName: string;
  quantity: number;
  revenue: number; // unit_price * quantity
  orderCount: number; // em quantos pedidos apareceu
}
```

**Lógica de filtragem (reutilizar do estimatedProfit):**
- Se `selectedMonth` definido: filtrar por mês específico
- Senão: usar `period` (week/month/year/all)
- Apenas pedidos com `status === 'delivered'`
- Filtrar por `delivery_date`

**Estado vazio:**
- Mostrar ilustração + texto "Nenhum pedido entregue no período"
- Botão para ajustar período

### Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `src/components/finances/TopProductsChart.tsx` | CRIAR |
| `src/pages/Finances.tsx` | Substituir FinanceChart por TopProductsChart |
| `src/components/finances/FinanceChart.tsx` | REMOVER (opcional, pode manter para uso futuro) |

### Benefícios

1. **Insight acionável** - Usuário sabe quais produtos focar
2. **Alinhado ao negócio** - Confeitarias precisam entender demanda
3. **Consistência visual** - Usa mesmos padrões de cards/charts existentes
4. **Performance** - Dados já carregados via `useOrders()`
5. **Responsivo** - Barras horizontais funcionam bem em mobile

