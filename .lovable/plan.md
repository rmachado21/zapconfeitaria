
Objetivo
- Deixar as barras/linhas dos cards “Top 5 Produtos” e “Quantidade Vendida” mais discretas, com tons de cinza claros e sutis, evitando o aspecto “agressivo”/saturado.
- Manter boa leitura em light e dark mode (cores “theme-aware”).

Diagnóstico rápido (como está hoje)
- Ambos os componentes usam uma paleta fixa de verdes/teal em `CHART_COLORS`, aplicada:
  - TopProductsChart:
    - Mobile: `style.backgroundColor = CHART_COLORS[index]`
    - Desktop (Recharts): `<Cell fill={CHART_COLORS[index]} />`
  - ProductQuantityChart:
    - Top 5 e lista expandida: `style.backgroundColor = CHART_COLORS[colorIndex]` e um valor fixo no expandido.
- Mesmo sendo mais suave que o laranja anterior, ainda há saturação perceptível nas barras.

Solução proposta (cinzas sutis e consistentes com o tema)
1) Trocar `CHART_COLORS` (em ambos os arquivos) para uma escala de cinza baseada em variáveis do tema (Shadcn/Tailwind tokens):
- Usar `hsl(var(--muted-foreground) / <alpha>)` para gerar cinzas “macios” e responsivos ao dark mode.
- Escala sugerida (do mais “presente” ao mais sutil):
  - 0.30, 0.26, 0.22, 0.18, 0.14

Exemplo:
```ts
const CHART_COLORS = [
  'hsl(var(--muted-foreground) / 0.30)',
  'hsl(var(--muted-foreground) / 0.26)',
  'hsl(var(--muted-foreground) / 0.22)',
  'hsl(var(--muted-foreground) / 0.18)',
  'hsl(var(--muted-foreground) / 0.14)',
];
```

2) Ajustar a lista expandida do “Quantidade Vendida” para não ter “cor fixa” fora da paleta
- Hoje a lista expandida usa um `backgroundColor` hardcoded.
- Trocar para algo derivado da própria paleta (ex.: `CHART_COLORS[CHART_COLORS.length - 1]`) para ficar consistente e fácil de ajustar no futuro.

Exemplo:
```ts
backgroundColor: CHART_COLORS[CHART_COLORS.length - 1]
```

3) (Opcional, se ainda ficar forte ou fraco após ver no preview) Ajuste fino de contraste
- Se as barras ficarem “apagadas demais” no fundo `bg-muted`, aumentar levemente os alphas (ex.: +0.02).
- Se ainda estiverem “fortes”, reduzir levemente os alphas (ex.: -0.02).
- Essa regulagem é rápida porque fica centralizada no `CHART_COLORS`.

Arquivos que serão alterados
- `src/components/finances/TopProductsChart.tsx`
  - Atualizar `CHART_COLORS` para a escala de cinzas com `--muted-foreground`.
- `src/components/finances/ProductQuantityChart.tsx`
  - Atualizar `CHART_COLORS` para a mesma escala de cinzas.
  - Trocar a cor fixa da barra na lista expandida para usar `CHART_COLORS[...]`.

Checklist de validação (QA)
- Em /finances (mobile):
  - Card “Top 5 Produtos”: barras com cinza suave, sem “gritar” visualmente, ainda legíveis.
  - Card “Quantidade Vendida”: barras idem, e a lista expandida mantém a mesma linguagem de cor.
- Em /finances (desktop):
  - “Top 5 Produtos” (Recharts): as barras e labels continuam com boa leitura.
- Testar em light e dark mode:
  - Garantir que as barras não “somem” no dark, nem fiquem pesadas no light.

Notas técnicas
- O projeto já usa tokens HSL no `src/index.css` (ex.: `--muted-foreground`), então `hsl(var(--muted-foreground) / 0.xx)` tende a ficar bem consistente com o resto do sistema e automaticamente adaptável ao tema.
