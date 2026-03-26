"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { PatientSelector } from "@/components/consulta/PatientSelector";
import { ButtonHiro } from "@/components/ui/ButtonHiro";
import { useConsultationStore } from "@/lib/store";
import type { Patient } from "@/lib/types";

interface NewConsultationFlowProps {
  patients: Patient[];
}

export function NewConsultationFlow({ patients }: NewConsultationFlowProps) {
  const router = useRouter();
  const selectedPatientId = useConsultationStore((state) => state.selectedPatientId);
  const selectPatient = useConsultationStore((state) => state.selectPatient);
  const setActiveConsultation = useConsultationStore(
    (state) => state.setActiveConsultation,
  );
  const resetConsultation = useConsultationStore((state) => state.resetConsultation);

  const selectedPatientName = useMemo(
    () => patients.find((patient) => patient.id === selectedPatientId)?.name ?? null,
    [patients, selectedPatientId],
  );

  const handleStartConsultation = () => {
    if (!selectedPatientId) return;

    const consultationId = `cons-${Date.now()}`;
    resetConsultation();
    selectPatient(selectedPatientId);
    setActiveConsultation(consultationId);
    router.push(`/consulta/${consultationId}`);
  };

  return (
    <div className="mt-6 space-y-4">
      <PatientSelector
        patients={patients}
        selectedPatientId={selectedPatientId}
        onSelectPatient={selectPatient}
      />
      <div className="flex items-center justify-between rounded-xl bg-hiro-card p-4">
        <p className="text-sm text-hiro-muted">
          {selectedPatientName
            ? `Paciente selecionado: ${selectedPatientName}`
            : "Selecione um paciente para iniciar"}
        </p>
        <ButtonHiro onClick={handleStartConsultation} disabled={!selectedPatientId}>
          Iniciar consulta
        </ButtonHiro>
      </div>
    </div>
  );
}
