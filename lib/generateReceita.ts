import jsPDF from "jspdf";

export interface Medicamento {
  nome: string;
  dosagem: string;
  posologia: string;
  quantidade: string;
}

interface ReceitaData {
  patientName: string;
  doctorName: string;
  crm: string;
  uf: string;
  medicamentos: Medicamento[];
  clinicAddress?: string;
  rqe?: string;
  especialidade?: string;
}

export function generateReceitaPDF(data: ReceitaData) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pw = doc.internal.pageSize.getWidth();
  const margin = 25;
  const usable = pw - margin * 2;
  let y = 30;

  const GREEN = "#2d5c3f";

  // Header
  doc.setFillColor(45, 92, 63);
  doc.rect(0, 0, pw, 18, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text("RECEITUÁRIO MÉDICO", pw / 2, 11, { align: "center" });

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

  if (data.clinicAddress) {
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    const addrLines = doc.splitTextToSize(data.clinicAddress, usable / 1.6);
    doc.text(addrLines, margin, y);
    y += addrLines.length * 4;
  }

  // Patient
  y = Math.max(y + 4, 40);
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text("PACIENTE", margin, y);
  y += 6;
  doc.setFontSize(12);
  doc.setTextColor(30, 30, 30);
  doc.setFont("helvetica", "bold");
  doc.text(data.patientName, margin, y);

  // Divider
  y += 8;
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, y, pw - margin, y);

  // Prescription items
  y += 10;
  doc.setFontSize(9);
  doc.setTextColor(...hexToRgb(GREEN));
  doc.setFont("helvetica", "bold");
  doc.text("PRESCRIÇÃO", margin, y);
  y += 8;

  data.medicamentos.forEach((med, i) => {
    if (y > 255) {
      doc.addPage();
      y = 25;
    }

    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);
    doc.setFont("helvetica", "bold");
    doc.text(`${i + 1}. ${med.nome}${med.dosagem ? ` ${med.dosagem}` : ""}`, margin + 2, y);
    y += 6;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    if (med.posologia) {
      const lines = doc.splitTextToSize(med.posologia, usable - 6);
      doc.text(lines, margin + 6, y);
      y += lines.length * 5;
    }
    if (med.quantidade) {
      doc.text(`Quantidade: ${med.quantidade}`, margin + 6, y);
      y += 5;
    }
    y += 6;
  });

  // Footer divider
  y = Math.max(y, 230);
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
  if (data.rqe) {
    y += 5;
    const rqeLine = data.especialidade
      ? `RQE: ${data.rqe} - ${data.especialidade}`
      : `RQE: ${data.rqe}`;
    doc.text(rqeLine, pw / 2, y, { align: "center" });
  }

  // hiro watermark
  y += 12;
  doc.setFontSize(8);
  doc.setTextColor(180, 180, 180);
  doc.text("Gerado por hiro. — AI Medical Scribe", pw / 2, y, { align: "center" });

  const slug = data.patientName.toLowerCase().replace(/\s+/g, "-").slice(0, 30);
  doc.save(`receita-${slug}-${new Date().toISOString().slice(0, 10)}.pdf`);
}

function hexToRgb(hex: string): [number, number, number] {
  const c = hex.replace("#", "");
  return [
    parseInt(c.slice(0, 2), 16),
    parseInt(c.slice(2, 4), 16),
    parseInt(c.slice(4, 6), 16),
  ];
}
