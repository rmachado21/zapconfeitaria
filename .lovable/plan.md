

## Plano: Padronizar Cards do Dashboard com Tema Azul (Delivered)

### Objetivo
Adicionar uma nova variante de cor "delivered" aos StatsCards do dashboard, usando os mesmos tons de azul sky já utilizados na coluna Kanban de pedidos entregues, para criar consistência visual.

### Referência de Cores (Coluna Kanban "Entregue")

A coluna Kanban "delivered" utiliza:
- **Fundo**: `bg-sky-50/50` (light) / `bg-sky-950/30` (dark)
- **Borda**: `border-sky-200` (light) / `border-sky-800` (dark)  
- **Header**: `bg-sky-100` (light) / `bg-sky-900/50` (dark)
- **Badge**: `bg-sky-200` texto `text-sky-800`
- **Dot**: `bg-sky-500`

### Alterações Necessárias

#### 1. `src/components/dashboard/StatsCard.tsx`

Adicionar nova variante "delivered" aos estilos existentes:

```typescript
// Novas variantes
const variantStyles = {
  default: 'bg-card',
  primary: 'gradient-warm text-primary-foreground',
  success: 'bg-success/10 border-success/20',
  warning: 'bg-warning/10 border-warning/20',
  delivered: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800', // NOVO
};

const iconStyles = {
  default: 'bg-primary/10 text-primary',
  primary: 'bg-primary-foreground/20 text-primary-foreground',
  success: 'bg-success/20 text-success',
  warning: 'bg-warning/20 text-warning',
  delivered: 'bg-sky-200 dark:bg-sky-800 text-sky-700 dark:text-sky-200', // NOVO
};
```

Atualizar cores de texto para a variante "delivered":
- Título: `text-sky-600 dark:text-sky-400`
- Valor: `text-sky-900 dark:text-sky-100`
- Subtítulo: `text-sky-600/80 dark:text-sky-400/80`
- Ícone inline mobile: `text-sky-600`

#### 2. `src/pages/Index.tsx`

Atualizar o card "Este Mês" para usar a nova variante:

```typescript
<StatsCard
  title="Este Mês"
  value={formatCurrency(periodIncome)}
  subtitle={`${...} pedidos entregues`}
  icon={TrendingUp}
  variant="delivered"  // Alterado de "primary"
  onClick={() => setGrossProfitDialogOpen(true)}
/>
```

### Visualização da Mudança

```text
ANTES (laranja gradient):                 DEPOIS (azul sky):
┌─────────────────────┐                   ┌─────────────────────┐
│ 🟠 Este Mês         │                   │ 🔵 Este Mês         │
│   R$ 234,50   📈    │                   │   R$ 234,50   📈    │
│ 1 pedidos entregues │                   │ 1 pedidos entregues │
│ (fundo laranja)     │                   │ (fundo azul claro)  │
└─────────────────────┘                   └─────────────────────┘
```

### Benefícios
1. Consistência visual entre o card "Este Mês" e a coluna Kanban "Entregue"
2. Associação semântica clara: azul = entregue/concluído
3. Reutilização da paleta de cores já estabelecida no sistema

### Arquivos a Modificar
- `src/components/dashboard/StatsCard.tsx` - adicionar variante "delivered"
- `src/pages/Index.tsx` - aplicar variante no card "Este Mês"

