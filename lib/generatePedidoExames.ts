import jsPDF from "jspdf";

interface PedidoExamesData {
  patientName: string;
  patientAge: number;
  doctorName: string;
  crm: string;
  uf: string;
  exames: string[];
  indicacaoClinica: string;
}

export function generatePedidoExamesPDF(data: PedidoExamesData) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pw = doc.internal.pageSize.getWidth();
  const margin = 25;
  const usable = pw - margin * 2;
  let y = 30;

  // Header
  doc.setFillColor(45, 92, 63);
  doc.rect(0, 0, pw, 18, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text("SOLICITAÇÃO DE EXAMES", pw / 2, 11, { align: "center" });

  // Date
  y = 28;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  const dateStr = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  doc.text(`Data: ${dateStr}`, pw - margin, y, { align: "right" });

  // Patient
  y = 40;
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text("PACIENTE", margin, y);
  y += 6;
  doc.setFontSize(12);
  doc.setTextColor(30, 30, 30);
  doc.setFont("helvetica", "bold");
  doc.text(data.patientName, margin, y);
  y += 5;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(`${data.patientAge} anos`, margin, y);

  // Divider
  y += 8;
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, y, pw - margin, y);

  // Exams
  y += 10;
  doc.setFontSize(9);
  doc.setTextColor(45, 92, 63);
  doc.setFont("helvetica", "bold");
  doc.text("EXAMES SOLICITADOS", margin, y);
  y += 8;

  data.exames.forEach((exame) => {
    if (y > 240) {
      doc.addPage();
      y = 25;
    }
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);
    doc.setFont("helvetica", "normal");
    doc.text(`•  ${exame}`, margin + 2, y);
    y += 7;
  });

  // Clinical indication
  if (data.indicacaoClinica.trim()) {
    y += 6;
    doc.setFontSize(9);
    doc.setTextColor(45, 92, 63);
    doc.setFont("helvetica", "bold");
    doc.text("INDICAÇÃO CLÍNICA", margin, y);
    y += 7;
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(data.indicacaoClinica, usable);
    doc.text(lines, margin, y);
    y += lines.length * 5;
  }

  // Footer divider
  y = Math.max(y + 10, 230);
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, y, pw - margin, y);

  // Doctor signature
  y += 10;
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);
  doc.setFont("helvetica", "bold");
  doc.text(data.doctorName, pw / 2, y, { align: "center" });
  y += 5;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(`CRM: ${data.crm} - ${data.uf}`, pw / 2, y, { align: "center" });

  // Watermark
  y += 12;
  doc.setFontSize(8);
  doc.setTextColor(180, 180, 180);
  doc.text("Gerado por hiro. — AI Medical Scribe", pw / 2, y, { align: "center" });

  const slug = data.patientName.toLowerCase().replace(/\s+/g, "-").slice(0, 30);
  doc.save(`pedido-exames-${slug}-${new Date().toISOString().slice(0, 10)}.pdf`);
}
