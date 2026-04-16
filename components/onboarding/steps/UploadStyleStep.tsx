"use client";

import { useCallback, useState } from "react";
import { CheckCircle, FileText, Loader2, Sparkles, Upload, X } from "lucide-react";

interface UploadStyleStepProps {
  files: File[];
  onUpdate: (files: File[]) => void;
}

export function UploadStyleStep({ files, onUpdate }: UploadStyleStepProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const handleSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    const valid = selected.filter(
      (f) => (f.type === "application/pdf" || f.type.startsWith("image/") || f.type === "text/plain") && f.size <= 5 * 1024 * 1024
    );
    onUpdate([...files, ...valid].slice(0, 5));
  }, [files, onUpdate]);

  async function analyzeStyle() {
    if (files.length === 0) return;
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));

      const res = await fetch("/api/onboarding/analyze-style", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Erro ao analisar");
      }

      setAnalysisComplete(true);
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : "Erro ao analisar estilo");
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl text-hiro-text">Aprenda meu estilo</h2>
        <p className="mt-2 text-[14px] text-hiro-muted leading-relaxed">
          Faça upload de 3-5 prontuários que você escreveu anteriormente. O hiro vai analisar e gerar notas no seu estilo pessoal.
        </p>
      </div>

      <label
        className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-black/15 py-10 transition-all hover:border-hiro-green/40 hover:bg-hiro-green/[0.02]"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const valid = Array.from(e.dataTransfer.files).filter((f) => f.size <= 5 * 1024 * 1024);
          onUpdate([...files, ...valid].slice(0, 5));
        }}
      >
        <Upload className="mb-3 h-10 w-10 text-hiro-muted/40" />
        <p className="text-[14px] text-hiro-muted">
          <span className="font-medium text-hiro-green">Clique para fazer upload</span> ou arraste
        </p>
        <p className="mt-1 text-[12px] text-hiro-muted/60">PDF, imagem ou TXT (máx. 5MB cada, até 5 arquivos)</p>
        <input type="file" className="hidden" multiple accept=".pdf,.jpg,.jpeg,.png,.txt,.doc,.docx" onChange={handleSelect} />
      </label>

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-[12px] font-medium text-hiro-muted">Arquivos selecionados ({files.length}/5)</p>
          {files.map((f, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl border border-black/[0.06] bg-white/50 px-3 py-2.5">
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="h-5 w-5 shrink-0 text-hiro-green" strokeWidth={1.75} />
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-hiro-text">{f.name}</p>
                  <p className="text-[11px] text-hiro-muted/60">{(f.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button type="button" onClick={() => onUpdate(files.filter((_, j) => j !== i))} className="p-1 text-hiro-muted/40 hover:text-hiro-red">
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Analysis button */}
      {files.length >= 2 && !analysisComplete && (
        <button
          type="button"
          onClick={analyzeStyle}
          disabled={isAnalyzing}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-hiro-green py-3 text-[14px] font-medium text-white transition-all hover:bg-[#244a3b] disabled:opacity-50"
        >
          {isAnalyzing ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Analisando estilo...</>
          ) : (
            <><Sparkles className="h-4 w-4" strokeWidth={1.75} /> Analisar meu estilo de escrita</>
          )}
        </button>
      )}

      {analysisComplete && (
        <div className="flex items-center gap-2 rounded-xl border border-hiro-green/20 bg-hiro-green/5 px-4 py-3">
          <CheckCircle className="h-5 w-5 text-hiro-green" strokeWidth={1.75} />
          <span className="text-[13px] font-medium text-hiro-green">Perfil de escrita salvo com sucesso!</span>
        </div>
      )}

      {analysisError && (
        <div className="rounded-xl border border-hiro-red/20 bg-hiro-red/5 px-4 py-3 text-[13px] text-hiro-red">
          {analysisError}
        </div>
      )}

      <div className="flex gap-3 rounded-xl bg-hiro-amber/10 px-4 py-3">
        <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-hiro-amber" strokeWidth={1.75} />
        <div className="text-[13px] text-hiro-amber leading-relaxed">
          <p className="font-medium mb-0.5">Como funciona?</p>
          <p>O hiro analisa a estrutura, tom e terminologia dos seus prontuários para criar um perfil de escrita personalizado. Seus arquivos são processados com segurança e não são armazenados.</p>
        </div>
      </div>

      <p className="text-center text-[12px] text-hiro-muted/60">
        Este passo é opcional. Você pode fazer isso depois nas configurações.
      </p>
    </div>
  );
}
