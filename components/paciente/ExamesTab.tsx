"use client";

import { useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Check,
  FileText,
  Loader2,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { CardHiro } from "@/components/ui/CardHiro";
import { OverlineLabel } from "@/components/ui/OverlineLabel";
import { iconCircleGlassOnLightCard } from "@/lib/iconCircleGlassStyles";
import { formatDateBR } from "@/lib/formatDate";
import { useConsultationStore } from "@/lib/store";
import type { Exam, SavedExam, TrackedMetric } from "@/lib/types";

export interface ExamResult {
  name: string;
  value: string;
  unit: string;
  reference?: string;
  status: "normal" | "alto" | "baixo";
}

interface ExamAnalysisState {
  examId: string;
  loading: boolean;
  results: ExamResult[];
  summary: string;
  error: string | null;
}

const STATUS_CONFIG = {
  normal: { label: "Normal", icon: Check, bg: "bg-[#D6E8DC]", text: "text-[#0F6E56]" },
  alto: { label: "Alto", icon: ArrowUp, bg: "bg-[#FAECE7]", text: "text-[#993C1D]" },
  baixo: { label: "Baixo", icon: ArrowDown, bg: "bg-[#FAEEDA]", text: "text-[#854F0B]" },
} as const;

const examTypeLabels: Record<Exam["type"], string> = {
  lab: "Laboratorial",
  imaging: "Imagem",
  report: "Laudo",
  other: "Outro",
};

interface ExamesTabProps {
  patientId: string;
}

export function ExamesTab({ patientId }: ExamesTabProps) {
  const patients = useConsultationStore((s) => s.patients);
  const updatePatient = useConsultationStore((s) => s.updatePatient);
  const patient = patients.find((p) => p.id === patientId);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFiles, setPendingFiles] = useState<{ id: string; fileName: string; type: Exam["type"] }[]>([]);
  const [fileMap, setFileMap] = useState<Map<string, File>>(new Map());
  const [analysis, setAnalysis] = useState<ExamAnalysisState | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [selectedForTracking, setSelectedForTracking] = useState<Set<string>>(new Set());
  const [trackingSaved, setTrackingSaved] = useState(false);
  const [viewingExam, setViewingExam] = useState<SavedExam | null>(null);

  if (!patient) return null;

  function appendFiles(files: FileList | null) {
    if (!files) return;
    const list = Array.from(files);
    const newEntries = list.map((file, i) => ({
      id: `upload-${Date.now()}-${i}`,
      fileName: file.name,
      type: (file.type.includes("image") ? "imaging" : "report") as Exam["type"],
    }));
    setPendingFiles((prev) => [...newEntries, ...prev]);
    setFileMap((prev) => {
      const next = new Map(prev);
      list.forEach((file, i) => next.set(newEntries[i].id, file));
      return next;
    });
  }

  async function handleAnalyze(file: File, fileId: string) {
    setAnalyzingId(fileId);
    setAnalysis({ examId: fileId, loading: true, results: [], summary: "", error: null });
    setSelectedForTracking(new Set());
    setTrackingSaved(false);

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const mediaType = file.type === "application/pdf" ? "application/pdf" : file.type === "image/png" ? "image/png" : "image/jpeg";

      const res = await fetch("/api/exam-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, mediaType }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Erro ao analisar exame");
      }

      const data = await res.json();
      const results: ExamResult[] = data.results ?? [];
      const summary: string = data.summary ?? "";

      setAnalysis({ examId: fileId, loading: false, results, summary, error: null });

      // Save to patient
      if (results.length > 0 && patient) {
        const savedExam: SavedExam = {
          id: `exam-${Date.now()}`,
          name: data.type === "hemograma" ? "Hemograma" : data.type === "bioquimica" ? "Bioquímica" : data.type === "urina" ? "Urina" : data.type === "hormonal" ? "Hormonal" : file.name.replace(/\.[^.]+$/, ""),
          examDate: data.examDate ?? null,
          uploadDate: new Date().toISOString().slice(0, 10),
          type: data.type ?? "outro",
          summary,
          results: results.map((r) => ({ name: r.name, value: r.value, unit: r.unit, reference: r.reference, status: r.status })),
        };
        const current = patient.savedExams ?? [];
        updatePatient(patient.id, { savedExams: [...current, savedExam] });
      }

      // Remove from pending
      setPendingFiles((prev) => prev.filter((f) => f.id !== fileId));
      setFileMap((prev) => { const n = new Map(prev); n.delete(fileId); return n; });
    } catch (err) {
      setAnalysis((prev) => prev ? { ...prev, loading: false, error: err instanceof Error ? err.message : "Erro" } : null);
    }
    setAnalyzingId(null);
  }

  function toggleTracking(name: string) {
    setSelectedForTracking((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
    setTrackingSaved(false);
  }

  function saveMetrics() {
    if (!analysis || selectedForTracking.size === 0 || !patient) return;
    const currentTracked: TrackedMetric[] = patient.trackedMetrics ?? [];
    const updated = [...currentTracked];
    const today = new Date().toISOString().slice(0, 10);

    for (const r of analysis.results) {
      if (!selectedForTracking.has(r.name)) continue;
      const numValue = parseFloat(r.value);
      if (isNaN(numValue)) continue;
      const idx = updated.findIndex((m) => m.name === r.name);
      if (idx >= 0) {
        updated[idx] = { ...updated[idx], history: [...updated[idx].history, { value: numValue, date: today }] };
      } else {
        updated.push({ name: r.name, unit: r.unit, referenceRange: r.reference, history: [{ value: numValue, date: today }] });
      }
    }
    updatePatient(patient.id, { trackedMetrics: updated });
    setTrackingSaved(true);
    setSelectedForTracking(new Set());
  }

  const savedExams = [...(patient?.savedExams ?? [])].sort((a, b) => {
    const da = a.examDate ?? a.uploadDate;
    const db = b.examDate ?? b.uploadDate;
    return new Date(db).getTime() - new Date(da).getTime();
  });

  return (
    <div className="space-y-4">
      {/* Upload */}
      <CardHiro className="rounded-2xl p-5">
        <OverlineLabel>ENVIAR EXAME</OverlineLabel>
        <div
          className="mt-3 flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-black/15 p-6 transition-colors hover:border-hiro-green/40 hover:bg-black/[0.02]"
          onDrop={(e) => { e.preventDefault(); appendFiles(e.dataTransfer.files); }}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-6 w-6 text-hiro-muted/50" />
          <p className="text-[13px] text-hiro-muted">Arraste ou clique para enviar</p>
          <p className="text-[11px] text-hiro-muted/60">PDF · JPG · PNG</p>
          <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" multiple onChange={(e) => appendFiles(e.target.files)} />
        </div>

        {/* Pending files */}
        {pendingFiles.length > 0 && (
          <div className="mt-3 space-y-2">
            {pendingFiles.map((f) => {
              const isThisAnalyzing = analyzingId === f.id;
              return (
                <div key={f.id} className="flex items-center gap-3 rounded-xl border border-black/[0.06] bg-white/40 px-3 py-2.5">
                  <FileText className="h-4 w-4 shrink-0 text-hiro-muted" strokeWidth={1.75} />
                  <p className="min-w-0 flex-1 truncate text-[12px] font-medium text-hiro-text">{f.fileName}</p>
                  <div className="flex items-center gap-2">
                    <button
                      className={`inline-flex items-center gap-1 text-[11px] font-medium transition-colors ${isThisAnalyzing ? "text-hiro-muted" : "text-hiro-green hover:underline"}`}
                      disabled={isThisAnalyzing}
                      onClick={() => { const file = fileMap.get(f.id); if (file) handleAnalyze(file, f.id); }}
                    >
                      {isThisAnalyzing ? <><Loader2 className="h-3 w-3 animate-spin" /> Analisando...</> : <><Sparkles className="h-3 w-3" strokeWidth={1.75} /> Analisar</>}
                    </button>
                    <button className="text-hiro-muted/30 hover:text-hiro-red" onClick={() => { setPendingFiles((prev) => prev.filter((x) => x.id !== f.id)); setFileMap((prev) => { const n = new Map(prev); n.delete(f.id); return n; }); }}>
                      <X className="h-3 w-3" strokeWidth={2} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Analysis result */}
        {analysis?.loading && (
          <div className="mt-4 flex items-center justify-center gap-2 py-3">
            <Loader2 className="h-5 w-5 animate-spin text-hiro-green" />
            <p className="text-[13px] text-hiro-muted">Analisando exame...</p>
          </div>
        )}
        {analysis?.error && (
          <div className="mt-3 rounded-xl border border-hiro-red/30 bg-hiro-red/10 px-4 py-3 text-[13px] text-hiro-red">{analysis.error}</div>
        )}
        {analysis && !analysis.loading && analysis.results.length > 0 && (
          <div className="mt-4 space-y-3">
            {analysis.summary && (
              <div className="rounded-xl border border-hiro-green/20 bg-hiro-green/5 px-4 py-3">
                <p className="text-[12px] font-medium text-hiro-green">Resumo</p>
                <p className="mt-1 text-[13px] leading-relaxed text-hiro-text">{analysis.summary}</p>
              </div>
            )}
            <div className="overflow-hidden rounded-xl border border-black/[0.06]">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b border-black/[0.06] bg-black/[0.02]">
                    <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-hiro-muted">Exame</th>
                    <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-hiro-muted">Valor</th>
                    <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-hiro-muted">Status</th>
                    <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-hiro-muted">Evolução</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.results.map((r, i) => {
                    const cfg = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.normal;
                    const Icon = cfg.icon;
                    const isNumeric = !isNaN(parseFloat(r.value));
                    return (
                      <tr key={i} className="border-b border-black/[0.04] last:border-0">
                        <td className="px-3 py-2">
                          <p className="font-medium text-hiro-text">{r.name}</p>
                          {r.reference && <p className="text-[11px] text-hiro-muted">Ref: {r.reference}</p>}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 tabular-nums text-hiro-text">{r.value} {r.unit}</td>
                        <td className="px-3 py-2">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${cfg.bg} ${cfg.text}`}>
                            <Icon className="h-3 w-3" strokeWidth={2} />{cfg.label}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          {isNumeric && (
                            <label className="flex cursor-pointer items-center gap-1.5">
                              <input type="checkbox" checked={selectedForTracking.has(r.name)} onChange={() => toggleTracking(r.name)} className="h-3.5 w-3.5 accent-hiro-green" />
                              <span className="text-[11px] text-hiro-muted">Acompanhar</span>
                            </label>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {selectedForTracking.size > 0 && (
              <button type="button" onClick={saveMetrics} className="w-full rounded-xl bg-[#2d5a47] py-2.5 text-[13px] font-medium text-white hover:bg-[#244a3b] active:scale-[0.98]">
                Adicionar {selectedForTracking.size} valor(es) à evolução
              </button>
            )}
            {trackingSaved && selectedForTracking.size === 0 && (
              <p className="text-center text-[12px] text-hiro-green">Valores adicionados à evolução.</p>
            )}
            {analysis.results.some((r) => r.status !== "normal") && (
              <div className="flex items-center gap-2 rounded-xl border border-hiro-amber/30 bg-[#FAEEDA]/50 px-4 py-2.5">
                <AlertTriangle className="h-4 w-4 shrink-0 text-hiro-amber" strokeWidth={1.75} />
                <p className="text-[12px] text-hiro-text">
                  {analysis.results.filter((r) => r.status !== "normal").length} valor(es) fora da faixa normal
                </p>
              </div>
            )}
          </div>
        )}
      </CardHiro>

      {/* Saved exams */}
      {savedExams.length > 0 && (
        <CardHiro className="rounded-2xl p-5">
          <OverlineLabel>EXAMES ANALISADOS</OverlineLabel>
          <div className="mt-3 space-y-2">
            {savedExams.map((exam) => (
              <div key={exam.id} className="flex items-center gap-3 rounded-xl border border-black/[0.06] bg-white/40 px-3 py-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={iconCircleGlassOnLightCard}>
                  <FileText className="h-4 w-4" strokeWidth={1.75} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-hiro-text">{exam.name}</p>
                  <p className="text-[11px] text-hiro-muted">
                    {exam.examDate ? formatDateBR(exam.examDate) : "Data não informada"} · {exam.results.length} {exam.results.length === 1 ? "valor" : "valores"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setViewingExam(exam)} className="text-[12px] font-medium text-hiro-green hover:underline">Ver análise</button>
                  <button type="button" onClick={() => { if (!patient) return; const u = (patient.savedExams ?? []).filter((e) => e.id !== exam.id); updatePatient(patient.id, { savedExams: u }); }} className="rounded-full p-0.5 text-hiro-muted/30 hover:text-hiro-red">
                    <X className="h-3 w-3" strokeWidth={2} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardHiro>
      )}

      {/* View exam modal */}
      {viewingExam && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border border-black/[0.08] bg-[#f0ede6] p-6 shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-serif text-xl font-normal text-hiro-text">{viewingExam.name}</h2>
                <p className="mt-0.5 text-[12px] text-hiro-muted">
                  {viewingExam.examDate ? `Realizado em ${formatDateBR(viewingExam.examDate)}` : "Data não informada"}
                  {" · Enviado em "}{formatDateBR(viewingExam.uploadDate)}
                </p>
              </div>
              <button type="button" onClick={() => setViewingExam(null)} className="rounded-full p-1.5 text-hiro-muted hover:bg-black/[0.04] hover:text-hiro-text">
                <X className="h-5 w-5" strokeWidth={1.75} />
              </button>
            </div>
            {viewingExam.summary && (
              <div className="mb-4 rounded-xl border border-hiro-green/20 bg-hiro-green/5 px-4 py-3">
                <p className="text-[12px] font-medium text-hiro-green">Resumo</p>
                <p className="mt-1 text-[13px] leading-relaxed text-hiro-text">{viewingExam.summary}</p>
              </div>
            )}
            <div className="overflow-hidden rounded-xl border border-black/[0.06]">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b border-black/[0.06] bg-black/[0.02]">
                    <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-hiro-muted">Exame</th>
                    <th className="px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wide text-hiro-muted">Valor</th>
                    <th className="px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wide text-hiro-muted">Referência</th>
                  </tr>
                </thead>
                <tbody>
                  {viewingExam.results.map((r, i) => {
                    const isAbnormal = r.status === "alto" || r.status === "baixo";
                    return (
                      <tr key={i} className="border-b border-black/[0.04] last:border-0">
                        <td className="px-3 py-2 text-hiro-text">{r.name}</td>
                        <td className={`px-3 py-2 text-right tabular-nums ${isAbnormal ? "font-medium text-hiro-red" : "text-hiro-text"}`}>{r.value} {r.unit}</td>
                        <td className="px-3 py-2 text-right text-hiro-muted">{r.reference ?? "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
