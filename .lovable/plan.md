

## Plano: Reorganizar Cards na Página Financeiro

### Objetivo
Organizar os 4 StatsCards em 2 linhas (grid 2x2) no mobile e reordenar na sequência: **Saldo → Lucro Bruto → Receitas → Despesas**

### Estado Atual

**Layout:**
```
Mobile: 1 coluna (cards empilhados verticalmente)
grid-cols-1 sm:grid-cols-2 lg:grid-cols-4
```

**Ordem atual:**
1. Saldo
2. Receitas
3. Despesas
4. Lucro Bruto

### Alterações Necessárias

#### `src/pages/Finances.tsx`

**1. Alterar grid para 2 colunas no mobile:**
```typescript
// ANTES
<section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

// DEPOIS
<section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
```

**2. Reordenar os cards:**
```text
ANTES:                    DEPOIS:
┌──────────────────┐      ┌─────────┬─────────┐
│ Saldo            │      │ Saldo   │ Lucro   │
├──────────────────┤  →   │         │ Bruto   │
│ Receitas         │      ├─────────┼─────────┤
├──────────────────┤      │ Receitas│ Despesas│
│ Despesas         │      │         │         │
├──────────────────┤      └─────────┴─────────┘
│ Lucro Bruto      │
└──────────────────┘
```

Nova ordem no código:
1. `<StatsCard title="Saldo" ... />`
2. `<StatsCard title="Lucro Bruto" ... />` (mover para cima)
3. `<StatsCard title="Receitas" ... />`
4. `<StatsCard title="Despesas" ... />`

### Detalhes Técnicos

```typescript
// Linha 539 - Alterar classe do grid
<section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
  {/* 1. Saldo (permanece primeiro) */}
  <StatsCard
    title={`Saldo (${displayPeriodLabel})`}
    value={formatCurrency(balance)}
    icon={Wallet}
    variant={balance >= 0 ? 'delivered' : 'warning'}
    trend={{ ... }}
  />
  
  {/* 2. Lucro Bruto (movido para segundo) */}
  <StatsCard
    title="Lucro Bruto"
    value={formatCurrency(estimatedProfit.profit)}
    subtitle={`Margem: ${estimatedProfit.margin.toFixed(1)}%`}
    icon={PiggyBank}
    variant={estimatedProfit.profit >= 0 ? 'success' : 'warning'}
    tooltip="..."
    mobileDescription="Vendas - Custo dos produtos. Toque para detalhes."
    onClick={() => setGrossProfitDialogOpen(true)}
  />
  
  {/* 3. Receitas (movido para terceiro) */}
  <StatsCard
    title="Receitas"
    value={formatCurrency(totalIncome)}
    icon={TrendingUp}
    variant="success"
    trend={{ ... }}
  />
  
  {/* 4. Despesas (permanece último) */}
  <StatsCard
    title="Despesas"
    value={formatCurrency(totalExpenses)}
    icon={TrendingDown}
    variant="warning"
    trend={{ ... }}
  />
</section>
```

### Visualização Final (Mobile)

```text
┌─────────────────┬─────────────────┐
│ 💰 Saldo        │ 🐷 Lucro Bruto  │
│ -R$ 27,70       │ R$ 122,50       │
│ ↓ 95.2% vs mês  │ Margem: 52.2%   │
├─────────────────┼─────────────────┤
│ 📈 Receitas     │ 📉 Despesas     │
│ R$ 400,00       │ R$ 427,70       │
│ ↓ 95.3% vs mês  │ ↑ 95.4% vs mês  │
└─────────────────┴─────────────────┘
```

### Benefícios
1. Melhor aproveitamento de espaço no mobile (grid 2x2 vs lista vertical)
2. Ordem lógica: Saldo geral → Lucro → Entradas → Saídas
3. Gap menor no mobile (gap-3) para melhor proporção
4. Consistência com o layout do dashboard (Index.tsx)

### Arquivo a Modificar
- `src/pages/Finances.tsx` (linhas 539-579)

