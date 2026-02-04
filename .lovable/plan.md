

## Plano: Corrigir Divergência Entre Card "Este Mês" e Dialog de Lucro Bruto

### Problema Identificado

No Dashboard (`Index.tsx`), há uma inconsistência na filtragem de pedidos:

| Elemento | Critério de Filtro | Resultado nas Imagens |
|----------|-------------------|----------------------|
| Card "Este Mês" | `delivery_date` | R$ 234,50 (1 pedido) |
| Dialog "Lucro Bruto" | `updated_at` | R$ 443,50 (2 pedidos) |

Isso ocorre porque:
- **Card "Este Mês"** usa `filteredOrders` filtrado por `delivery_date` (linhas 46-54)
- **Dialog "Lucro Bruto"** usa `deliveredOrdersForProfit` filtrado por `updated_at` (linhas 88-94)

Na página Finances, ambos usam `delivery_date`, por isso não há divergência lá.

### Solução

Unificar a lógica no Dashboard para que tanto o card quanto o dialog usem o mesmo critério de filtragem (`delivery_date`).

### Alterações

**Arquivo**: `src/pages/Index.tsx`

#### 1. Modificar o cálculo de `grossProfitTotals` (linhas 87-116)

Mudar o filtro de `updated_at` para `delivery_date`:

```typescript
// ANTES (linha 90-93):
const deliveredOrders = orders.filter((order) => {
  if (order.status !== "delivered") return false;
  const orderDate = parseISO(order.updated_at);
  return isAfter(orderDate, startDate) || orderDate.getTime() === startDate.getTime();
});

// DEPOIS:
const deliveredOrders = orders.filter((order) => {
  if (order.status !== "delivered") return false;
  if (!order.delivery_date) return false;
  const deliveryDate = parseISO(order.delivery_date);
  return isAfter(deliveryDate, startDate) || deliveryDate.getTime() === startDate.getTime();
});
```

### Resultado Esperado

Após a correção:

| Elemento | Critério de Filtro | Resultado |
|----------|-------------------|-----------|
| Card "Este Mês" | `delivery_date` | R$ 234,50 |
| Dialog "Lucro Bruto" | `delivery_date` | R$ 234,50 |
| Card "Lucro Bruto" (Finances) | `delivery_date` | R$ 234,50 |

Todos os três elementos mostrarão os mesmos dados, baseados na data de entrega dos pedidos, conforme a regra de negócio documentada na memória `business-logic/dashboard-este-mes-delivery-date-filter`.

### Impacto

- Correção mínima (apenas 2 linhas alteradas)
- Alinhamento com a lógica já implementada na página Finances
- Consistência na experiência do usuário

