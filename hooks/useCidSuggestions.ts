"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useConsultationStore } from "@/lib/store";
import type { Patient } from "@/lib/types";
import { matchDiagnosticos } from "@/lib/cidSearch";

function patientAge(patient: Patient): number {
  return new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();
}

function buildPatientContext(patient: Patient | null): string | null {
  if (!patient) return null;
  const meds = patient.medications.map((m) => `${m.name} ${m.dose}`).join(", ");
  const cids = patient.cids.map((c) => c.code).join(", ");
  return `Paciente: ${patient.name}, ${patientAge(patient)} anos.
CIDs anteriores: ${cids || "nenhum"}.
Medicamentos: ${meds || "nenhum"}.`;
}

export function useCidSuggestions(consultationId: string) {
  const patients = useConsultationStore((s) => s.patients);
  const selectedPatientId = useConsultationStore((s) => s.selectedPatientId);
  const setDiagnosticosSugeridos = useConsultationStore((s) => s.setDiagnosticosSugeridos);

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) ?? null;

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

        const data = await res.json();
        const diagnosticos = Array.isArray(data.diagnosticos) ? data.diagnosticos : [];

        if (diagnosticos.length > 0) {
          // Match search terms against local CID-10 database
          const matched = matchDiagnosticos(diagnosticos);

          setDiagnosticosSugeridos(
            matched.map((d) => ({
              texto: d.texto,
              categoria: d.categoria,
              sourceQuote: d.sourceQuote,
              matchCodes: d.matches.map((m) => ({
                codigo: m.codigo,
                descricao: m.descricao,
              })),
            }))
          );
        }
      } catch (err) {
        console.error("CID suggestion error:", err);
      } finally {
        isRunningRef.current = false;
        setIsAnalyzing(false);
      }
    },
    [selectedPatient, setDiagnosticosSugeridos],
  );

  return { analyze, isAnalyzing };
}
