"use client";

import { useCallback, useState } from "react";
import { FileText, Loader2, Upload, X } from "lucide-react";
import { fileToBase64 } from "@/lib/file-utils";

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export interface PendingExamFile {
  file_name: string;
  file_type: string;
  file_data: string;
}

interface ExamUploadProps {
  patientId?: string;
  consultationId?: string;
  /** Called after a successful direct upload (patientId present). */
  onUploadComplete?: (exam: Record<string, unknown>) => void;
  /** Called when a file is queued locally because there's no patientId yet. */
  onFilePending?: (file: PendingExamFile) => void;
}

export function ExamUpload({
  patientId,
  consultationId,
  onUploadComplete,
  onFilePending,
}: ExamUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingFiles, setPendingFiles] = useState<PendingExamFile[]>([]);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);

      if (!ALLOWED_TYPES.includes(file.type)) {
        setError("Tipo de arquivo não suportado. Use PDF ou imagem.");
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError("Arquivo muito grande. Máximo 5MB.");
        return;
      }

      const base64 = await fileToBase64(file);
      const pendingFile: PendingExamFile = {
        file_name: file.name,
        file_type: file.type,
        file_data: base64,
      };

      if (patientId) {
        setIsUploading(true);
        try {
          const response = await fetch("/api/exams", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              patient_id: patientId,
              consultation_id: consultationId,
              name: file.name,
              file_name: file.name,
              file_data: base64,
              file_type: file.type,
            }),
          });

          if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            console.error("[ExamUpload] Upload failed:", err);
            setError("Erro ao enviar exame. Tente novamente.");
            return;
          }

          const exam = await response.json();
          onUploadComplete?.(exam);
        } catch (err) {
          console.error("[ExamUpload] Upload error:", err);
          setError("Erro ao enviar exame. Tente novamente.");
        } finally {
          setIsUploading(false);
        }
      } else {
        setPendingFiles((prev) => [...prev, pendingFile]);
        onFilePending?.(pendingFile);
      }
    },
    [patientId, consultationId, onUploadComplete, onFilePending],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      setIsDragging(false);
      Array.from(e.dataTransfer.files).forEach(handleFile);
    },
    [handleFile],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files ?? []).forEach(handleFile);
    // Reset so the same file can be re-selected if needed
    e.target.value = "";
  };

  const removePendingFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`flex h-28 w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed transition-colors ${
          isDragging
            ? "border-hiro-green bg-hiro-green/5"
            : "border-black/10 hover:border-hiro-green/40 hover:bg-black/[0.02]"
        }`}
      >
        {isUploading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin text-hiro-green" />
            <p className="text-[11px] text-hiro-muted">Enviando...</p>
          </>
        ) : (
          <>
            <Upload className="h-5 w-5 text-hiro-muted/50" strokeWidth={1.75} />
            <p className="text-[12px] text-hiro-muted">
              <span className="font-medium text-hiro-green">
                Clique para enviar
              </span>
              {" ou arraste arquivos"}
            </p>
            <p className="text-[10px] text-hiro-muted/60">
              PDF ou imagem (máx. 5MB)
            </p>
          </>
        )}
        <input
          type="file"
          className="hidden"
          accept=".pdf,image/*"
          multiple
          onChange={handleInputChange}
        />
      </label>

      {error && (
        <p className="rounded-lg border border-hiro-red/30 bg-hiro-red/5 px-3 py-1.5 text-[11px] text-hiro-red">
          {error}
        </p>
      )}

      {pendingFiles.length > 0 && (
        <div className="space-y-1.5">
          {pendingFiles.map((file, index) => (
            <div
              key={`${file.file_name}-${index}`}
              className="flex items-center justify-between rounded-lg border border-black/[0.06] bg-white/40 px-2.5 py-1.5"
            >
              <div className="flex min-w-0 items-center gap-2">
                <FileText
                  className="h-3.5 w-3.5 shrink-0 text-hiro-muted"
                  strokeWidth={1.75}
                />
                <span className="truncate text-[11px] text-hiro-text">
                  {file.file_name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => removePendingFile(index)}
                className="text-hiro-muted/30 hover:text-hiro-red"
              >
                <X className="h-3 w-3" strokeWidth={2} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
