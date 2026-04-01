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

// ─── Colours ──────────────────────────────────────────────────────────────────
const C = {
  green:    [45, 92, 63]   as [number, number, number],
  text:     [28, 43, 30]   as [number, number, number],
  muted:    [107, 122, 109]as [number, number, number],
  divider:  [210, 215, 210]as [number, number, number],
  white:    [255, 255, 255]as [number, number, number],
  lightBg:  [247, 249, 247]as [number, number, number],
};

export function generateProntuarioPDF(data: ProntuarioData): void {
  const doc  = new jsPDF({ unit: "mm", format: "a4" });
  const PW   = doc.internal.pageSize.getWidth();
  const PH   = doc.internal.pageSize.getHeight();
  const ML   = 22;          // left margin
  const MR   = 22;          // right margin
  const CW   = PW - ML - MR;
  let y      = 0;

  // ── helpers ──────────────────────────────────────────────────────────────

  const setStyle = (
    size: number,
    weight: "normal" | "bold" | "italic" | "bolditalic" = "normal",
    color: [number, number, number] = C.text,
  ) => {
    doc.setFontSize(size);
    doc.setFont("helvetica", weight);
    doc.setTextColor(...color);
  };

  /** Wrap + print text, return the height consumed (mm). */
  const printText = (
    text: string,
    size: number,
    weight: "normal" | "bold" | "italic" | "bolditalic" = "normal",
    color: [number, number, number] = C.text,
    lineHeightFactor = 1.55,
    indent = 0,
  ): number => {
    setStyle(size, weight, color);
    const maxW  = CW - indent;
    const lines = doc.splitTextToSize(text, maxW) as string[];
    const lh    = (size * 0.352778) * lineHeightFactor; // pt→mm * factor
    lines.forEach((line, i) => {
      checkBreak(lh + (i === 0 ? 0 : 0));
      doc.text(line, ML + indent, y);
      y += lh;
    });
    return lines.length * lh;
  };

  const gap = (mm: number) => { y += mm; };

  const hRule = (color: [number, number, number] = C.divider, lw = 0.25) => {
    doc.setDrawColor(...color);
    doc.setLineWidth(lw);
    doc.line(ML, y, PW - MR, y);
    gap(4);
  };

  const checkBreak = (needed = 18) => {
    if (y + needed > PH - 18) {
      doc.addPage();
      y = 22;
    }
  };

  // ── Green header banner ───────────────────────────────────────────────────
  doc.setFillColor(...C.green);
  doc.rect(0, 0, PW, 15, "F");

  setStyle(12, "bold", C.white);
  doc.text("hiro.", ML, 10);
  setStyle(8, "normal", [180, 210, 190] as [number, number, number]);
  doc.text("AI Medical Scribe", ML + 15, 10);

  // right-aligned date
  setStyle(8, "normal", [180, 210, 190] as [number, number, number]);
  doc.text(data.date, PW - MR, 10, { align: "right" });

  y = 23;

  // ── Document title ────────────────────────────────────────────────────────
  printText("Relatório Clínico", 18, "normal", C.green);
  gap(1);
  printText(data.patientName, 14, "bold", C.text);
  gap(1);
  printText(
    `${data.doctorName}  ·  ${data.date}  ·  ${data.duration} min`,
    8.5,
    "normal",
    C.muted,
  );
  gap(5);
  hRule(C.divider, 0.4);

  // ── Patient summary strip ─────────────────────────────────────────────────
  const stripH = 16;
  doc.setFillColor(...C.lightBg);
  doc.roundedRect(ML, y - 1, CW, stripH, 2, 2, "F");
  y += 3;

  printText(`Paciente: ${data.patientName}, ${data.patientAge} anos`, 9, "bold", C.text);
  gap(-1);

  if (data.confirmedCids.length > 0) {
    const cidStr = data.confirmedCids.map((c) => `${c.code} — ${c.name}`).join("  ·  ");
    printText(`CID-10: ${cidStr}`, 8.5, "normal", C.muted);
    gap(-1);
  }

  if (data.medications && data.medications.length > 0) {
    printText(`Em uso: ${data.medications.join(", ")}`, 8.5, "normal", C.muted);
  }

  gap(9);
  hRule(C.divider, 0.25);

  // ── Narrative body ────────────────────────────────────────────────────────
  // Each SOAP block is printed as a soft labelled paragraph — no heavy
  // dividers, text flows naturally like a clinical report.

  const sections: { label: string; text: string }[] = [
    { label: "Queixa e história",         text: data.soap.s },
    { label: "Achados clínicos",          text: data.soap.o },
    { label: "Impressão diagnóstica",     text: data.soap.a },
    { label: "Conduta e orientações",     text: data.soap.p },
  ];

  for (const { label, text } of sections) {
    if (!text?.trim()) continue;
    checkBreak(28);

    // Section label — small caps style, muted green
    printText(label.toUpperCase(), 7.5, "bold", C.green, 1.3);
    gap(1.5);

    // Body paragraph
    printText(text.trim(), 10.5, "normal", C.text, 1.6);
    gap(7);
  }

  hRule(C.divider, 0.25);

  // ── Footer on every page ──────────────────────────────────────────────────
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    setStyle(7.5, "normal", C.muted);
    doc.text(
      `Gerado pelo Hiro AI Medical Scribe  ·  Documento de uso clínico`,
      ML,
      PH - 10,
    );
    doc.text(`${i} / ${total}`, PW - MR, PH - 10, { align: "right" });
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  const safeName = data.patientName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const safeDate = data.date.replace(/\//g, "-");
  doc.save(`relatorio-${safeName || "paciente"}-${safeDate}.pdf`);
}
