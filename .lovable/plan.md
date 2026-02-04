

## Plano: Padronizar Cores dos Cards no Dialog de Lucro Bruto

### Problema Identificado

| Card | Cor Atual | Cor Esperada |
|------|-----------|--------------|
| Faturamento (Dialog) | `bg-primary/10` (terracota) | Sky blue (mesmo do Dashboard) |
| Custo Produtos | `bg-warning/10` (amarelo) | Manter |
| Lucro Bruto | `bg-success/10` (verde) | Manter |
| Margem | `bg-muted` (cinza) | Manter |

O card "Faturamento" no dialog deve usar o mesmo tom de azul Sky usado no StatsCard com variant `delivered`, criando consistência visual com o card "Faturamento no Mês" do Dashboard e da página Finances.

### Alterações

**Arquivo**: `src/components/finances/GrossProfitDetailDialog.tsx`

#### Linhas 91-96 - Ajustar card de Faturamento

```tsx
// ANTES
<Card className="bg-primary/10 border-primary/20">
  <CardContent className="p-3">
    <p className="text-xs text-muted-foreground">Faturamento</p>
    <p className="text-lg font-bold text-primary">{formatCurrency(totals.revenue)}</p>
  </CardContent>
</Card>

// DEPOIS
<Card className="bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800">
  <CardContent className="p-3">
    <p className="text-xs text-sky-600 dark:text-sky-400">Faturamento</p>
    <p className="text-lg font-bold text-sky-900 dark:text-sky-100">{formatCurrency(totals.revenue)}</p>
  </CardContent>
</Card>
```

### Resultado Visual

Os cards dentro do "Detalhamento do Lucro Bruto" seguirão esta paleta:

| Card | Background | Texto |
|------|------------|-------|
| **Faturamento** | Sky blue | Sky-900/100 |
| **Custo Produtos** | Warning/amarelo | Warning |
| **Lucro Bruto** | Success/verde | Success |
| **Margem** | Muted/cinza | Foreground |

Isso cria uma linguagem visual consistente onde "Faturamento" sempre aparece em azul Sky, associando-o visualmente aos cards de receita/entregues em todo o sistema.

