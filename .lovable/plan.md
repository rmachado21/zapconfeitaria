

## Plano: Melhorias no Relatório Financeiro PDF

### Análise do Estado Atual

Analisando o PDF atual (imagem) e comparando com os componentes implementados recentemente:

| Aspecto | PDF Atual | TransactionListPanel / GrossProfitDetailDialog |
|---------|-----------|------------------------------------------------|
| **Categorias** | Não mostra categoria nas transações | Badge colorido com categoria |
| **Link Pedido** | Não indica qual pedido | Mostra número do pedido (#0042) |
| **Lucro Bruto** | Card simples só com valor | Cards detalhados: Faturamento, Custo, Lucro, Margem |
| **Organização** | Transações misturadas | Separação clara e resumos visuais |

### Melhorias Propostas

#### 1. Adicionar Categoria nas Transações

**Situação atual**: A tabela mostra apenas "Receita" ou "Despesa" na coluna Tipo.

**Melhoria**: Mostrar a categoria extraída da descrição (ex: "Insumos", "Embalagens", "Sinal", "Pagamento Final").

```text
Antes:  | 05/03/2026 | Despesa | Insumos - Shopping do Confeiteiro | -R$ 118,95 |
Depois: | 05/03/2026 | Insumos | Shopping do Confeiteiro            | -R$ 118,95 |
```

#### 2. Incluir Número do Pedido nas Receitas

**Situação atual**: Descrição mostra "Sinal 50% - Raquel Vitoria" sem referência ao pedido.

**Melhoria**: Para transações com `order_id`, mostrar o número do pedido.

```text
Antes:  Sinal 50% - Raquel Vitoria
Depois: Sinal 50% - Raquel Vitoria (#0042)
```

#### 3. Expandir Seção de Lucro Bruto

**Situação atual**: Apenas um card com o valor do lucro bruto e margem ao lado.

**Melhoria**: Adicionar mini-seção de detalhamento similar ao GrossProfitDetailDialog.

```text
┌────────────────────────────────────────────────────┐
│ Lucro Bruto                                        │
├────────────────────────────────────────────────────┤
│ Faturamento: R$ 234,50   │ Custo Produtos: R$ 112  │
│ Lucro Bruto: R$ 122,50   │ Margem: 52.2%           │
└────────────────────────────────────────────────────┘
```

#### 4. Melhorar Formatação da Coluna "Tipo"

Trocar de "Receita/Despesa" genérico para a categoria específica da transação.

#### 5. Paginação Aprimorada

**Situação atual**: Limita a 25 transações e mostra "... e mais X transações".

**Melhoria**: Implementar paginação real com múltiplas páginas, incluindo header da tabela em cada página.

### Alterações Técnicas

#### Arquivo: `supabase/functions/generate-finance-report-pdf/index.ts`

##### 1. Atualizar interface para incluir `order_number` e `category`:
```typescript
interface ReportRequest {
  // ...
  transactions: Array<{
    id: string;
    date: string;
    type: 'income' | 'expense';
    description: string | null;
    category: string | null;  // Nova propriedade
    amount: number;
    order_id: string | null;
    order_number: number | null;  // Nova propriedade
  }>;
}
```

##### 2. Adicionar função para extrair categoria da descrição:
```typescript
const parseCategory = (description: string | null): { category: string; cleanDesc: string } => {
  if (!description) return { category: '', cleanDesc: 'Sem descrição' };
  const dashIndex = description.indexOf(' - ');
  if (dashIndex > 0) {
    const potentialCategory = description.substring(0, dashIndex);
    const knownCategories = ['Insumos', 'Embalagens', 'Combustível', 'Equipamentos', 
                            'Marketing', 'Aluguel', 'Sinal', 'Sinal 50%', 
                            'Pagamento Final', 'Venda Avulsa', 'Outros'];
    if (knownCategories.some(c => potentialCategory.includes(c))) {
      return { 
        category: potentialCategory, 
        cleanDesc: description.substring(dashIndex + 3) 
      };
    }
  }
  return { category: '', cleanDesc: description };
};
```

##### 3. Modificar tabela de transações para usar categoria:
- Coluna "Tipo" → exibe a categoria (ex: "Insumos", "Sinal 50%")
- Descrição mais limpa (sem repetir a categoria)
- Adicionar número do pedido quando disponível

##### 4. Adicionar seção expandida de Lucro Bruto:
```typescript
// Após os 4 cards de resumo, adicionar mini-tabela
const grossProfitDetails = [
  { label: 'Faturamento', value: summary.grossProfit.revenue },
  { label: 'Custo Produtos', value: summary.grossProfit.costs },
  { label: 'Lucro Bruto', value: summary.grossProfit.profit },
];
```

##### 5. Implementar paginação real:
```typescript
// Remover limite fixo de 25
// Adicionar lógica para nova página quando yPos > pageHeight - 50
// Redesenhar header da tabela em cada nova página
```

#### Arquivo: `src/hooks/useFinanceReportPdf.ts` e `src/pages/Finances.tsx`

Atualizar a construção do objeto `ReportData` para incluir:
- `category` extraída de cada transação
- `order_number` buscando do `orderNumberMap`

### Estrutura Visual Proposta

```text
┌─────────────────────────────────────────────────────────────┐
│                    [LOGO]                                   │
│              RELATÓRIO FINANCEIRO                           │
│         Este Mês (01/02/2026 - 28/02/2026)                 │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │  Saldo   │ │ Receitas │ │ Despesas │ │L. Bruto  │       │
│  │-R$ 27,70 │ │ R$ 400   │ │ R$ 427   │ │R$ 122,50 │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                             │
│  Detalhamento Lucro Bruto                                   │
│  ┌──────────────────────┬──────────────────────┐           │
│  │ Faturamento R$ 234   │ Custo Prod. R$ 112   │           │
│  │ Lucro Bruto R$ 122   │ Margem 52.2%         │           │
│  └──────────────────────┴──────────────────────┘           │
│                                                             │
│  Transações                                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Data      │ Categoria       │ Descrição        │Valor│  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ 05/03/26  │ Insumos         │ Shopping Conf.   │-119 │  │
│  │ 02/02/26  │ Sinal 50%       │ Raquel V. #0042  │ +91 │  │
│  │ 02/02/26  │ Pagto Final     │ Kelly M. #0038   │+105 │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Despesas por Categoria (já existente, mantém)             │
└─────────────────────────────────────────────────────────────┘
```

### Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `supabase/functions/generate-finance-report-pdf/index.ts` | Adicionar parseCategory, seção Lucro Bruto, paginação |
| `src/hooks/useFinanceReportPdf.ts` | Incluir category e order_number no ReportData |
| `src/pages/Finances.tsx` | Passar dados expandidos para o hook de PDF |

### Benefícios

1. **Informação mais rica**: Categoria e número do pedido facilitam rastreabilidade
2. **Consistência visual**: PDF reflete a mesma organização da interface web
3. **Detalhamento do Lucro**: Usuário entende composição do lucro bruto no PDF
4. **Relatório completo**: Paginação permite exportar todas as transações

