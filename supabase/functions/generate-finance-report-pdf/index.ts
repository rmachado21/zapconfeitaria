import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { jsPDF } from "https://esm.sh/jspdf@2.5.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReportRequest {
  period: 'week' | 'month' | 'year' | 'all';
  periodLabel: string;
  periodDates: { start: string; end: string };
  summary: {
    balance: number;
    totalIncome: number;
    totalExpenses: number;
    grossProfit: { profit: number; margin: number; revenue: number; costs: number };
  };
  transactions: Array<{
    id: string;
    date: string;
    type: 'income' | 'expense';
    description: string | null;
    category: string | null;
    amount: number;
    order_id: string | null;
    order_number: number | null;
  }>;
  expensesByCategory: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  } catch {
    return dateString;
  }
};

// Parse category from description if not provided
const parseCategory = (description: string | null, providedCategory: string | null): { category: string; cleanDesc: string } => {
  if (providedCategory) {
    // If category is provided, clean the description
    if (description && description.startsWith(providedCategory + ' - ')) {
      return { category: providedCategory, cleanDesc: description.substring(providedCategory.length + 3) };
    }
    return { category: providedCategory, cleanDesc: description || 'Sem descrição' };
  }
  
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
    
    const contentType = response.headers.get('content-type') || 'image/png';
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.error('Error fetching image:', error);
    return null;
  }
};

