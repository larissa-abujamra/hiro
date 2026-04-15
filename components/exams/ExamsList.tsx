"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Calendar,
  Eye,
  FileText,
  Loader2,
  Sparkles,
  Trash2,
} from "lucide-react";
import { formatDateBR } from "@/lib/formatDate";
import { ExamViewerModal, type ExamRecord } from "@/components/exams/ExamViewerModal";

interface ExamsListProps {
  patientId: string;
  consultationId?: string;
  onAnalyze?: (exam: ExamRecord, analysis: string) => void;
  compact?: boolean;
  /**
   * Bump this number to force a reload of the list from the server
   * (e.g. after an external upload).
   */
  reloadKey?: number;
}

export function ExamsList({
  patientId,
  consultationId,
  onAnalyze,
  compact = false,
  reloadKey = 0,
}: ExamsListProps) {
  const [exams, setExams] = useState<ExamRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [viewingExam, setViewingExam] = useState<ExamRecord | null>(null);

  const loadExams = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ patient_id: patientId });
      if (consultationId) params.set("consultation_id", consultationId);
      const response = await fetch(`/api/exams?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setExams(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("[ExamsList] Error loading exams:", error);
    } finally {
      setIsLoading(false);
    }
  }, [patientId, consultationId]);

  useEffect(() => {
    loadExams();
  }, [loadExams, reloadKey]);

  async function analyzeExam(exam: ExamRecord) {
    setAnalyzingId(exam.id);
    try {
      const response = await fetch(`/api/exams/${exam.id}/analyze`, {
        method: "POST",
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        console.error("[ExamsList] Analyze failed:", err);
        return;
      }
      const { analysis } = await response.json();

      setExams((prev) =>
        prev.map((e) => (e.id === exam.id ? { ...e, analysis } : e)),
      );
      setViewingExam((current) =>
        current && current.id === exam.id ? { ...current, analysis } : current,
      );

      onAnalyze?.(exam, analysis);
    } catch (error) {
      console.error("[ExamsList] Error analyzing exam:", error);
    } finally {
      setAnalyzingId(null);
    }
  }

  async function deleteExam(examId: string) {
    if (
      typeof window !== "undefined" &&
      !window.confirm("Tem certeza que deseja excluir este exame?")
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/exams/${examId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setExams((prev) => prev.filter((e) => e.id !== examId));
        setViewingExam((current) =>
          current && current.id === examId ? null : current,
        );
      }
    } catch (error) {
      console.error("[ExamsList] Error deleting exam:", error);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-hiro-green" />
      </div>
    );
  }

  if (exams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-6 text-hiro-muted">
        <FileText className="h-8 w-8 opacity-40" strokeWidth={1.5} />
        <p className="text-[12px]">Nenhum exame cadastrado</p>
      </div>
    );
  }

  return (
    <>
      <div
        className={`space-y-2 ${compact ? "" : "max-h-[24rem] overflow-auto pr-1"}`}
      >
        {exams.map((exam) => {
          const isAnalyzing = analyzingId === exam.id;
          const dateLabel = exam.exam_date
            ? formatDateBR(exam.exam_date)
            : exam.created_at
              ? formatDateBR(exam.created_at)
              : "—";

          return (
            <div
              key={exam.id}
              className="rounded-xl border border-black/[0.06] bg-white/50 p-3 transition-shadow hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-hiro-green/10">
                    <FileText
                      className="h-4 w-4 text-hiro-green"
                      strokeWidth={1.75}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-hiro-text">
                      {exam.name}
                    </p>
                    <div className="mt-0.5 flex items-center gap-1 text-[11px] text-hiro-muted">
                      <Calendar className="h-3 w-3" strokeWidth={1.75} />
                      <span>{dateLabel}</span>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setViewingExam(exam)}
                    className="rounded-lg p-1.5 text-hiro-muted/60 transition-colors hover:bg-black/[0.04] hover:text-hiro-green"
                    title="Visualizar"
                  >
                    <Eye className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </button>

                  {!exam.analysis && (
                    <button
                      type="button"
                      onClick={() => analyzeExam(exam)}
                      disabled={isAnalyzing}
                      className="inline-flex items-center gap-1 rounded-lg bg-hiro-amber/15 px-2 py-1 text-[11px] font-medium text-hiro-amber transition-colors hover:bg-hiro-amber/25 disabled:opacity-50"
                      title="Analisar com IA"
                    >
                      {isAnalyzing ? (
                        <Loader2 className="h-3 w-3 animate-spin" strokeWidth={2} />
                      ) : (
                        <Sparkles className="h-3 w-3" strokeWidth={1.75} />
                      )}
                      <span>Analisar</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => deleteExam(exam.id)}
                    className="rounded-lg p-1.5 text-hiro-muted/60 transition-colors hover:bg-hiro-red/10 hover:text-hiro-red"
                    title="Excluir"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </button>
                </div>
              </div>

              {exam.analysis && (
                <div className="mt-3 border-t border-black/[0.04] pt-3">
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-hiro-amber" strokeWidth={1.75} />
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-hiro-muted">
                      Análise IA
                    </span>
                  </div>
                  <p className="line-clamp-4 whitespace-pre-wrap text-[12px] leading-relaxed text-hiro-muted">
                    {exam.analysis}
                  </p>
                  <button
                    type="button"
                    onClick={() => setViewingExam(exam)}
                    className="mt-1 text-[11px] font-medium text-hiro-green hover:underline"
                  >
                    Ver análise completa
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {viewingExam && (
        <ExamViewerModal
          exam={viewingExam}
          onClose={() => setViewingExam(null)}
          onAnalyze={() => analyzeExam(viewingExam)}
          isAnalyzing={analyzingId === viewingExam.id}
        />
      )}
    </>
  );
}
