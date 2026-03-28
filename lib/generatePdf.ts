import jsPDF from "jspdf";

export interface ProntuarioData {
  patientName: string;
  patientAge: number;
  date: string;
  doctorName: string;
  duration: number;
  soap: {
    s: string;
    o: string;
    a: string;
    p: string;
  };
  confirmedCids: { code: string; name: string }[];
  medications?: string[];
}

export function generateProntuarioPDF(data: ProntuarioData): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  const addText = (
    text: string,
    size: number,
    bold = false,
    color: [number, number, number] = [28, 43, 30],
  ) => {
    doc.setFontSize(size);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setTextColor(color[0], color[1], color[2]);
    const lines = doc.splitTextToSize(text, contentWidth);
    doc.text(lines, margin, y);
    y += lines.length * size * 0.4 + 2;
  };

  const addSpacer = (height = 6) => {
    y += height;
  };

  const addDivider = () => {
    doc.setDrawColor(200, 200, 195);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    addSpacer(5);
  };

  const checkPageBreak = (needed = 20) => {
    if (y + needed > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      y = 20;
    }
  };

  doc.setFillColor(45, 92, 63);
  doc.rect(0, 0, pageWidth, 16, "F");
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("hiro.", margin, 10.5);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("AI Medical Scribe", margin + 14, 10.5);

  y = 26;

  addText(`Prontuário — ${data.patientName}`, 16, true);
  addSpacer(2);
  addText(
    `${data.date}  ·  ${data.doctorName}  ·  ${data.duration} min de gravação`,
    9,
    false,
    [107, 122, 109],
  );
  addSpacer(4);
  addDivider();

  addText("Dados do paciente", 10, true, [107, 122, 109]);
  addSpacer(3);
  addText(`${data.patientName}  ·  ${data.patientAge} anos`, 11);

  if (data.confirmedCids.length > 0) {
    addSpacer(2);
    addText(
      `CIDs: ${data.confirmedCids.map((c) => `${c.code} — ${c.name}`).join("  ·  ")}`,
      10,
      false,
      [107, 122, 109],
    );
  }

  if (data.medications && data.medications.length > 0) {
    addSpacer(2);
    addText(`Medicamentos em uso: ${data.medications.join("; ")}`, 10, false, [107, 122, 109]);
  }

  addSpacer(4);
  addDivider();

  const soapSections: { key: keyof ProntuarioData["soap"]; label: string }[] = [
    { key: "s", label: "S — Subjetivo" },
    { key: "o", label: "O — Objetivo" },
    { key: "a", label: "A — Avaliação" },
    { key: "p", label: "P — Plano" },
  ];

  for (const section of soapSections) {
    checkPageBreak(30);
    addText(section.label, 10, true, [107, 122, 109]);
    addSpacer(2);
    addText(data.soap[section.key]?.trim() ? data.soap[section.key] : "—", 11);
    addSpacer(6);
  }

  addDivider();

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(107, 122, 109);
    doc.text(
      `Gerado pelo Hiro AI Medical Scribe  ·  ${data.date}`,
      margin,
      doc.internal.pageSize.getHeight() - 10,
    );
    doc.text(
      `${i} / ${totalPages}`,
      pageWidth - margin,
      doc.internal.pageSize.getHeight() - 10,
      { align: "right" },
    );
  }

  const safeName = data.patientName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const safeDate = data.date.replace(/\//g, "-");
  const fileName = `prontuario-${safeName || "paciente"}-${safeDate}.pdf`;
  doc.save(fileName);
}
