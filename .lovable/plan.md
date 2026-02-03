

## Plano: Tornar Histórico de Pagamentos Mais Sutil

### Situação Atual

O componente "Histórico de Pagamentos" no `OrderDetailDialog` possui estilo proeminente:

| Elemento | Estilo Atual | Problema |
|----------|--------------|----------|
| Container | `<Card>` com `p-4` | Destaque visual igual às seções principais |
| Título | `font-semibold` | Muito enfático para info secundária |
| Descrição | `font-medium` | Peso desnecessário |
| Valor | `font-semibold text-success` | Verde vibrante chama muita atenção |
| Borda | `border-b` entre itens | Separação visual forte |

### Alterações Propostas

#### Arquivo: `src/components/orders/OrderDetailDialog.tsx`

##### 1. Container mais leve
```typescript
// Antes
<Card>
  <CardContent className="p-4">

// Depois - Sem Card, usa div com borda sutil
<div className="border-t pt-4 mt-2">
```

##### 2. Título mais discreto
```typescript
// Antes
<p className="font-semibold text-sm">Histórico de Pagamentos</p>

// Depois
<p className="text-xs text-muted-foreground font-medium">Histórico de Pagamentos</p>
```

##### 3. Descrição sem ênfase
```typescript
// Antes
<span className="font-medium">{cleanDescription}</span>

// Depois
<span className="text-muted-foreground">{cleanDescription}</span>
```

##### 4. Valores mais sutis
```typescript
// Antes
<span className={cn("font-semibold", transaction.type === "income" ? "text-success" : "text-destructive")}>

// Depois - Remove bold, usa cor mais suave
<span className={cn(
  "font-normal",
  transaction.type === "income" ? "text-muted-foreground" : "text-muted-foreground"
)}>
```

##### 5. Reduzir espaçamento e bordas
```typescript
// Antes
<div className="flex items-center justify-between text-sm py-2 border-b last:border-b-0">

// Depois
<div className="flex items-center justify-between text-xs py-1.5">
```

### Comparativo Visual

```text
ANTES (Proeminente)
┌────────────────────────────────────────────┐
│ 🕐 Histórico de Pagamentos                 │   ← Card com borda
│ ─────────────────────────────────────────  │
│ Sinal 51% - Tâmara Carla        +R$ 180,00 │   ← Verde vibrante, bold
│ 22/01/2026                    ────────────  │
└────────────────────────────────────────────┘

DEPOIS (Sutil)
─────────────────────────────────────────────
🕐 Histórico de Pagamentos                      ← Apenas linha divisória
   Sinal 51% - Tâmara Carla         +R$ 180,00  ← Texto muted, sem bold
   22/01/2026
```

### Resumo das Alterações

| Linha | Alteração |
|-------|-----------|
| 706-707 | Trocar `<Card><CardContent className="p-4">` por `<div className="border-t pt-4 mt-2">` |
| 708 | Reduzir margin: `mb-3` → `mb-2` |
| 710 | Título: `font-semibold text-sm` → `text-xs text-muted-foreground font-medium` |
| 712 | Espaçamento: `space-y-2` → `space-y-1` |
| 731 | Itens: `text-sm py-2 border-b last:border-b-0` → `text-xs py-1.5` |
| 735 | Descrição: `font-medium` → `text-muted-foreground` |
| 746-749 | Valor: remover `font-semibold`, usar `text-muted-foreground` para ambos |
| 756-757 | Fechar com `</div>` em vez de `</CardContent></Card>` |

### Benefícios

1. **Hierarquia visual**: Info principal (valores, status) permanece destacada
2. **Menos ruído**: Histórico fica disponível mas não compete por atenção
3. **Consistência**: Alinha com o conceito de informação secundária
4. **Mobile-friendly**: Menos elementos visuais = leitura mais rápida

