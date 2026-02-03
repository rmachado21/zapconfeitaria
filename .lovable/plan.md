

## Plano: Refinar Cores das Barras nos Gráficos

### Problema
As barras de progresso dos cards "Top 5 Produtos" e "Quantidade Vendida" usam `hsl(var(--primary))` (laranja forte), criando contraste excessivo que compete com elementos de ação e destaca demais os dados.

### Solução Proposta
Trocar para tons de verde/teal mais suaves, alinhados com a paleta já usada no gráfico de "Receitas por Produto" (ProductRevenueChart), que usa tons como `hsl(155, 60%, 40%)`.

### Paleta Atual vs Proposta

| Posição | Atual (laranja agressivo) | Proposta (verde/teal suave) |
|---------|---------------------------|------------------------------|
| #1 | `hsl(var(--primary))` | `hsl(160, 45%, 45%)` |
| #2 | `hsl(var(--primary) / 0.85)` | `hsl(155, 40%, 50%)` |
| #3 | `hsl(var(--primary) / 0.7)` | `hsl(150, 35%, 55%)` |
| #4 | `hsl(var(--primary) / 0.55)` | `hsl(145, 30%, 60%)` |
| #5 | `hsl(var(--primary) / 0.4)` | `hsl(140, 25%, 65%)` |

### Visualização

```text
ANTES (laranja saturado):        DEPOIS (verde suave):
━━━━━━━━━━━━ 🟠                  ━━━━━━━━━━━━ 🟢
━━━━━━━━━━ 🟠                    ━━━━━━━━━━ 🟢
━━━━━━━ 🟠                       ━━━━━━━ 🟢
```

### Alterações Técnicas

#### 1. `src/components/finances/TopProductsChart.tsx` (linha 45-51)

```typescript
// ANTES
const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--primary) / 0.85)',
  'hsl(var(--primary) / 0.7)',
  'hsl(var(--primary) / 0.55)',
  'hsl(var(--primary) / 0.4)',
];

// DEPOIS
const CHART_COLORS = [
  'hsl(160, 45%, 45%)',  // Teal escuro
  'hsl(155, 40%, 50%)',  // Teal médio
  'hsl(150, 35%, 55%)',  // Verde suave
  'hsl(145, 30%, 60%)',  // Verde claro
  'hsl(140, 25%, 65%)',  // Verde mais claro
];
```

#### 2. `src/components/finances/ProductQuantityChart.tsx` (linha 37-43)

Mesma alteração de cores:

```typescript
const CHART_COLORS = [
  'hsl(160, 45%, 45%)',
  'hsl(155, 40%, 50%)',
  'hsl(150, 35%, 55%)',
  'hsl(145, 30%, 60%)',
  'hsl(140, 25%, 65%)',
];
```

Também atualizar a cor fixa usada nos itens expandidos (linha 192):

```typescript
// ANTES
className="... bg-primary/40"

// DEPOIS  
style={{ 
  width: `${barWidth}%`,
  backgroundColor: 'hsl(140, 25%, 65%)',
}}
```

### Benefícios

1. **Menos agressivo**: Verde/teal é mais neutro e não compete com CTAs
2. **Consistência**: Harmoniza com o gráfico de pizza "Receitas por Produto"
3. **Hierarquia visual**: Dados ficam informativos sem gritar
4. **Profissionalismo**: Paleta mais sofisticada e equilibrada

### Arquivos a Modificar
- `src/components/finances/TopProductsChart.tsx` (linhas 45-51)
- `src/components/finances/ProductQuantityChart.tsx` (linhas 37-43, 192)

