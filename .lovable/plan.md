
## Padronização do Badge de Urgência

### Problema Identificado

Existem **inconsistências visuais** entre os componentes que exibem badges de urgência:

| Componente | Classes (Critical) | Classes (Warning) |
|------------|-------------------|------------------|
| `OrderCard.tsx` | `bg-destructive/50 text-destructive-foreground` | `bg-warning/50 text-warning-foreground` |
| `OrderDetailDialog.tsx` | `bg-red-500/50 text-red-900` | `bg-yellow-500/50 text-yellow-900` |
| `PendingDepositsDialog.tsx` | `bg-red-500/50 text-red-900` | `bg-yellow-500/50 text-yellow-900` |
| `ActiveOrdersDialog.tsx` | `bg-red-500/50 text-red-900` | `bg-yellow-500/50 text-yellow-900` |
| `FullyPaidOrdersDialog.tsx` | `bg-red-500/50 text-red-900` | `bg-yellow-500/50 text-yellow-900` |

### Solução Proposta

Criar um componente reutilizavel `UrgencyBadge` que centraliza:
1. A logica de calculo de dias restantes
2. O estilo visual padronizado
3. Suporte a dark mode

### Implementacao

#### 1. Criar Componente `UrgencyBadge`

Novo arquivo: `src/components/shared/UrgencyBadge.tsx`

```text
+------------------------------------------+
|  Props:                                  |
|  - deliveryDate: string                  |
|  - showForDelivered?: boolean            |
+------------------------------------------+
|  Retorna:                                |
|  - null (se nao houver data)             |
|  - Badge com texto e cor apropriada      |
+------------------------------------------+
```

Classes padronizadas (baseadas no tema):
- **Critical** (Atrasado, Hoje!, Amanha): `bg-red-500/50 text-red-900 dark:text-red-100`
- **Warning** (2-3 dias): `bg-amber-500/50 text-amber-900 dark:text-amber-100`
- **Normal** (4+ dias): `bg-muted text-muted-foreground`

#### 2. Atualizar Componentes Existentes

| Arquivo | Alteracao |
|---------|-----------|
| `OrderCard.tsx` | Substituir logica inline por `<UrgencyBadge />` |
| `OrderDetailDialog.tsx` | Substituir logica inline por `<UrgencyBadge />` |
| `PendingDepositsDialog.tsx` | Substituir logica inline por `<UrgencyBadge />` |
| `ActiveOrdersDialog.tsx` | Substituir logica inline por `<UrgencyBadge />` |
| `FullyPaidOrdersDialog.tsx` | Substituir logica inline por `<UrgencyBadge />` |

#### 3. Cores Escolhidas

Optei por usar cores explicitas (`red-500`, `amber-500`) em vez de variaveis de tema (`destructive`, `warning`) porque:
- Mantem consistencia visual entre todos os componentes
- As cores do tema `destructive` e `warning` podem ter leves variacoes de tom
- Cores explicitas garantem contraste adequado no dark mode

### Estrutura do Componente

```tsx
interface UrgencyBadgeProps {
  deliveryDate: string | null;
  showForDelivered?: boolean; // Para permitir ocultar em pedidos entregues
}

function UrgencyBadge({ deliveryDate, showForDelivered = false }: UrgencyBadgeProps) {
  // Logica de calculo
  const urgency = useMemo(() => {
    if (!deliveryDate) return null;
    const date = parseISO(deliveryDate);
    const today = new Date();
    // ... calculo de diff
    return { text, level };
  }, [deliveryDate]);

  if (!urgency) return null;

  return (
    <span className={cn(
      "text-[10px] font-medium px-1.5 py-0.5 rounded",
      urgency.level === "critical" && "bg-red-500/50 text-red-900 dark:text-red-100",
      urgency.level === "warning" && "bg-amber-500/50 text-amber-900 dark:text-amber-100",
      urgency.level === "normal" && "bg-muted text-muted-foreground",
    )}>
      {urgency.text}
    </span>
  );
}
```

### Beneficios

1. **DRY** - Logica de urgencia em um unico lugar
2. **Consistencia** - Mesma aparencia em todos os lugares
3. **Manutencao** - Alteracoes futuras em um unico arquivo
4. **Dark Mode** - Suporte garantido e testado
