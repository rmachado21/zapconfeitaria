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
      .select("company_name, logo_url, pix_key, bank_details")
      .eq("user_id", user.id)
      .single();

    const typedOrder = order as Order;
    const typedProfile = profile as Profile | null;

    // Generate PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = 20;

    // Header - Company Name
    doc.setFontSize(24);
    doc.setTextColor(51, 51, 51);
    const companyName = typedProfile?.company_name || "Confeitaria Pro";
    doc.text(companyName, pageWidth / 2, yPos, { align: "center" });
    yPos += 15;

    // Quote title
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text("ORÇAMENTO", pageWidth / 2, yPos, { align: "center" });
    yPos += 5;

    // Line separator
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 15;

    // Client info
    doc.setFontSize(11);
    doc.setTextColor(51, 51, 51);
    doc.text(`Cliente: ${typedOrder.client?.name || "N/A"}`, margin, yPos);
    yPos += 7;
    if (typedOrder.client?.phone) {
      doc.text(`Telefone: ${typedOrder.client.phone}`, margin, yPos);
      yPos += 7;
    }
    doc.text(`Data de Entrega: ${formatDate(typedOrder.delivery_date)}`, margin, yPos);
    yPos += 7;
    if (typedOrder.delivery_address) {
      doc.text(`Endereço: ${typedOrder.delivery_address}`, margin, yPos);
      yPos += 7;
    }
    yPos += 10;

    // Items table header
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, yPos - 5, pageWidth - margin * 2, 10, "F");
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Produto", margin + 5, yPos);
    doc.text("Qtd", pageWidth - 80, yPos);
    doc.text("Unit.", pageWidth - 55, yPos);
    doc.text("Total", pageWidth - 30, yPos);
    yPos += 10;

    // Items
    doc.setFont("helvetica", "normal");
    for (const item of typedOrder.order_items) {
      const itemTotal = item.quantity * item.unit_price;
      doc.text(item.product_name.substring(0, 35), margin + 5, yPos);
      doc.text(item.quantity.toString(), pageWidth - 80, yPos);
      doc.text(formatCurrency(item.unit_price), pageWidth - 55, yPos);
      doc.text(formatCurrency(itemTotal), pageWidth - 30, yPos);
      yPos += 8;
    }

    yPos += 5;
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;

    // Totals
    doc.setFont("helvetica", "normal");
    const subtotal = typedOrder.order_items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0
    );
    doc.text("Subtotal:", pageWidth - 80, yPos);
    doc.text(formatCurrency(subtotal), pageWidth - 30, yPos);
    yPos += 7;

    if (typedOrder.delivery_fee > 0) {
      doc.text("Taxa de Entrega:", pageWidth - 80, yPos);
      doc.text(formatCurrency(typedOrder.delivery_fee), pageWidth - 30, yPos);
      yPos += 7;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("TOTAL:", pageWidth - 80, yPos);
    doc.text(formatCurrency(typedOrder.total_amount), pageWidth - 30, yPos);
    yPos += 15;

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

    // Terms
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