// Draw table header (reusable for pagination)
const drawTableHeader = (doc: jsPDF, yPos: number, margin: number, tableWidth: number, col1W: number, col2W: number, col3W: number): number => {
  const headerHeight = 10;
  
  doc.setFillColor(180, 100, 70);
  doc.roundedRect(margin, yPos, tableWidth, headerHeight, 1.5, 1.5, "F");
  
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  const headerTextY = yPos + 7;
  doc.text("Data", margin + 2, headerTextY);
  doc.text("Categoria", margin + col1W + 2, headerTextY);
  doc.text("Descrição", margin + col1W + col2W + 2, headerTextY);
  doc.text("Valor", margin + col1W + col2W + col3W + 2, headerTextY);
  
  return yPos + headerHeight + 1;
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Generate finance report PDF function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      console.error("No authorization header");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error("User error:", userError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json() as ReportRequest;
    const { period, periodLabel, periodDates, summary, transactions, expensesByCategory } = body;

    console.log("Generating finance report for period:", period, "with", transactions.length, "transactions");

    // Fetch user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("company_name, logo_url")
      .eq("user_id", user.id)
      .single();

    // Generate PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPos = 15;

    // Header with logo or company name
    const companyName = profile?.company_name || "Confeitaria Pro";
    let hasLogo = false;
    
    if (profile?.logo_url) {
      try {
        const logoBase64 = await fetchImageAsBase64(profile.logo_url);
        if (logoBase64) {
          const logoWidth = 50;
          const logoHeight = 18.75;
          const logoX = (pageWidth - logoWidth) / 2;
          doc.addImage(logoBase64, 'PNG', logoX, yPos, logoWidth, logoHeight);
          yPos += logoHeight + 6;
          hasLogo = true;
        }
      } catch (error) {
        console.error('Error adding logo to PDF:', error);
      }
    }

    if (!hasLogo) {
      doc.setFontSize(20);
      doc.setTextColor(51, 51, 51);
      doc.text(companyName, pageWidth / 2, yPos + 5, { align: "center" });
      yPos += 12;
    }

    // Report title
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text("RELATÓRIO FINANCEIRO", pageWidth / 2, yPos, { align: "center" });
    yPos += 6;

    // Period
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    const periodText = periodDates.start === periodDates.end 
      ? periodLabel 
      : `${periodLabel} (${periodDates.start} - ${periodDates.end})`;
    doc.text(periodText, pageWidth / 2, yPos, { align: "center" });
    yPos += 10;

    // Line separator
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;

    // Summary Cards (4 cards in a row)
    const cardWidth = (pageWidth - margin * 2 - 9) / 4; // 3px gap between cards
    const cardHeight = 22;
    const cards = [
      { label: 'Saldo', value: summary.balance, color: summary.balance >= 0 ? [34, 197, 94] : [234, 179, 8] },
      { label: 'Receitas', value: summary.totalIncome, color: [34, 197, 94] },
      { label: 'Despesas', value: summary.totalExpenses, color: [239, 68, 68] },
      { label: 'Lucro Bruto', value: summary.grossProfit.profit, color: summary.grossProfit.profit >= 0 ? [34, 197, 94] : [234, 179, 8] },
    ];

    cards.forEach((card, i) => {
      const x = margin + i * (cardWidth + 3);
      
      // Card background
      doc.setFillColor(250, 250, 250);
      doc.roundedRect(x, yPos, cardWidth, cardHeight, 2, 2, "F");
      doc.setDrawColor(230, 230, 230);
      doc.roundedRect(x, yPos, cardWidth, cardHeight, 2, 2, "S");
      
      // Label
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(card.label, x + cardWidth / 2, yPos + 7, { align: "center" });
      
      // Value
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(card.color[0], card.color[1], card.color[2]);
      doc.text(formatCurrency(card.value), x + cardWidth / 2, yPos + 16, { align: "center" });
      doc.setFont("helvetica", "normal");
    });

    yPos += cardHeight + 8;

    // Gross Profit Details Section
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(80, 80, 80);
    doc.text("Detalhamento do Lucro Bruto", margin, yPos);
    yPos += 5;

    const detailBoxWidth = (pageWidth - margin * 2 - 6) / 4;
    const detailBoxHeight = 16;
    const grossProfitDetails = [
      { label: 'Faturamento', value: summary.grossProfit.revenue, color: [34, 197, 94] },
      { label: 'Custo Produtos', value: summary.grossProfit.costs, color: [239, 68, 68] },
      { label: 'Lucro Bruto', value: summary.grossProfit.profit, color: summary.grossProfit.profit >= 0 ? [34, 197, 94] : [234, 179, 8] },
      { label: 'Margem', value: null, percentage: summary.grossProfit.margin, color: [100, 100, 100] },
    ];

    grossProfitDetails.forEach((detail, i) => {
      const x = margin + i * (detailBoxWidth + 2);
      
      doc.setFillColor(248, 248, 248);
      doc.roundedRect(x, yPos, detailBoxWidth, detailBoxHeight, 1.5, 1.5, "F");
      
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(120, 120, 120);
      doc.text(detail.label, x + detailBoxWidth / 2, yPos + 5, { align: "center" });
      
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(detail.color[0], detail.color[1], detail.color[2]);
      const valueText = detail.percentage !== undefined 
        ? `${detail.percentage.toFixed(1)}%`
        : formatCurrency(detail.value!);
      doc.text(valueText, x + detailBoxWidth / 2, yPos + 12, { align: "center" });
    });

    yPos += detailBoxHeight + 10;

    // Transactions Table
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(51, 51, 51);
    doc.text("Transações", margin, yPos);
    yPos += 6;

    // Table dimensions
    const tableWidth = pageWidth - margin * 2;
    const col1W = tableWidth * 0.12; // Data
    const col2W = tableWidth * 0.22; // Categoria
    const col3W = tableWidth * 0.42; // Descrição
    const col4W = tableWidth * 0.24; // Valor
    const rowHeight = 7;

    // Draw initial header
    yPos = drawTableHeader(doc, yPos, margin, tableWidth, col1W, col2W, col3W);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);

    // All transactions with proper pagination
    transactions.forEach((t, i) => {
      // Check if we need a new page
      if (yPos > pageHeight - 40) {
        doc.addPage();
        yPos = 20;
        // Redraw header on new page
        yPos = drawTableHeader(doc, yPos, margin, tableWidth, col1W, col2W, col3W);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
      }

      // Alternating background
      if (i % 2 === 0) {
        doc.setFillColor(255, 255, 255);
      } else {
        doc.setFillColor(250, 248, 245);
      }
      doc.rect(margin, yPos - 3.5, tableWidth, rowHeight, "F");

      // Parse category and clean description
      const { category, cleanDesc } = parseCategory(t.description, t.category);

      // Date
      doc.setTextColor(80, 80, 80);
      doc.text(formatDate(t.date), margin + 2, yPos + 1);

      // Category
      if (category) {
        if (t.type === 'income') {
          doc.setTextColor(34, 197, 94);
        } else {
          doc.setTextColor(239, 68, 68);
        }
        doc.text(category.substring(0, 18), margin + col1W + 2, yPos + 1);
      } else {
        if (t.type === 'income') {
          doc.setTextColor(34, 197, 94);
          doc.text("Receita", margin + col1W + 2, yPos + 1);
        } else {
          doc.setTextColor(239, 68, 68);
          doc.text("Despesa", margin + col1W + 2, yPos + 1);
        }
      }

      // Description with order number if available
      doc.setTextColor(60, 60, 60);
      let descText = cleanDesc.substring(0, 38);
      if (t.order_number) {
        const orderSuffix = ` (#${String(t.order_number).padStart(4, '0')})`;
        if (descText.length + orderSuffix.length > 42) {
          descText = cleanDesc.substring(0, 38 - orderSuffix.length) + orderSuffix;
        } else {
          descText = descText + orderSuffix;
        }
      }
      doc.text(descText, margin + col1W + col2W + 2, yPos + 1);

      // Amount
      if (t.type === 'income') {
        doc.setTextColor(34, 197, 94);
        doc.text(`+ ${formatCurrency(t.amount)}`, margin + col1W + col2W + col3W + 2, yPos + 1);
      } else {
        doc.setTextColor(239, 68, 68);
        doc.text(`- ${formatCurrency(t.amount)}`, margin + col1W + col2W + col3W + 2, yPos + 1);
      }

      yPos += rowHeight;
    });

    yPos += 8;

    // Expenses by Category (if there are expenses and space allows)
    if (expensesByCategory.length > 0) {
      // Check if we need a new page
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(51, 51, 51);
      doc.text("Despesas por Categoria", margin, yPos);
      yPos += 6;

      // Category table header
      const catTableWidth = pageWidth - margin * 2;
      const catCol1W = catTableWidth * 0.50;
      const catCol2W = catTableWidth * 0.30;
      const catCol3W = catTableWidth * 0.20;

      doc.setFillColor(100, 100, 100);
      doc.roundedRect(margin, yPos, catTableWidth, 10, 1.5, 1.5, "F");
      
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      const catHeaderTextY = yPos + 7;
      doc.text("Categoria", margin + 3, catHeaderTextY);
      doc.text("Valor", margin + catCol1W + 3, catHeaderTextY);
      doc.text("%", margin + catCol1W + catCol2W + 3, catHeaderTextY);
      yPos += 11;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);

      expensesByCategory.forEach((cat, i) => {
        // Check if we need a new page
        if (yPos > pageHeight - 20) {
          doc.addPage();
          yPos = 20;
        }

        if (i % 2 === 0) {
          doc.setFillColor(255, 255, 255);
        } else {
          doc.setFillColor(250, 248, 245);
        }
        doc.rect(margin, yPos - 4, catTableWidth, rowHeight, "F");

        doc.setTextColor(60, 60, 60);
        doc.text(cat.category, margin + 3, yPos + 1);
        doc.setTextColor(239, 68, 68);
        doc.text(formatCurrency(cat.amount), margin + catCol1W + 3, yPos + 1);
        doc.setTextColor(100, 100, 100);
        doc.text(`${cat.percentage.toFixed(1)}%`, margin + catCol1W + catCol2W + 3, yPos + 1);

        yPos += rowHeight;
      });
    }

    // Footer on last page
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      const now = new Date();
      const footerText = `Gerado em ${now.toLocaleDateString("pt-BR")} às ${now.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })} - ${companyName}`;
      doc.text(footerText, pageWidth / 2, pageHeight - 8, { align: "center" });
      doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: "right" });
    }

    // Generate base64
    const pdfOutput = doc.output("datauristring");
    const now = new Date();
    const fileName = `relatorio-financeiro-${period}-${now.toISOString().split('T')[0]}.pdf`;

    console.log("Finance report PDF generated successfully with", transactions.length, "transactions across", totalPages, "pages");

    return new Response(
      JSON.stringify({ pdf: pdfOutput, fileName }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error generating finance report PDF:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro ao gerar relatório PDF";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
