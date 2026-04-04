"use client";

import { useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Check,
  FileImage,
  Loader2,
  Plus,
  Upload,
  X,
} from "lucide-react";
import { CardHiro } from "@/components/ui/CardHiro";
import { OverlineLabel } from "@/components/ui/OverlineLabel";
import { ButtonHiro } from "@/components/ui/ButtonHiro";

export interface ExamResult {
  name: string;
  value: string;
  unit: string;
  status: "normal" | "alto" | "baixo";
  reference?: string;
}

interface ExamAnalysisPanelProps {
  onAddToSoap: (text: string) => void;
}

const STATUS_CONFIG = {
  normal: {
    label: "Normal",
    icon: Check,
    bg: "bg-[#D6E8DC]",
    text: "text-[#0F6E56]",
  },
  alto: {
    label: "Alto",
    icon: ArrowUp,
    bg: "bg-[#FAECE7]",
    text: "text-[#993C1D]",
  },
  baixo: {
    label: "Baixo",
    icon: ArrowDown,
    bg: "bg-[#FAEEDA]",
    text: "text-[#854F0B]",
  },
} as const;

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data:...;base64, prefix
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function getMediaType(file: File): string {
  if (file.type === "image/png") return "image/png";
  if (file.type === "image/webp") return "image/webp";
  if (file.type === "application/pdf") return "application/pdf";
  return "image/jpeg";
}

