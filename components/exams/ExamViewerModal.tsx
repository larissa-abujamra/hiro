"use client";

import { Download, FileText, Loader2, Sparkles, X } from "lucide-react";
import { formatDateBR } from "@/lib/formatDate";

export interface ExamRecord {
  id: string;
  name: string;
  exam_date?: string | null;
  created_at?: string;
  file_type?: string | null;
  file_data?: string | null;
  analysis?: string | null;
}

interface ExamViewerModalProps {
  exam: ExamRecord;
  onClose: () => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

export function ExamViewerModal({
  exam,
  onClose,
  onAnalyze,
  isAnalyzing,
}: ExamViewerModalProps) {
  const isPDF = exam.file_type === "application/pdf";
  const isImage =
    typeof exam.file_type === "string" && exam.file_type.startsWith("image/");

  const dateLabel = exam.exam_date
    ? formatDateBR(exam.exam_date)
    : exam.created_at
      ? formatDateBR(exam.created_at)
      : "Data não informada";

  function downloadExam() {
    if (!exam.file_data || !exam.file_type) return;
    const link = document.createElement("a");
    link.href = `data:${exam.file_type};base64,${exam.file_data}`;
    link.download = exam.name || "exame";
    link.click();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-black/[0.08] bg-[#f0ede6] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/[0.08] px-5 py-4">
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-serif text-xl font-normal text-hiro-text">
              {exam.name}
            </h2>
            <p className="text-[12px] text-hiro-muted">{dateLabel}</p>
          </div>
          <div className="ml-4 flex items-center gap-1">
            <button
              type="button"
              onClick={downloadExam}
              disabled={!exam.file_data}
              className="rounded-full p-2 text-hiro-muted transition-colors hover:bg-black/[0.04] hover:text-hiro-text disabled:opacity-40"
              title="Baixar"
            >
              <Download className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-hiro-muted transition-colors hover:bg-black/[0.04] hover:text-hiro-text"
              title="Fechar"
            >
              <X className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          {/* File preview */}
          <div className="flex min-h-[400px] flex-1 items-center justify-center bg-black/[0.03] p-4 md:min-h-0">
            {isPDF && exam.file_data && (
              <iframe
                title={exam.name}
                src={`data:application/pdf;base64,${exam.file_data}`}
                className="h-full min-h-[500px] w-full rounded-xl border border-black/[0.06] bg-white"
              />
            )}
            {isImage && exam.file_data && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`data:${exam.file_type};base64,${exam.file_data}`}
                alt={exam.name}
                className="mx-auto max-h-full max-w-full rounded-xl border border-black/[0.06]"
              />
            )}
            {!isPDF && !isImage && (
              <div className="flex flex-col items-center gap-3 text-hiro-muted">
                <FileText className="h-12 w-12 opacity-40" strokeWidth={1.5} />
                <p className="text-[13px]">
                  Visualização não disponível para este tipo de arquivo
                </p>
                {exam.file_data && (
                  <button
                    type="button"
                    onClick={downloadExam}
                    className="rounded-xl bg-hiro-active px-4 py-2 text-[13px] font-medium text-white hover:bg-hiro-text"
                  >
                    Baixar arquivo
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Analysis panel */}
          <div className="flex w-full flex-col border-t border-black/[0.08] md:w-80 md:border-l md:border-t-0">
            <div className="flex items-center justify-between border-b border-black/[0.08] px-4 py-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-hiro-amber" strokeWidth={1.75} />
                <span className="text-[12px] font-semibold uppercase tracking-wide text-hiro-muted">
                  Análise IA
                </span>
              </div>
              {!exam.analysis && (
                <button
                  type="button"
                  onClick={onAnalyze}
                  disabled={isAnalyzing}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-hiro-active px-3 py-1.5 text-[12px] font-medium text-white transition-colors hover:bg-hiro-text disabled:opacity-60"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" strokeWidth={2} />
                      Analisando...
                    </>
                  ) : (
                    "Analisar"
                  )}
                </button>
              )}
            </div>

            <div className="flex-1 overflow-auto px-4 py-4">
              {exam.analysis ? (
                <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-hiro-text">
                  {exam.analysis}
                </p>
              ) : (
                <div className="flex flex-col items-center gap-2 pt-8 text-center text-hiro-muted">
                  <Sparkles
                    className="h-6 w-6 opacity-40"
                    strokeWidth={1.75}
                  />
                  <p className="text-[12px]">
                    Clique em &ldquo;Analisar&rdquo; para que a IA interprete
                    este exame.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
