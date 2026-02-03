

## Plano: Refinar Cores das Barras de Progresso para Tom Laranja Sutil

### Situação Atual

Os gráficos "Top 5 Produtos" e "Quantidade Vendida" usam paleta de cinza baseada em `--muted-foreground`:

```typescript
const CHART_COLORS = [
  "hsl(var(--muted-foreground) / 0.30)",  // Cinza 30%
  "hsl(var(--muted-foreground) / 0.26)",  // Cinza 26%
  "hsl(var(--muted-foreground) / 0.22)",  // Cinza 22%
  "hsl(var(--muted-foreground) / 0.18)",  // Cinza 18%
  "hsl(var(--muted-foreground) / 0.14)",  // Cinza 14%
];
```

### Proposta de Alteração

Usar a variável `--primary` (terracotta, hue 15°) com opacidades sutis para manter a identidade visual do aplicativo:

```typescript
const CHART_COLORS = [
  "hsl(var(--primary) / 0.40)",  // Laranja 40%
  "hsl(var(--primary) / 0.32)",  // Laranja 32%
  "hsl(var(--primary) / 0.25)",  // Laranja 25%
  "hsl(var(--primary) / 0.18)",  // Laranja 18%
  "hsl(var(--primary) / 0.12)",  // Laranja 12%
];
```

### Comparativo Visual

```text
ANTES (Cinza)
━━━━━━━━━━━━━━━━━━━━━━━━━  ← Cinza neutro, sem personalidade
━━━━━━━━━━━━━━━━━━━━━
━━━━━━━━━━━━━━━━━
━━━━━━━━━━━━━
━━━━━━━━━

DEPOIS (Laranja sutil)
━━━━━━━━━━━━━━━━━━━━━━━━━  ← Terracotta suave, identidade da marca
━━━━━━━━━━━━━━━━━━━━━
━━━━━━━━━━━━━━━━━
━━━━━━━━━━━━━
━━━━━━━━━
```

### Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/components/finances/TopProductsChart.tsx` | Atualizar `CHART_COLORS` (linhas 35-41) |
| `src/components/finances/ProductQuantityChart.tsx` | Atualizar `CHART_COLORS` (linhas 37-43) |

### Benefícios

1. **Consistência visual**: Cores alinhadas com a identidade terracotta/confeitaria
2. **Sutileza mantida**: Opacidades baixas evitam agressividade visual
3. **Compatibilidade dark mode**: Variável CSS funciona em ambos os temas
4. **Hierarquia preservada**: Gradação de opacidade indica ranking

