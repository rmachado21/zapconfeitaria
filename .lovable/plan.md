

## Janela de Confirmacao ao Adicionar Produto

### Objetivo
Substituir o "quick add" atual por um fluxo mais controlado onde o usuario define a quantidade antes de adicionar o produto ao pedido.

### Fluxo Proposto
```text
Usuario clica em [+] → Dialog abre com produto selecionado → Usuario ajusta quantidade → Clica "Adicionar" → Produto e adicionado
```

### Implementacao

#### 1. Criar Dialog de Quantidade

Novo componente `AddProductDialog` dentro do `ProductSelector.tsx`:

```text
+------------------------------------------+
|  [X]                                     |
|                                          |
|  [IMG]  Bolo Ninho/Nutella               |
|         R$ 97,00 / Kg                    |
|                                          |
|  Quantidade                              |
|  [-]  [ 1 ]  [+]                         |
|                                          |
|  Subtotal: R$ 97,00                      |
|                                          |
|  [     Adicionar ao Pedido     ]         |
+------------------------------------------+
```

#### 2. Alteracoes no ProductSelector.tsx

**Estado adicional:**
- `dialogProduct: Product | null` - produto selecionado para o dialog
- `dialogQuantity: number` - quantidade no dialog

**Remocao:**
- Painel sticky de quantidade (linhas 175-265) - nao sera mais necessario
- Estado `selectedProduct` pode ser substituido por `dialogProduct`

**Novo componente interno:**
```tsx
function AddProductDialog({ 
  product, 
  open, 
  onOpenChange, 
  onConfirm 
}: {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (quantity: number) => void;
}) {
  const [quantity, setQuantity] = useState(1);
  
  // Reset quantity quando produto muda
  useEffect(() => {
    if (product) {
      setQuantity(product.unit_type === "kg" ? 0.5 : 1);
    }
  }, [product]);

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle className="sr-only">Adicionar Produto</DialogTitle>
        </DialogHeader>
        
        {/* Product Info */}
        <div className="flex items-center gap-3">
          {product.photo_url ? (
            <img src={product.photo_url} className="h-16 w-16 rounded-lg object-cover" />
          ) : (
            <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
              <Package className="h-6 w-6 text-muted-foreground/30" />
            </div>
          )}
          <div>
            <p className="font-medium">{product.name}</p>
            <p className="text-sm text-muted-foreground">
              {formatCurrency(product.sale_price)} / {unitLabel}
            </p>
          </div>
        </div>
        
        {/* Quantity Controls */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Quantidade</label>
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="icon" onClick={() => decrementQty()}>
              <Minus className="h-4 w-4" />
            </Button>
            <Input 
              type="text" 
              inputMode="decimal"
              value={quantity} 
              onChange={handleQtyChange}
              className="w-20 text-center"
            />
            <Button variant="outline" size="icon" onClick={() => incrementQty()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Subtotal */}
        <div className="flex justify-between items-center py-2 border-t">
          <span className="text-sm text-muted-foreground">Subtotal</span>
          <span className="text-lg font-semibold">
            {formatCurrency(product.sale_price * quantity)}
          </span>
        </div>
        
        {/* Add Button */}
        <Button 
          onClick={() => {
            onConfirm(quantity);
            onOpenChange(false);
          }}
          className="w-full gap-2"
        >
          <Plus className="h-4 w-4" />
          Adicionar ao Pedido
        </Button>
      </DialogContent>
    </Dialog>
  );
}
```

#### 3. Mudanca no Fluxo de Adicao

**Antes (handleQuickAdd):**
```tsx
const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
  e.stopPropagation();
  const defaultQty = product.unit_type === "kg" ? 0.5 : 1;
  onAddProduct(product, defaultQty); // Adiciona direto
};
```

**Depois:**
```tsx
const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
  e.stopPropagation();
  setDialogProduct(product); // Abre dialog em vez de adicionar direto
};

const handleConfirmAdd = (quantity: number) => {
  if (dialogProduct) {
    onAddProduct(dialogProduct, quantity);
    setJustAdded(dialogProduct.id);
    setTimeout(() => setJustAdded(null), 800);
    setDialogProduct(null);
  }
};
```

#### 4. Simplificacao - Remover Painel Sticky

Como o dialog substitui o painel de quantidade, podemos remover:
- O estado `selectedProduct` e `quantity` (substituidos por `dialogProduct` e estado interno do dialog)
- O painel sticky (linhas 175-265)
- A logica de `handleProductClick` para selecionar produto

O clique no card pode ter dois comportamentos:
- **Opcao A:** Clique no card = abre dialog (mesmo que o botao +)
- **Opcao B:** Clique no card nao faz nada, apenas o botao + abre dialog

Recomendo a **Opcao A** para maior area de toque no mobile.

### Resumo das Alteracoes

| Arquivo | Alteracao |
|---------|-----------|
| `ProductSelector.tsx` | Criar AddProductDialog, remover painel sticky, unificar fluxo de adicao |

### Vantagens desta Abordagem

1. **Fluxo unico e consistente** - nao ha mais dois caminhos para adicionar produto
2. **Controle antes de adicionar** - usuario sempre ve a quantidade antes de confirmar
3. **Menos confusao** - painel sticky as vezes ficava fora da tela
4. **Padrao de mercado** - apps como iFood, Rappi usam esse pattern
5. **Codigo mais simples** - menos estados e menos logica condicional

### Secao Tecnica

#### Imports adicionais no ProductSelector.tsx
```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
```

#### Alteracao completa do ProductSelector

O componente sera reestruturado para:
1. Substituir `selectedProduct` por `dialogProduct`
2. Mover a logica de quantidade para dentro do dialog
3. Remover o bloco do painel sticky (linhas 175-265)
4. Adicionar o componente `AddProductDialog` ao final do JSX

