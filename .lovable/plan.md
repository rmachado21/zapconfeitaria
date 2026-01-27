

## Analise de UX: Tela "Novo Pedido" no Mobile

### Problemas Identificados

#### 1. Rolagem Aninhada (Nested Scrolling)
O modal usa `ResponsivePanel` que ja possui `overflow-y-auto` (linha 55), e dentro dele o `ProductSelector` tem seu proprio scroll com `max-h-[280px] overflow-y-auto` (linha 112). Isso cria dois niveis de rolagem, gerando confusao no usuario que nao sabe qual area esta sendo rolada.

#### 2. Cards de Produtos Grandes Demais
Cada card ocupa aproximadamente 120px de altura devido a:
- Imagem/placeholder: 48px (h-12)
- Margem inferior da imagem: 8px (mb-2)
- Nome do produto: 32px (min-h-[2rem])
- Linha de preco/badge: 20px
- Padding do card: 20px (p-2.5 = 10px top + 10px bottom)
- **Total aproximado: ~128px por card**

Com apenas 280px de altura disponivel, cabem cerca de 4 produtos visiveis (2 linhas de 2 colunas).

#### 3. Formulario Longo - Usuario Precisa Rolar Muito
O formulario tem muitas secoes:
1. Cliente (obrigatorio)
2. Produtos (obrigatorio) - area de selecao + lista de itens adicionados
3. Itens Adicionais
4. Data de Entrega
5. Horario
6. Endereco de Entrega
7. Taxa de Entrega
8. Observacoes
9. Resumo Total

O usuario precisa rolar muito para completar o pedido.

#### 4. Botao Quick Add Invisivel no Mobile
O botao de adicao rapida (`opacity-0 group-hover:opacity-100`) so aparece no hover, o que nao funciona em dispositivos touch. No mobile, o usuario precisa sempre clicar no card, esperar o painel de quantidade aparecer, e entao adicionar.

#### 5. Painel de Quantidade Fora do Contexto Visual
Quando um produto e selecionado, o painel de controle de quantidade aparece abaixo da grade de produtos, potencialmente fora da area visivel, forçando o usuario a rolar para ver e confirmar.

---

### Proposta de Melhorias

#### Melhoria 1: Eliminar Rolagem Aninhada
Remover `max-h-[280px] overflow-y-auto` do ProductSelector e deixar a rolagem ser gerenciada apenas pelo ResponsivePanel pai.

**Arquivos afetados:** `src/components/orders/ProductSelector.tsx`

**Alteracao:**
```tsx
// Linha 112 - Remover altura maxima e scroll interno
// De:
<div className="max-h-[280px] overflow-y-auto space-y-4 pr-1">

// Para:
<div className="space-y-4">
```

---

#### Melhoria 2: Layout Compacto para Cards de Produtos
Criar uma versao mais compacta dos cards, reduzindo a altura de ~128px para ~64px atraves de layout horizontal.

**Arquivos afetados:** `src/components/orders/ProductSelector.tsx`

**Alteracoes no ProductCard:**
- Layout horizontal em vez de vertical
- Imagem de 40x40 ao lado do texto
- Nome + preco na mesma linha
- Botao de adicao rapida sempre visivel no mobile

**Nova estrutura visual:**
```text
+------------------------------------------+
| [IMG] Bolo Ninho/Nutella   R$ 97,00  [+] |
|       Kg                                 |
+------------------------------------------+
```

---

#### Melhoria 3: Botao de Adicao Rapida Sempre Visivel no Mobile
Detectar se e mobile e mostrar o botao `+` sempre visivel em vez de apenas no hover.

**Arquivos afetados:** `src/components/orders/ProductSelector.tsx`

**Alteracao:**
```tsx
// Importar hook
import { useIsMobile } from "@/hooks/use-mobile";

// No ProductCard, passar isMobile como prop e ajustar:
className={cn(
  "absolute top-1.5 right-1.5 h-6 w-6 transition-opacity shadow-sm",
  isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"
)}
```

---

#### Melhoria 4: Painel de Quantidade Flutuante/Sticky
Quando um produto e selecionado, manter o painel de quantidade visivel fixo na parte inferior da area de produtos, evitando que o usuario precise rolar.

**Arquivos afetados:** `src/components/orders/ProductSelector.tsx`

**Alteracao estrutural:**
```tsx
<div className="space-y-3">
  {/* Search */}
  <div className="relative">...</div>
  
  {/* Wrapper com posicionamento relativo */}
  <div className="relative">
    {/* Product Grid */}
    <div className="space-y-4 pb-20"> {/* padding-bottom para nao sobrepor */}
      ...
    </div>
    
    {/* Quantity Controls - Sticky na base */}
    {selectedProduct && (
      <div className="sticky bottom-0 left-0 right-0 bg-background pt-2">
        <Card className="p-3 bg-primary/5 border-primary/20">
          ...
        </Card>
      </div>
    )}
  </div>
</div>
```

