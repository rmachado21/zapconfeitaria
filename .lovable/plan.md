

## Plano: Ajustar Margens do PDF de Orçamento

### Situação Atual

Analisando o código e a imagem do PDF:

| Configuração | Valor Atual | Observação |
|--------------|-------------|------------|
| **Margem** | 20mm | Margem lateral ampla |
| **Coluna Produto** | 45% da largura | Trunca nomes longos em ~28-35 caracteres |
| **Padding interno** | 5mm | Espaço fixo dentro das células |

### Problemas Identificados

1. **Margens muito largas**: 20mm de cada lado desperdiça espaço horizontal
2. **Coluna Produto limitada**: Trunca nomes como "Topo Idade + Flores Natura [ADICIONAL]"
3. **Proporções fixas**: Colunas Qtd, Unit. e Total ocupam mais espaço que precisam

### Alterações Propostas

#### Arquivo: `supabase/functions/generate-quote-pdf/index.ts`

##### 1. Reduzir margens laterais
```typescript
// Antes
const margin = 20;

// Depois
const margin = 15;  // Reduz 5mm de cada lado = +10mm para conteúdo
```

##### 2. Redistribuir proporções das colunas
```typescript
// Antes (linhas 260-263)
const col1Width = tableWidth * 0.45; // Produto
const col2Width = tableWidth * 0.15; // Qtd
const col3Width = tableWidth * 0.20; // Unit
const col4Width = tableWidth * 0.20; // Total

// Depois - Mais espaço para Produto
const col1Width = tableWidth * 0.50; // Produto (+5%)
const col2Width = tableWidth * 0.14; // Qtd (-1%)
const col3Width = tableWidth * 0.18; // Unit (-2%)
const col4Width = tableWidth * 0.18; // Total (-2%)
```

##### 3. Aumentar limite de caracteres do nome do produto
```typescript
// Antes (linhas 313, 316, 319)
item.product_name.substring(0, 28)  // com [BRINDE]
item.product_name.substring(0, 26)  // com [ADICIONAL]
item.product_name.substring(0, 35)  // normal

// Depois
item.product_name.substring(0, 38)  // com [BRINDE]
item.product_name.substring(0, 36)  // com [ADICIONAL]
item.product_name.substring(0, 48)  // normal
```

##### 4. Reduzir padding interno das células
```typescript
// Antes - padding de 5mm em vários locais
margin + 5

// Depois - padding de 3mm
margin + 3
```

### Comparativo Visual

```text
ANTES (margin: 20mm)
┌────────────────────────────────────────────────────────────┐
│                                                            │
│   ┌────────────────────────────────────────────────────┐   │
│   │ Produto (45%)    │ Qtd │   Unit.   │    Total     │   │
│   │ Topo Idade + Fl..│     │           │              │   │
│   └────────────────────────────────────────────────────┘   │
│                                                            │
└────────────────────────────────────────────────────────────┘

DEPOIS (margin: 15mm)
┌────────────────────────────────────────────────────────────┐
│                                                            │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ Produto (50%)              │ Qtd │  Unit. │   Total   │ │
│ │ Topo Idade + Flores Natura │     │        │           │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Ganho de Espaço

| Item | Antes | Depois | Ganho |
|------|-------|--------|-------|
| Largura útil | 170mm | 180mm | +10mm |
| Coluna Produto | 76.5mm | 90mm | +13.5mm |
| Caracteres Produto | 35 | 48 | +13 chars |

### Resumo das Alterações

**Arquivo a modificar**: `supabase/functions/generate-quote-pdf/index.ts`

1. **Linha 194**: `margin = 20` para `margin = 15`
2. **Linhas 260-263**: Novas proporções das colunas (50/14/18/18)
3. **Linhas 279-282**: Padding interno de 5 para 3
4. **Linhas 313, 316, 319**: Limites de caracteres aumentados
5. **Linhas 323-324, 328, 339**: Padding das outras colunas

