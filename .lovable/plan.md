

## Adicionar Ícone do Pix no PDF do Orçamento

### Objetivo
Melhorar a experiência visual do PDF incluindo o ícone oficial do Pix ao lado da chave Pix, facilitando a identificação rápida do método de pagamento.

### Abordagem

O jsPDF permite inserir imagens via `addImage()`. Para adicionar o ícone do Pix, vou:

1. **Incorporar o ícone como SVG convertido para base64** - O ícone do Pix é simples o suficiente para ser representado como path ou incorporado como imagem PNG.

2. **Posicionar ao lado do texto "Chave Pix"** - O ícone ficará à esquerda do texto.

### Layout Proposto

```text
Dados para Pagamento:
[PIX ICON] Chave Pix: email@exemplo.com
Banco XYZ - Ag 1234 - CC 56789-0
```

### Alterações

**Arquivo:** `supabase/functions/generate-quote-pdf/index.ts`

1. Adicionar constante com o ícone Pix em base64 (PNG ou desenho via paths)
2. Modificar a seção de pagamento (linha 436) para incluir o ícone

**Implementação:**

```typescript
// Adicionar constante no topo do arquivo
const PIX_ICON_BASE64 = "data:image/png;base64,..."; // Ícone Pix verde oficial

// Na seção de pagamento (linha 436):
if (typedProfile.pix_key) {
  // Desenhar ícone do Pix
  const pixIconSize = 5;
  doc.addImage(PIX_ICON_BASE64, 'PNG', margin, yPos - 4, pixIconSize, pixIconSize);
  
  // Texto ao lado do ícone
  doc.text(`Chave Pix: ${typedProfile.pix_key}`, margin + pixIconSize + 2, yPos);
  yPos += 7;
}
```

### Alternativa: Desenhar Ícone com Shapes

Se a imagem base64 aumentar muito o tamanho do arquivo, posso usar as funções de desenho do jsPDF para criar uma representação simplificada do ícone Pix usando `doc.setFillColor()` e `doc.circle()` ou `doc.triangle()`.

### Resultado Visual Esperado

O PDF terá:
- Ícone Pix verde (cor oficial #32BCAD ou similar) de 5mm
- Texto "Chave Pix: [valor]" alinhado verticalmente com o ícone
- Melhor escaneabilidade do documento

### Arquivo Afetado

| Arquivo | Alteração |
|---------|-----------|
| `supabase/functions/generate-quote-pdf/index.ts` | Adicionar ícone Pix na seção de dados de pagamento |

