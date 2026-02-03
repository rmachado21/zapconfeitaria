

## Plano: Abrir Painel de Transações ao Clicar em Receitas/Despesas

### Objetivo
Permitir que ao clicar nos cards **Receitas** ou **Despesas** na página Financeiro, um `ResponsivePanel` seja aberto mostrando a lista de transações filtrada pelo tipo correspondente.

### Comportamento Esperado

```text
┌──────────────────────────────────────────────────┐
│  Receitas (ou Despesas)                      ✕   │
├──────────────────────────────────────────────────┤
│  📊 Resumo                                       │
│  ┌───────────────────────────────────────────┐   │
│  │ Total: R$ 5.240,00    │ 12 transações     │   │
│  └───────────────────────────────────────────┘   │
│                                                  │
│  📋 Transações                                   │
│  ┌───────────────────────────────────────────┐   │
│  │ 15 Jan  Sinal - Pedido #0042   R$ 450,00  │   │
│  ├───────────────────────────────────────────┤   │
│  │ 12 Jan  Pagamento Final #0038  R$ 1.200   │   │
│  ├───────────────────────────────────────────┤   │
│  │ ...                                       │   │
│  └───────────────────────────────────────────┘   │
└──────────────────────────────────────────────────┘
```

### Alterações

#### 1. Criar novo componente `TransactionListPanel`

**Arquivo**: `src/components/finances/TransactionListPanel.tsx`

```typescript
interface TransactionListPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'income' | 'expense';
  transactions: Transaction[];
  total: number;
  onOrderClick?: (orderId: string) => void;
}
```

**Características**:
- Usa `ResponsivePanel` (bottom sheet no mobile, side panel no desktop)
- Título dinâmico: "Receitas" ou "Despesas"
- Card de resumo com total e contagem
- Lista de transações com:
  - Data formatada
  - Categoria (badge colorido)
  - Descrição
  - Valor
  - Link para pedido (se `order_id` existir)

#### 2. Modificar `src/pages/Finances.tsx`

**Novos estados**:
```typescript
const [transactionPanelOpen, setTransactionPanelOpen] = useState(false);
const [transactionPanelType, setTransactionPanelType] = useState<'income' | 'expense'>('income');
```

**Handlers**:
```typescript
const handleIncomeCardClick = () => {
  setTransactionPanelType('income');
  setTransactionPanelOpen(true);
};

const handleExpenseCardClick = () => {
  setTransactionPanelType('expense');
  setTransactionPanelOpen(true);
};
```

**Atualizar StatsCards** (linhas 560-579):
```typescript
<StatsCard
  title="Receitas"
  ...
  onClick={handleIncomeCardClick}  // Adicionar
/>
<StatsCard
  title="Despesas"
  ...
  onClick={handleExpenseCardClick}  // Adicionar
/>
```

**Adicionar componente no JSX**:
```typescript
<TransactionListPanel
  open={transactionPanelOpen}
  onOpenChange={setTransactionPanelOpen}
  type={transactionPanelType}
  transactions={filteredTransactions.filter(t => t.type === transactionPanelType)}
  total={transactionPanelType === 'income' ? totalIncome : totalExpenses}
  onOrderClick={handleOrderClick}
/>
```

### Fluxo de Interação

```text
Usuário toca em "Receitas"
       │
       ▼
setTransactionPanelType('income')
setTransactionPanelOpen(true)
       │
       ▼
ResponsivePanel abre com transações tipo='income'
       │
       ▼
Usuário pode:
  • Ver lista de receitas
  • Tocar em transação com pedido → navega para pedido
  • Fechar o painel
```

### Arquivos a Criar/Modificar

| Arquivo | Ação |
|---------|------|
| `src/components/finances/TransactionListPanel.tsx` | **Criar** |
| `src/pages/Finances.tsx` | **Modificar** |

### Benefícios

1. **Acesso rápido**: Ver detalhes de receitas/despesas com um toque
2. **Consistência**: Mesmo padrão do card "Lucro Bruto" (clique abre painel)
3. **Navegabilidade**: Links diretos para pedidos relacionados
4. **Mobile-first**: Usa ResponsivePanel otimizado para touch

