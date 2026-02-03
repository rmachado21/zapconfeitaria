

## Adicionar Número de Pedidos como Informação Principal

### Alteração Proposta

Manter a lógica de ranking por quantidade vendida, mas exibir o número de pedidos como métrica principal no display.

### Mudanças Visuais

**Antes:**
```text
#1  Bolo de Chocolate     ████████████  47
#2  Cupcake Morango       ████████      32
```

**Depois:**
```text
#1  Bolo de Chocolate     ████████████  12 pedidos
#2  Cupcake Morango       ████████       8 pedidos
```

### Implementação

**Arquivo:** `src/components/finances/TopProductsChart.tsx`

#### 1. Manter ordenação por quantidade (linha 121-123)
```typescript
// Não muda - continua ordenando por quantity
const sorted = Array.from(productMap.values())
  .sort((a, b) => b.quantity - a.quantity)
  .slice(0, 5);
```

#### 2. Alterar exibição no Mobile (linhas 178-181)
- Trocar `product.quantity` por `product.orderCount`
- Adicionar sufixo "pedido(s)"

```typescript
<span className="text-sm font-semibold tabular-nums whitespace-nowrap">
  {product.orderCount} {product.orderCount === 1 ? 'pedido' : 'pedidos'}
</span>
```

#### 3. Alterar barra de progresso no Mobile (linhas 173-174)
- Calcular largura baseada em `orderCount` em vez de `quantity`

```typescript
const maxOrders = topProducts[0]?.orderCount || 1;
const barWidth = (product.orderCount / maxOrders) * 100;
```

#### 4. Alterar gráfico Desktop (linhas 220-232)
- Mudar `dataKey` de `"quantity"` para `"orderCount"`
- Atualizar label customizado para mostrar "X pedidos"

```typescript
<Bar
  dataKey="orderCount"
  radius={[0, 4, 4, 0]}
  maxBarSize={28}
>
  ...
  <LabelList
    dataKey="orderCount"
    content={renderOrderCountLabel}
  />
</Bar>
```

#### 5. Atualizar função de label (linhas 136-148)
- Criar nova função que formata como "X pedido(s)"

```typescript
const renderOrderCountLabel = (props: any) => {
  const { x, y, width, value, height } = props;
  const label = `${value} ${value === 1 ? 'pedido' : 'pedidos'}`;
  return (
    <text
      x={x + width + 6}
      y={y + (height || 24) / 2 + 4}
      fill="hsl(var(--foreground))"
      fontSize={11}
      fontWeight={600}
    >
      {label}
    </text>
  );
};
```

### Resultado Final

A lógica `orderCount` já está sendo calculada corretamente no componente (linhas 95-109). Apenas precisamos:
1. Usar `orderCount` para exibição em vez de `quantity`
2. Formatar como "X pedido(s)"
3. Basear a barra de progresso em `orderCount`

### Benefício

- **Ranking inteligente** - Produtos com maior volume aparecem primeiro
- **Informação acionável** - Usuário vê quantos pedidos tiveram aquele produto
- **Simplicidade** - Uma única métrica clara para entender demanda

