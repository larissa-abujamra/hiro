"use client";

import { useCallback, useEffect, useState } from "react";

export interface ConsultationRecord {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_id?: string | null;
  started_at: string;
  ended_at?: string | null;
  duration_minutes?: number | null;
  chief_complaint?: string | null;
  transcription?: string | null;
  subjetivo?: string | null;
  objetivo?: string | null;
  avaliacao?: string | null;
  plano?: string | null;
  soap?: Record<string, string> | null;
  status: "in_progress" | "completed" | "cancelled";
  created_at: string;
  updated_at?: string | null;
}

export function usePatientConsultations(patientId: string | null | undefined) {
  const [consultations, setConsultations] = useState<ConsultationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!patientId) {
      setConsultations([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`/api/consultations?patient_id=${patientId}`);
      if (res.ok) {
        const data = await res.json();
        setConsultations(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("[usePatientConsultations] Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    load();
  }, [load]);

  return { consultations, isLoading, reload: load };
}
