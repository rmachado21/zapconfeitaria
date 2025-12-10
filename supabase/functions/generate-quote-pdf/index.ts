import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { jsPDF } from "https://esm.sh/jspdf@2.5.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface QuoteRequest {
  orderId: string;
}

interface OrderItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  unit_type: string;
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

    const { orderId }: QuoteRequest = await req.json();
    console.log("Generating PDF for order:", orderId);

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
      .select("company_name, logo_url, pix_key, bank_details, include_terms_in_pdf")
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

    // Items table - improved styling
    const tableWidth = pageWidth - margin * 2;
    const col1Width = tableWidth * 0.50; // Produto
    const col2Width = tableWidth * 0.15; // Qtd
    const col3Width = tableWidth * 0.17; // Unit
    const col4Width = tableWidth * 0.18; // Total

    // Table header with warm color
    doc.setFillColor(245, 240, 235);
    doc.setDrawColor(200, 190, 180);
    doc.rect(margin, yPos - 5, tableWidth, 10, "FD");
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(80, 70, 60);
    doc.text("Produto", margin + 4, yPos);
    doc.text("Qtd", margin + col1Width + 4, yPos);
    doc.text("Unit.", margin + col1Width + col2Width + 4, yPos);
    doc.text("Total", margin + col1Width + col2Width + col3Width + 4, yPos);
    yPos += 8;

    // Items with alternating row colors
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(51, 51, 51);
    
    for (let i = 0; i < typedOrder.order_items.length; i++) {
      const item = typedOrder.order_items[i];
      const itemTotal = item.quantity * item.unit_price;
      const unitLabel = formatUnitType(item.unit_type || 'unit');
      
      // Alternating row background
      if (i % 2 === 1) {
        doc.setFillColor(252, 250, 248);
        doc.rect(margin, yPos - 4, tableWidth, 7, "F");
      }
      
      doc.text(item.product_name.substring(0, 40), margin + 4, yPos);
      doc.text(`${item.quantity} ${unitLabel}`, margin + col1Width + 4, yPos);
      doc.text(formatCurrency(item.unit_price), margin + col1Width + col2Width + 4, yPos);
      doc.text(formatCurrency(itemTotal), margin + col1Width + col2Width + col3Width + 4, yPos);
      yPos += 7;
    }

    yPos += 3;
    doc.setDrawColor(200, 190, 180);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 8;

    // Totals - aligned to the right
    const totalsX = margin + col1Width + col2Width;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const subtotal = typedOrder.order_items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0
    );
    doc.text("Subtotal:", totalsX, yPos);
    doc.text(formatCurrency(subtotal), margin + col1Width + col2Width + col3Width + 4, yPos);
    yPos += 6;

    if (typedOrder.delivery_fee > 0) {
      doc.text("Taxa de Entrega:", totalsX, yPos);
      doc.text(formatCurrency(typedOrder.delivery_fee), margin + col1Width + col2Width + col3Width + 4, yPos);
      yPos += 6;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("TOTAL:", totalsX, yPos);
    doc.text(formatCurrency(typedOrder.total_amount), margin + col1Width + col2Width + col3Width + 4, yPos);
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
      const terms = [
        "TERMOS DE SERVIÇO:",
        "• O pedido será confirmado após o pagamento de 50% do valor total (sinal).",
        "• O restante deve ser pago na entrega/retirada do pedido.",
        "• Cancelamentos com menos de 48h de antecedência não terão reembolso do sinal.",
        "• Alterações devem ser solicitadas com pelo menos 72h de antecedência.",
      ];
      for (const term of terms) {
        doc.text(term, margin, yPos);
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

    // Convert to base64
    const pdfBase64 = doc.output("datauristring");

    console.log("PDF generated successfully");

    return new Response(
      JSON.stringify({
        pdf: pdfBase64,
        fileName: `orcamento-${typedOrder.client?.name?.replace(/\s+/g, "-") || "cliente"}-${new Date().toISOString().split("T")[0]}.pdf`,
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
