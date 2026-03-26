"use client";

import Link from "next/link";
import { useEffect } from "react";
import { PatientContext } from "@/components/consulta/PatientContext";
import { RecordingZone } from "@/components/consulta/RecordingZone";
import { TranscriptionPanel } from "@/components/consulta/TranscriptionPanel";
import { ButtonHiro } from "@/components/ui/ButtonHiro";
import { useConsultationStore } from "@/lib/store";
import type { Patient, TranscriptionLine } from "@/lib/types";

interface ConsultationWorkspaceProps {
  consultationId: string;
  patients: Patient[];
}

export function ConsultationWorkspace({
  consultationId,
  patients,
}: ConsultationWorkspaceProps) {
  const selectedPatientId = useConsultationStore((state) => state.selectedPatientId);
  const activeConsultationId = useConsultationStore(
    (state) => state.activeConsultationId,
  );
  const isRecording = useConsultationStore((state) => state.isRecording);
  const liveTranscription = useConsultationStore((state) => state.liveTranscription);
  const setActiveConsultation = useConsultationStore(
    (state) => state.setActiveConsultation,
  );
  const startRecording = useConsultationStore((state) => state.startRecording);
  const stopRecording = useConsultationStore((state) => state.stopRecording);
  const addTranscriptionLine = useConsultationStore(
    (state) => state.addTranscriptionLine,
  );

  useEffect(() => {
    if (activeConsultationId !== consultationId) {
      setActiveConsultation(consultationId);
    }
  }, [activeConsultationId, consultationId, setActiveConsultation]);

  const patient =
    patients.find((item) => item.id === selectedPatientId) ?? patients[0] ?? null;

  const handleMockLine = () => {
    const line: TranscriptionLine = {
      speaker: liveTranscription.length % 2 === 0 ? "doctor" : "patient",
      text:
        liveTranscription.length % 2 === 0
          ? "Vamos revisar seus sinais vitais e conduta."
          : "Estou seguindo as orientacoes e me sentindo melhor.",
      timestamp: Date.now(),
      isFinal: true,
    };
    addTranscriptionLine(line);
  };

  if (!patient) {
    return (
      <section className="rounded-2xl bg-white/60 p-6">
        <p className="text-sm text-hiro-muted">
          Nenhum paciente disponivel para iniciar consulta.
        </p>
      </section>
    );
  }

  return (
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      <PatientContext patient={patient} />
      <RecordingZone isRecording={isRecording} />
      <div className="space-y-3 rounded-2xl bg-hiro-card p-4">
        <p className="text-sm font-medium text-hiro-text">Controles</p>
        <div className="flex flex-wrap gap-2">
          <ButtonHiro onClick={startRecording} disabled={isRecording}>
            Iniciar gravacao
          </ButtonHiro>
          <ButtonHiro
            variant="secondary"
            onClick={stopRecording}
            disabled={!isRecording}
          >
            Pausar gravacao
          </ButtonHiro>
          <ButtonHiro variant="ghost" onClick={handleMockLine}>
            Adicionar fala mock
          </ButtonHiro>
        </div>
        <Link href={`/consulta/${consultationId}/resumo`} className="inline-block">
          <ButtonHiro variant="primary">Ir para resumo</ButtonHiro>
        </Link>
      </div>
      <TranscriptionPanel lines={liveTranscription} />
    </div>
  );
}
