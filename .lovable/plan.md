
## Plano: Integrar Variação Percentual nos Cards Existentes

### Objetivo
Remover o gráfico "Comparativo Mensal" e exibir as variações percentuais (vs. mês anterior) diretamente nos 4 cards existentes no topo da página Financeiro, simplificando a interface e eliminando redundância.

### Análise Atual

**Componente `MonthComparisonChart`** já calcula:
- `incomeVariation`: variação % de receitas vs mês anterior
- `expenseVariation`: variação % de despesas vs mês anterior  
- `balanceVariation`: variação % de saldo vs mês anterior

**Componente `StatsCard`** já suporta:
- Prop `trend` com `{ value: number, isPositive: boolean }`
- Exibe automaticamente: "↑ X% vs mês anterior" ou "↓ X% vs mês anterior"

### Alterações Necessárias

#### 1. `src/pages/Finances.tsx`

**Remover:**
- Import do `MonthComparisonChart`
- Uso do componente `<MonthComparisonChart />`

**Adicionar:**
- Hook `useMemo` para calcular as variações mensais (extrair lógica do `MonthComparisonChart`)
- Passar prop `trend` para os cards Saldo, Receitas e Despesas

```text
Novo cálculo no Finances.tsx:
┌─────────────────────────────────────────────────────────────┐
│ useMemo → monthVariations                                   │
│   - Filtra transações do mês atual e anterior               │
│   - Calcula income, expense, balance de cada mês            │
│   - Retorna variações percentuais                           │
└─────────────────────────────────────────────────────────────┘

Cards atualizados:
┌──────────────┬──────────────┬──────────────┬──────────────┐
│    Saldo     │   Receitas   │   Despesas   │ Lucro Bruto  │
│   R$ 3.157   │   R$ 8.489   │   R$ 5.332   │   R$ 2.180   │
│ ↑ 45.2% vs   │ ↑ 39.6% vs   │ ↑ 156.6% vs  │ Margem: 25%  │
│ mês anterior │ mês anterior │ mês anterior │              │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

#### 2. Arquivo a Remover

- `src/components/finances/MonthComparisonChart.tsx` (opcional, pode ser mantido como código morto ou removido)

### Detalhes Técnicos

**Lógica de variação a integrar:**
```typescript
const monthVariations = useMemo(() => {
  const currentDate = selectedMonth 
    ? new Date(selectedMonth.year, selectedMonth.month, 1)
    : new Date();
  
  const currentMonthStart = startOfMonth(currentDate);
  const currentMonthEnd = endOfMonth(currentDate);
  const previousDate = subMonths(currentDate, 1);
  const previousMonthStart = startOfMonth(previousDate);
  const previousMonthEnd = endOfMonth(previousDate);

  // Filtra e calcula totais para cada mês
  // Retorna { incomeVariation, expenseVariation, balanceVariation }
}, [transactions, selectedMonth]);
```

**Atualização dos StatsCards:**
```typescript
<StatsCard
  title="Receitas"
  value={formatCurrency(totalIncome)}
  icon={TrendingUp}
  variant="success"
  trend={{
    value: Math.abs(monthVariations.income),
    isPositive: monthVariations.income >= 0
  }}
/>
```

**Nota sobre Despesas:**
- Para despesas, a lógica de "positivo" é invertida: redução de despesas é bom (verde), aumento é ruim (vermelho)

### Benefícios
1. Interface mais limpa e compacta
2. Informação contextual diretamente nos cards relevantes
3. Menos scroll necessário na página
4. Aproveitamento de funcionalidade existente no `StatsCard`