export function ExamAnalysisPanel({ onAddToSoap }: ExamAnalysisPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [summary, setSummary] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File | null) {
    if (!f) return;
    setFile(f);
    setResults([]);
    setSummary("");
    setError(null);
    setAdded(false);

    // Create preview for images (not PDFs)
    if (f.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview(null);
    }
  }

  function handleRemove() {
    setFile(null);
    setPreview(null);
    setResults([]);
    setSummary("");
    setError(null);
    setAdded(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleAnalyze() {
    if (!file) return;
    setIsAnalyzing(true);
    setError(null);

    try {
      const base64 = await fileToBase64(file);
      const mediaType = getMediaType(file);

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
      setResults(data.results ?? []);
      setSummary(data.summary ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao analisar exame");
    } finally {
      setIsAnalyzing(false);
    }
  }

  function handleAddToSoap() {
    if (results.length === 0) return;

    const lines = results.map((r) => {
      const flag = r.status !== "normal" ? ` (${r.status === "alto" ? "ELEVADO" : "BAIXO"})` : "";
      return `${r.name}: ${r.value} ${r.unit}${flag}${r.reference ? ` [ref: ${r.reference}]` : ""}`;
    });

    const text = `[RESULTADOS DE EXAMES ANEXADOS]\n${lines.join("\n")}${summary ? `\nResumo: ${summary}` : ""}`;
    onAddToSoap(text);
    setAdded(true);
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-black/15 py-3 text-[13px] font-medium text-hiro-muted transition-colors hover:border-hiro-green/40 hover:text-hiro-green"
      >
        <FileImage className="h-4 w-4" strokeWidth={1.75} />
        Anexar exame para análise
      </button>
    );
  }

  return (
    <CardHiro className="rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <OverlineLabel>ANÁLISE DE EXAMES</OverlineLabel>
        <button
          type="button"
          onClick={() => { setIsOpen(false); handleRemove(); }}
          className="rounded-full p-1 text-hiro-muted transition-colors hover:bg-black/[0.04] hover:text-hiro-text"
        >
          <X className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>

      {/* Upload area */}
      {!file && (
        <div
          className="mt-3 flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-black/15 p-6 transition-colors hover:border-hiro-green/40 hover:bg-black/[0.02]"
          onClick={() => inputRef.current?.click()}
          onDrop={(e) => {
            e.preventDefault();
            handleFile(e.dataTransfer.files?.[0] ?? null);
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          <Upload className="h-6 w-6 text-hiro-muted/50" strokeWidth={1.5} />
          <p className="text-[13px] text-hiro-muted">
            Arraste uma imagem ou clique para selecionar
          </p>
          <p className="text-[11px] text-hiro-muted/50">JPG, PNG, PDF</p>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
        </div>
      )}

      {/* Preview */}
      {file && (
        <div className="mt-3 space-y-3">
          {preview && (
            <div className="relative overflow-hidden rounded-xl">
              <img
                src={preview}
                alt="Preview do exame"
                className="w-full rounded-xl"
              />
              <button
                type="button"
                onClick={handleRemove}
                className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white transition-colors hover:bg-black/70"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            </div>
          )}

          {!preview && (
            <div className="flex items-center gap-3 rounded-xl bg-hiro-bg/60 px-4 py-3">
              <FileImage className="h-5 w-5 text-hiro-muted" strokeWidth={1.5} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-hiro-text">{file.name}</p>
                <p className="text-[11px] text-hiro-muted">{(file.size / 1024).toFixed(0)} KB</p>
              </div>
              <button
                type="button"
                onClick={handleRemove}
                className="text-hiro-muted hover:text-hiro-red"
              >
                <X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>
          )}

          {/* Analyze button */}
          {results.length === 0 && !isAnalyzing && (
            <ButtonHiro
              onClick={handleAnalyze}
              className="w-full"
              disabled={isAnalyzing}
            >
              Analisar com IA
            </ButtonHiro>
          )}

          {/* Loading */}
          {isAnalyzing && (
            <div className="flex items-center justify-center gap-2 py-4">
              <Loader2 className="h-5 w-5 animate-spin text-hiro-green" />
              <p className="text-[13px] text-hiro-muted">Analisando exame...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-hiro-red/30 bg-hiro-red/10 px-4 py-3 text-[13px] text-hiro-red">
              {error}
              <button
                type="button"
                onClick={handleAnalyze}
                className="ml-2 underline underline-offset-2"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {/* Results table */}
          {results.length > 0 && (
            <div className="space-y-3">
              {summary && (
                <div className="rounded-xl border border-hiro-green/20 bg-hiro-green/5 px-4 py-3">
                  <p className="text-[12px] font-medium text-hiro-green">Resumo</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-hiro-text">{summary}</p>
                </div>
              )}

              <div className="overflow-hidden rounded-xl border border-black/[0.06]">
                <table className="w-full text-left text-[13px]">
                  <thead>
                    <tr className="border-b border-black/[0.06] bg-black/[0.02]">
                      <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-hiro-muted">
                        Exame
                      </th>
                      <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-hiro-muted">
                        Valor
                      </th>
                      <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-hiro-muted">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, i) => {
                      const cfg = STATUS_CONFIG[r.status];
                      const Icon = cfg.icon;
                      return (
                        <tr
                          key={i}
                          className="border-b border-black/[0.04] last:border-0"
                        >
                          <td className="px-3 py-2">
                            <p className="font-medium text-hiro-text">{r.name}</p>
                            {r.reference && (
                              <p className="text-[11px] text-hiro-muted">
                                Ref: {r.reference}
                              </p>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-3 py-2 tabular-nums text-hiro-text">
                            {r.value} {r.unit}
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${cfg.bg} ${cfg.text}`}
                            >
                              <Icon className="h-3 w-3" strokeWidth={2} />
                              {cfg.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Abnormal count */}
              {results.some((r) => r.status !== "normal") && (
                <div className="flex items-center gap-2 rounded-xl border border-hiro-amber/30 bg-[#FAEEDA]/50 px-4 py-2.5">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-hiro-amber" strokeWidth={1.75} />
                  <p className="text-[12px] text-hiro-text">
                    {results.filter((r) => r.status !== "normal").length}{" "}
                    {results.filter((r) => r.status !== "normal").length === 1
                      ? "valor fora da faixa normal"
                      : "valores fora da faixa normal"}
                  </p>
                </div>
              )}

              {/* Add to SOAP */}
              <ButtonHiro
                onClick={handleAddToSoap}
                className="w-full"
                variant={added ? "secondary" : "primary"}
                disabled={added}
              >
                {added ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Check className="h-4 w-4" />
                    Adicionado ao prontuário
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5">
                    <Plus className="h-4 w-4" strokeWidth={2} />
                    Adicionar ao prontuário
                  </span>
                )}
              </ButtonHiro>

              {/* Upload another */}
              <button
                type="button"
                onClick={handleRemove}
                className="w-full text-center text-[12px] text-hiro-muted transition-colors hover:text-hiro-green"
              >
                Analisar outro exame
              </button>
            </div>
          )}
        </div>
      )}
    </CardHiro>
  );
}
