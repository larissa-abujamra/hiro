"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ButtonHiro } from "@/components/ui/ButtonHiro";
import { CardHiro } from "@/components/ui/CardHiro";
import { OverlineLabel } from "@/components/ui/OverlineLabel";
import { useConsultationStore } from "@/lib/store";
import type { Patient } from "@/lib/types";

interface NewConsultationFlowProps {
  patients: Patient[];
}

const REASONS = [
  "Retorno clínico",
  "Queixa respiratória",
  "Revisão de exames",
  "Renovação de receituário",
];

export function NewConsultationFlow({ patients }: NewConsultationFlowProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [showOptional, setShowOptional] = useState(false);
  const [showContext, setShowContext] = useState(true);
  const intakeMode = useConsultationStore((state) => state.intakeMode);
  const selectedPatientId = useConsultationStore((state) => state.selectedPatientId);
  const consultationReason = useConsultationStore((state) => state.consultationReason);
  const newPatientDraft = useConsultationStore((state) => state.newPatientDraft);
  const setIntakeMode = useConsultationStore((state) => state.setIntakeMode);
  const selectPatient = useConsultationStore((state) => state.selectPatient);
  const setConsultationReason = useConsultationStore(
    (state) => state.setConsultationReason,
  );
  const setNewPatientDraft = useConsultationStore((state) => state.setNewPatientDraft);
  const setActiveConsultation = useConsultationStore(
    (state) => state.setActiveConsultation,
  );
  const resetConsultation = useConsultationStore((state) => state.resetConsultation);

  const filteredPatients = useMemo(
    () =>
      patients.filter((patient) =>
        patient.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [patients, query],
  );

  const selectedPatient = useMemo(
    () => patients.find((patient) => patient.id === selectedPatientId) ?? null,
    [patients, selectedPatientId],
  );

  const canStart =
    consultationReason.trim().length > 0 &&
    ((intakeMode === "existing" && Boolean(selectedPatientId)) ||
      (intakeMode === "new" &&
        Boolean(newPatientDraft.name) &&
        Boolean(newPatientDraft.dateOfBirth)));

  const handleStartConsultation = () => {
    if (!canStart) return;

    const consultationId = `cons-${Date.now()}`;
    const createdId = `new-${Date.now()}`;
    resetConsultation();
    if (intakeMode === "existing" && selectedPatientId) {
      selectPatient(selectedPatientId);
    } else {
      selectPatient(createdId);
    }
    setActiveConsultation(consultationId);
    setConsultationReason(consultationReason);
    router.push(`/consulta/${consultationId}`);
  };

  return (
    <div className="mt-6 space-y-4 pb-24">
      <div className="grid gap-4 md:grid-cols-2">
        <CardHiro
          active={intakeMode === "existing"}
          className="cursor-pointer"
          onClick={() => setIntakeMode("existing")}
        >
          <OverlineLabel className={intakeMode === "existing" ? "text-white" : ""}>
            Paciente existente
          </OverlineLabel>
          <p className="mt-2 text-sm">
            Buscar no cadastro do médico e carregar contexto clínico.
          </p>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar paciente..."
            className="mt-4 w-full rounded-xl border border-black/10 bg-white/80 px-3 py-2 text-sm text-hiro-text outline-none"
          />
          <div className="mt-3 max-h-40 space-y-2 overflow-auto">
            {filteredPatients.map((patient) => (
              <button
                key={patient.id}
                type="button"
                onClick={() => selectPatient(patient.id)}
                className={`w-full rounded-xl border px-3 py-2 text-left text-sm ${
                  selectedPatientId === patient.id
                    ? "border-hiro-green bg-hiro-badge-ok-bg text-hiro-text"
                    : "border-black/10 bg-white/60 text-hiro-text"
                }`}
              >
                <p>{patient.name}</p>
                <p className="text-xs text-hiro-muted">{patient.dateOfBirth}</p>
              </button>
            ))}
          </div>
          {selectedPatient && (
            <div className="mt-3 rounded-xl bg-white/55 p-3">
              <button
                type="button"
                onClick={() => setShowContext((prev) => !prev)}
                className="text-xs font-medium text-hiro-muted"
              >
                Contexto carregado {showContext ? "▲" : "▼"}
              </button>
              {showContext && (
                <div className="mt-2 space-y-1 text-xs text-hiro-text">
                  <p>Última consulta: {selectedPatient.consultations.at(-1)?.date}</p>
                  <p>
                    Medicamentos ativos:{" "}
                    {selectedPatient.medications.filter((m) => m.status === "active").length}
                  </p>
                  <p>CIDs anteriores: {selectedPatient.cids.map((cid) => cid.code).join(", ")}</p>
                </div>
              )}
            </div>
          )}
        </CardHiro>

        <CardHiro
          active={intakeMode === "new"}
          className="cursor-pointer"
          onClick={() => setIntakeMode("new")}
        >
          <OverlineLabel className={intakeMode === "new" ? "text-white" : ""}>
            Novo paciente
          </OverlineLabel>
          <p className="mt-2 text-sm">Cadastro mínimo e campos opcionais expansíveis.</p>
          <div className="mt-4 grid gap-2">
            <input
              value={newPatientDraft.name}
              onChange={(event) => setNewPatientDraft({ name: event.target.value })}
              placeholder="Nome completo"
              className="rounded-xl border border-black/10 bg-white/80 px-3 py-2 text-sm text-hiro-text outline-none"
            />
            <input
              value={newPatientDraft.dateOfBirth}
              onChange={(event) => setNewPatientDraft({ dateOfBirth: event.target.value })}
              type="date"
              className="rounded-xl border border-black/10 bg-white/80 px-3 py-2 text-sm text-hiro-text outline-none"
            />
            <select
              value={newPatientDraft.sex}
              onChange={(event) =>
                setNewPatientDraft({ sex: event.target.value as "M" | "F" | "Other" })
              }
              className="rounded-xl border border-black/10 bg-white/80 px-3 py-2 text-sm text-hiro-text outline-none"
            >
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
              <option value="Other">Outro</option>
            </select>
          </div>
          <button
            type="button"
            onClick={() => setShowOptional((prev) => !prev)}
            className="mt-3 text-xs font-medium text-hiro-muted"
          >
            {showOptional ? "Ocultar campos opcionais" : "Mostrar campos opcionais"}
          </button>
          {showOptional && (
            <div className="mt-2 grid gap-2">
              <input
                placeholder="Altura (cm)"
                onChange={(event) =>
                  setNewPatientDraft({ height: Number(event.target.value) || undefined })
                }
                className="rounded-xl border border-black/10 bg-white/80 px-3 py-2 text-sm text-hiro-text outline-none"
              />
              <input
                placeholder="Peso (kg)"
                onChange={(event) =>
                  setNewPatientDraft({ weight: Number(event.target.value) || undefined })
                }
                className="rounded-xl border border-black/10 bg-white/80 px-3 py-2 text-sm text-hiro-text outline-none"
              />
              <input
                placeholder="Telefone"
                onChange={(event) => setNewPatientDraft({ phone: event.target.value })}
                className="rounded-xl border border-black/10 bg-white/80 px-3 py-2 text-sm text-hiro-text outline-none"
              />
              <input
                placeholder="Condição principal conhecida"
                onChange={(event) => setNewPatientDraft({ condition: event.target.value })}
                className="rounded-xl border border-black/10 bg-white/80 px-3 py-2 text-sm text-hiro-text outline-none"
              />
            </div>
          )}
        </CardHiro>
      </div>

      <CardHiro>
        <OverlineLabel>Motivo da consulta</OverlineLabel>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          <select
            value={REASONS.includes(consultationReason) ? consultationReason : ""}
            onChange={(event) => setConsultationReason(event.target.value)}
            className="rounded-xl border border-black/10 bg-white/80 px-3 py-2 text-sm text-hiro-text outline-none"
          >
            <option value="">Selecionar motivo</option>
            {REASONS.map((reason) => (
              <option key={reason} value={reason}>
                {reason}
              </option>
            ))}
          </select>
          <input
            value={consultationReason}
            onChange={(event) => setConsultationReason(event.target.value)}
            placeholder="Ou descreva em texto livre"
            className="rounded-xl border border-black/10 bg-white/80 px-3 py-2 text-sm text-hiro-text outline-none"
          />
        </div>
      </CardHiro>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-black/8 bg-hiro-bg/95 p-4 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3">
          <p className="text-sm text-hiro-muted">
            {canStart ? "Pronto para iniciar atendimento" : "Selecione/cadastre paciente e motivo"}
          </p>
          <ButtonHiro onClick={handleStartConsultation} disabled={!canStart}>
            Iniciar consulta
          </ButtonHiro>
        </div>
      </div>
    </div>
  );
}