---

#### Melhoria 5: Secoes Colapsaveis (Accordion) para Campos Secundarios
Agrupar campos secundarios em accordions para reduzir a rolagem inicial.

**Arquivos afetados:** `src/components/orders/OrderFormDialog.tsx`

**Estrutura proposta:**
- **Campos sempre visiveis:** Cliente, Produtos, Itens Adicionados
- **Accordion "Entrega":** Data, Horario, Endereco, Taxa de Entrega
- **Accordion "Detalhes":** Observacoes

---

#### Melhoria 6: Grid de 3 Colunas para Produtos com Muitos Itens
Quando houver muitos produtos, usar 3 colunas em telas maiores para mostrar mais opcoes.

**Arquivos afetados:** `src/components/orders/ProductSelector.tsx`

**Alteracao:**
```tsx
// De:
<div className="grid grid-cols-2 gap-2">

// Para:
<div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
```

---

### Resumo das Alteracoes

| Arquivo | Alteracao |
|---------|-----------|
| `ProductSelector.tsx` | Remover scroll aninhado, cards compactos, botao + visivel no mobile, painel sticky |
| `OrderFormDialog.tsx` | Accordions para campos secundarios |

### Impacto Esperado

1. **Menos confusao de scroll:** Usuario tem apenas uma area de rolagem
2. **Mais produtos visiveis:** De 4 para 8-10 produtos visiveis simultaneamente
3. **Adicao mais rapida:** Botao + sempre acessivel no mobile
4. **Menos rolagem total:** Campos secundarios colapsados por padrao
5. **Contexto mantido:** Painel de quantidade sempre visivel quando produto selecionado

### Secao Tecnica - Implementacao Detalhada

#### ProductSelector.tsx - Cards Compactos

Nova estrutura do `ProductCard`:
```tsx
function ProductCard({ product, isSelected, isAdded, justAdded, onClick, onQuickAdd, isMobile }: ProductCardProps) {
  const unitLabel = product.unit_type === "kg" ? "Kg" : product.unit_type === "cento" ? "Cento" : "Un";

  return (
    <Card
      onClick={onClick}
      className={cn(
        "p-2 cursor-pointer transition-all duration-200 relative overflow-hidden group",
        "hover:shadow-md hover:border-primary/30",
        isSelected && "ring-2 ring-primary border-primary bg-primary/5",
        justAdded && "animate-pulse bg-success/20 ring-2 ring-success border-success",
        isAdded && !isSelected && !justAdded && "border-success/50 bg-success/5"
      )}
    >
      <div className="flex items-center gap-2">
        {/* Photo - Menor e lateral */}
        {product.photo_url ? (
          <div className="h-10 w-10 rounded-md overflow-hidden bg-muted shrink-0">
            <img src={product.photo_url} alt={product.name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="h-10 w-10 rounded-md bg-muted/50 flex items-center justify-center shrink-0">
            <Package className="h-4 w-4 text-muted-foreground/30" />
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium leading-tight line-clamp-1">{product.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs font-semibold text-primary">{formatCurrency(product.sale_price)}</span>
            <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">{unitLabel}</Badge>
          </div>
        </div>

        {/* Quick Add - Sempre visivel no mobile */}
        <Button
          type="button"
          size="icon"
          variant="default"
          className={cn(
            "h-7 w-7 shrink-0 shadow-sm",
            isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100 transition-opacity"
          )}
          onClick={onQuickAdd}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Added Indicator */}
      {isAdded && !justAdded && (
        <div className="absolute top-1 left-1">
          <div className="h-4 w-4 rounded-full bg-success flex items-center justify-center">
            <Check className="h-2.5 w-2.5 text-success-foreground" />
          </div>
        </div>
      )}

      {/* Just Added Animation */}
      {justAdded && (
        <div className="absolute inset-0 flex items-center justify-center bg-success/20 animate-fade-in">
          <div className="h-8 w-8 rounded-full bg-success flex items-center justify-center animate-scale-in">
            <Check className="h-4 w-4 text-success-foreground" />
          </div>
        </div>
      )}
    </Card>
  );
}
```

#### Altura Estimada dos Novos Cards
- Padding: 8px (p-2)
- Altura do conteudo: 40px (igual a imagem)
- **Total: ~56px por card** (reducao de 56% comparado aos 128px atuais)

Com isso, na mesma area de 280px cabem agora 5 linhas de produtos (10 produtos) em vez de 2 linhas (4 produtos).

