import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { jsPDF } from "https://esm.sh/jspdf@2.5.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface QuoteRequest {
  orderId: string;
  saveToStorage?: boolean;
}

interface OrderItem {
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  unit_type: string;
  is_gift: boolean;
}

interface Order {
  id: string;
  delivery_date: string | null;
  delivery_address: string | null;
  delivery_fee: number;
  total_amount: number;
  notes: string | null;
  created_at: string;
  client: {
    name: string;
    phone: string | null;
  } | null;
  order_items: OrderItem[];
}

interface Profile {
  company_name: string | null;
  logo_url: string | null;
  pix_key: string | null;
  bank_details: string | null;
  include_terms_in_pdf: boolean;
  custom_terms: string | null;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const formatDate = (dateString: string | null): string => {
  if (!dateString) return "A definir";
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatUnitType = (type: string): string => {
  if (type === 'kg') return 'Kg';
  if (type === 'cento') return 'Cento';
  return 'Un';
};

// Fetch image as base64 for PDF embedding
const fetchImageAsBase64 = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const buffer = await response.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    
    // Detect image type
    const contentType = response.headers.get('content-type') || 'image/png';
    const format = contentType.includes('jpeg') || contentType.includes('jpg') ? 'JPEG' : 'PNG';
    
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.error('Error fetching image:', error);
    return null;
  }
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Generate quote PDF function called");

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      console.error("No authorization header");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user from token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error("User error:", userError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { orderId, saveToStorage = false } = body as QuoteRequest;

    // Input validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!orderId || typeof orderId !== 'string' || !uuidRegex.test(orderId)) {
      console.error('Invalid orderId format:', orderId);
      return new Response(
        JSON.stringify({ error: 'Invalid orderId format. Must be a valid UUID.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (saveToStorage !== undefined && typeof saveToStorage !== 'boolean') {
      console.error('Invalid saveToStorage type:', typeof saveToStorage);
      return new Response(
        JSON.stringify({ error: 'saveToStorage must be a boolean.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Generating PDF for order:", orderId, "saveToStorage:", saveToStorage);

    // Fetch order with client and items
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        *,
        client:clients(name, phone),
        order_items(*)
      `)
      .eq("id", orderId)
      .eq("user_id", user.id)
      .single();

    if (orderError || !order) {
      console.error("Order error:", orderError);
      return new Response(JSON.stringify({ error: "Pedido não encontrado" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("company_name, logo_url, pix_key, bank_details, include_terms_in_pdf, custom_terms")
      .eq("user_id", user.id)
      .single();

    const typedOrder = order as Order;
    const typedProfile = profile as Profile | null;

    // Generate PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = 20;

    // Header with logo or company name
    const companyName = typedProfile?.company_name || "Confeitaria Pro";
    let hasLogo = false;
    
    if (typedProfile?.logo_url) {
      try {
        const logoBase64 = await fetchImageAsBase64(typedProfile.logo_url);
        if (logoBase64) {
          // Logo dimensions in PDF: width 60mm, height auto
          const logoWidth = 60;
          const logoHeight = 22.5; // Assuming 8:3 aspect ratio
          const logoX = (pageWidth - logoWidth) / 2;
          doc.addImage(logoBase64, 'PNG', logoX, yPos, logoWidth, logoHeight);
          yPos += logoHeight + 8;
          hasLogo = true;
        }
      } catch (error) {
        console.error('Error adding logo to PDF:', error);
      }
    }

    // Only show company name text if no logo was added
    if (!hasLogo) {
      doc.setFontSize(24);
      doc.setTextColor(51, 51, 51);
      doc.text(companyName, pageWidth / 2, yPos, { align: "center" });
      yPos += 12;
    }

    // Quote title
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text("ORÇAMENTO", pageWidth / 2, yPos, { align: "center" });
    yPos += 8;

    // Line separator
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 12;

    // Client info
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(`Cliente: ${typedOrder.client?.name || "N/A"}`, margin, yPos);
    yPos += 6;
    if (typedOrder.client?.phone) {
      doc.text(`Telefone: ${typedOrder.client.phone}`, margin, yPos);
      yPos += 6;
    }
    doc.text(`Data de Entrega: ${formatDate(typedOrder.delivery_date)}`, margin, yPos);
    yPos += 6;
    if (typedOrder.delivery_address) {
      doc.text(`Endereço: ${typedOrder.delivery_address}`, margin, yPos);
      yPos += 6;
    }
    yPos += 8;

    // Items table - improved styling with borders
    const tableWidth = pageWidth - margin * 2;
    const col1Width = tableWidth * 0.45; // Produto
    const col2Width = tableWidth * 0.15; // Qtd
    const col3Width = tableWidth * 0.20; // Unit
    const col4Width = tableWidth * 0.20; // Total
    const rowHeight = 10;

    // Table header with terracotta color and rounded top corners
    const cornerRadius = 1.5;
    doc.setFillColor(180, 100, 70);
    
    // Draw header with rounded top corners
    doc.roundedRect(margin, yPos - 5, tableWidth, rowHeight, cornerRadius, cornerRadius, "F");
    // Cover bottom rounded corners with a rectangle
    doc.rect(margin, yPos - 5 + cornerRadius, tableWidth, rowHeight - cornerRadius, "F");
    
    // Header text in white
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("Produto", margin + 5, yPos + 1);
    doc.text("Qtd", margin + col1Width + 5, yPos + 1);
    doc.text("Unit.", margin + col1Width + col2Width + 5, yPos + 1);
    doc.text("Total", margin + col1Width + col2Width + col3Width + 5, yPos + 1);
    yPos += rowHeight + 2;

    // Items with borders
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    
    const tableStartY = yPos - 5;
    
    for (let i = 0; i < typedOrder.order_items.length; i++) {
      const item = typedOrder.order_items[i];
      const itemTotal = item.quantity * item.unit_price;
      const unitLabel = formatUnitType(item.unit_type || 'unit');
      const isGift = item.is_gift;
      const isAdditional = item.product_id === null;
      
      // Alternating row background
      if (isGift) {
        doc.setFillColor(220, 252, 231); // Green tint for gifts
        doc.rect(margin, yPos - 5, tableWidth, rowHeight, "F");
      } else if (i % 2 === 0) {
        doc.setFillColor(255, 255, 255);
        doc.rect(margin, yPos - 5, tableWidth, rowHeight, "F");
      } else {
        doc.setFillColor(250, 248, 245);
        doc.rect(margin, yPos - 5, tableWidth, rowHeight, "F");
      }
      
      // Product name with BRINDE or ADICIONAL tag
      if (isGift) {
        doc.setTextColor(22, 163, 74); // Green for gifts
        doc.text(`${item.product_name.substring(0, 28)} [BRINDE]`, margin + 5, yPos + 1);
      } else if (isAdditional) {
        doc.setTextColor(100, 100, 100); // Muted gray for additional items
        doc.text(`${item.product_name.substring(0, 26)} [ADICIONAL]`, margin + 5, yPos + 1);
      } else {
        doc.setTextColor(60, 60, 60);
        doc.text(item.product_name.substring(0, 35), margin + 5, yPos + 1);
      }
      
      doc.setTextColor(60, 60, 60);
      doc.text(`${item.quantity} ${unitLabel}`, margin + col1Width + 5, yPos + 1);
      doc.text(formatCurrency(item.unit_price), margin + col1Width + col2Width + 5, yPos + 1);
      
      // For gifts: show strikethrough price and R$ 0,00
      if (isGift) {
        const priceX = margin + col1Width + col2Width + col3Width + 5;
        doc.setTextColor(150, 150, 150);
        const priceText = formatCurrency(itemTotal);
        doc.text(priceText, priceX, yPos + 1);
        const priceWidth = doc.getTextWidth(priceText);
        doc.setLineWidth(0.3);
        doc.setDrawColor(150, 150, 150);
        doc.line(priceX, yPos, priceX + priceWidth, yPos);
        doc.setTextColor(22, 163, 74);
        doc.text("R$ 0,00", priceX + priceWidth + 2, yPos + 1);
      } else {
        doc.text(formatCurrency(itemTotal), margin + col1Width + col2Width + col3Width + 5, yPos + 1);
      }
      
      yPos += rowHeight;
    }

    const tableEndY = yPos - 5;

    // Draw table borders with rounded corners
    doc.setDrawColor(200, 190, 180);
    doc.setLineWidth(0.5);
    
    // Outer border with rounded corners
    doc.roundedRect(margin, tableStartY, tableWidth, tableEndY - tableStartY, cornerRadius, cornerRadius, "S");
    
    // Column separators (shorter to not overlap with rounded corners)
    const separatorStartY = tableStartY + cornerRadius;
    const separatorEndY = tableEndY - cornerRadius;
    doc.line(margin + col1Width, separatorStartY, margin + col1Width, separatorEndY);
    doc.line(margin + col1Width + col2Width, separatorStartY, margin + col1Width + col2Width, separatorEndY);
    doc.line(margin + col1Width + col2Width + col3Width, separatorStartY, margin + col1Width + col2Width + col3Width, separatorEndY);

    yPos += 5;

    // Totals - aligned to the right
    const totalsX = margin + col1Width + col2Width;
    const totalsValueX = margin + col1Width + col2Width + col3Width + 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    
    // Calculate subtotal and gift discount
    const fullSubtotal = typedOrder.order_items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0
    );
    const giftDiscount = typedOrder.order_items.reduce(
      (sum, item) => item.is_gift ? sum + item.quantity * item.unit_price : sum,
      0
    );
    const subtotal = fullSubtotal - giftDiscount;
    
    // Show gift discount if there are gifts
    if (giftDiscount > 0) {
      doc.text("Subtotal:", totalsX, yPos);
      doc.text(formatCurrency(fullSubtotal), totalsValueX, yPos);
      yPos += 7;
      
      doc.setTextColor(22, 163, 74);
      doc.text("Brinde:", totalsX, yPos);
      doc.text(`- ${formatCurrency(giftDiscount)}`, totalsValueX, yPos);
      doc.setTextColor(60, 60, 60);
      yPos += 7;
    }
    
    // Only show subtotal line when there's delivery fee or gifts
    if (typedOrder.delivery_fee > 0 || giftDiscount > 0) {
      doc.text("Subtotal Produtos:", totalsX, yPos);
      doc.text(formatCurrency(subtotal), totalsValueX, yPos);
      yPos += 7;
    }

    if (typedOrder.delivery_fee > 0) {
      doc.text("Taxa de Entrega:", totalsX, yPos);
      doc.text(formatCurrency(typedOrder.delivery_fee), totalsValueX, yPos);
      yPos += 7;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(180, 100, 70); // Terracotta color for TOTAL
    doc.text("TOTAL:", totalsX, yPos);
    doc.text(formatCurrency(typedOrder.total_amount), totalsValueX, yPos);
    doc.setTextColor(60, 60, 60);
    yPos += 12;

    // Deposit info
    const depositAmount = typedOrder.total_amount / 2;
    doc.setFillColor(255, 243, 224);
    doc.rect(margin, yPos - 5, pageWidth - margin * 2, 20, "F");
    doc.setFontSize(11);
    doc.setTextColor(180, 83, 9);
    doc.text(`Sinal (50%): ${formatCurrency(depositAmount)}`, margin + 5, yPos + 3);
    doc.setFontSize(9);
    doc.text("*Pagamento do sinal necessário para confirmação do pedido", margin + 5, yPos + 12);
    yPos += 25;

    // Payment details
    if (typedProfile?.pix_key || typedProfile?.bank_details) {
      doc.setTextColor(51, 51, 51);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Dados para Pagamento:", margin, yPos);
      yPos += 8;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      if (typedProfile.pix_key) {
        doc.text(`Chave Pix: ${typedProfile.pix_key}`, margin, yPos);
        yPos += 7;
      }

      if (typedProfile.bank_details) {
        const bankLines = typedProfile.bank_details.split("\n");
        for (const line of bankLines) {
          doc.text(line, margin, yPos);
          yPos += 6;
        }
      }
      yPos += 10;
    }

    // Notes
    if (typedOrder.notes) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Observações:", margin, yPos);
      yPos += 7;
      doc.setFont("helvetica", "normal");
      doc.text(typedOrder.notes.substring(0, 100), margin, yPos);
      yPos += 15;
    }

    // Terms (only if enabled)
    const includeTerms = typedProfile?.include_terms_in_pdf ?? true;
    if (includeTerms) {
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      
      // Use custom terms if provided, otherwise use default
      const defaultTerms = [
        "TERMOS DE SERVIÇO:",
        "• O pedido será confirmado após o pagamento de 50% do valor total (sinal).",
        "• O restante deve ser pago na entrega/retirada do pedido.",
        "• Cancelamentos com menos de 48h de antecedência não terão reembolso do sinal.",
        "• Alterações devem ser solicitadas com pelo menos 72h de antecedência.",
      ];
      
      let terms: string[];
      if (typedProfile?.custom_terms && typedProfile.custom_terms.trim()) {
        terms = ["TERMOS DE SERVIÇO:", ...typedProfile.custom_terms.split("\n").filter(line => line.trim())];
      } else {
        terms = defaultTerms;
      }
      
      for (const term of terms) {
        doc.text(term.substring(0, 90), margin, yPos);
        yPos += 5;
      }
    }

    // Footer
    yPos = doc.internal.pageSize.getHeight() - 15;
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Orçamento gerado em ${new Date().toLocaleDateString("pt-BR")} - ${companyName}`,
      pageWidth / 2,
      yPos,
      { align: "center" }
    );

    // Convert to base64 and arraybuffer
    const pdfBase64 = doc.output("datauristring");
    const fileName = `orcamento-${typedOrder.client?.name?.replace(/\s+/g, "-") || "cliente"}-${new Date().toISOString().split("T")[0]}.pdf`;

    let publicUrl: string | null = null;

    // Save to storage if requested (for WhatsApp sharing)
    if (saveToStorage) {
      try {
        // Convert base64 to Uint8Array
        const base64Data = pdfBase64.split(",")[1];
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        // Upload to storage
        const storagePath = `${user.id}/${orderId}-${Date.now()}.pdf`;
        const { error: uploadError } = await supabase.storage
          .from("quote-pdfs")
          .upload(storagePath, bytes, {
            contentType: "application/pdf",
            upsert: true,
          });

        if (uploadError) {
          console.error("Error uploading PDF to storage:", uploadError);
        } else {
          // Get public URL
          const { data: urlData } = supabase.storage
            .from("quote-pdfs")
            .getPublicUrl(storagePath);
          
          publicUrl = urlData.publicUrl;
          console.log("PDF uploaded to storage:", publicUrl);
        }
      } catch (storageError) {
        console.error("Error saving PDF to storage:", storageError);
      }
    }

    console.log("PDF generated successfully");

    return new Response(
      JSON.stringify({
        pdf: pdfBase64,
        fileName,
        publicUrl,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Error generating PDF:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro ao gerar PDF";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
