"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useConsultationStore } from "@/lib/store";
import type { CidSuggestion, Patient } from "@/lib/types";

function patientAge(patient: Patient): number {
  return new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();
}

function buildPatientContext(patient: Patient | null): string | null {
  if (!patient) return null;
  const meds = patient.medications
    .map((m) => `${m.name} ${m.dose}`)
    .join(", ");
  const cids = patient.cids.map((c) => c.code).join(", ");
  return `Paciente: ${patient.name}, ${patientAge(patient)} anos.
CIDs anteriores: ${cids || "nenhum"}.
Medicamentos: ${meds || "nenhum"}.`;
}

export function useCidSuggestions(consultationId: string) {
  const patients = useConsultationStore((s) => s.patients);
  const selectedPatientId = useConsultationStore((s) => s.selectedPatientId);
  const setCidSuggestions = useConsultationStore((s) => s.setCidSuggestions);

  const selectedPatient =
    patients.find((p) => p.id === selectedPatientId) ?? null;

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const lastWordCountRef = useRef(0);
  const isRunningRef = useRef(false);

  useEffect(() => {
    lastWordCountRef.current = 0;
  }, [consultationId]);

  const analyze = useCallback(
    async (allLines: string[]) => {
      if (isRunningRef.current) return;

      const fullText = allLines.join(" ").trim();
      const wordCount = fullText.split(/\s+/).filter(Boolean).length;

      if (wordCount - lastWordCountRef.current < 40) return;

      lastWordCountRef.current = wordCount;
      isRunningRef.current = true;
      setIsAnalyzing(true);

      const patientContext = buildPatientContext(selectedPatient);

      try {
        const res = await fetch("/api/cid", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transcription: fullText,
            patientContext: patientContext ?? undefined,
          }),
        });

        const data = (await res.json()) as {
          suggestions?: Array<{
            code?: string;
            name?: string;
            confidence?: number;
            sourceQuote?: string;
          }>;
        };

        if (data.suggestions?.length) {
          const mapped: CidSuggestion[] = data.suggestions
            .slice(0, 3)
            .map((s) => {
              const raw =
                typeof s.confidence === "number" ? s.confidence : 0;
              const confidence =
                raw > 1 ? Math.min(1, raw / 100) : Math.min(1, Math.max(0, raw));

              return {
                code: typeof s.code === "string" ? s.code : "",
                name: typeof s.name === "string" ? s.name : "",
                confidence,
                sourceQuote:
                  typeof s.sourceQuote === "string" ? s.sourceQuote : "",
                confirmed: false,
              };
            })
            .filter((s) => s.code && s.name);

          if (mapped.length > 0) {
            setCidSuggestions(mapped);
          }
        }
      } catch (err) {
        console.error("CID suggestion error:", err);
      } finally {
        isRunningRef.current = false;
        setIsAnalyzing(false);
      }
    },
    [selectedPatient, setCidSuggestions],
  );

  return { analyze, isAnalyzing };
}
