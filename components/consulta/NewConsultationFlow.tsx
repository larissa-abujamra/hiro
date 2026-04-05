"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ButtonHiro } from "@/components/ui/ButtonHiro";
import { CardHiro } from "@/components/ui/CardHiro";
import { OverlineLabel } from "@/components/ui/OverlineLabel";
import { useConsultationStore } from "@/lib/store";
import type { Patient } from "@/lib/types";
import { formatDateBR } from "@/lib/formatDate";

interface NewConsultationFlowProps {
  /** Fallback when o store ainda não tem pacientes (ex.: SSR inicial). */
  patients?: Patient[];
}

const REASONS = [
  "Primeira consulta",
  "Retorno clínico",
  "Consulta de rotina",
  "Queixa aguda",
  "Acompanhamento de crônico",
  "Revisão de exames",
  "Renovação de receita",
  "Dor ou desconforto",
  "Pré-operatório",
  "Saúde mental",
  "Atestado ou declaração",
  "Urgência / Encaixe",
  "Outro",
];

export function NewConsultationFlow({ patients }: NewConsultationFlowProps = {}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [showOptional, setShowOptional] = useState(false);
  const patientsInStore = useConsultationStore((state) => state.patients);
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
  const createPatientFromDraft = useConsultationStore(
    (state) => state.createPatientFromDraft,
  );
  const addActivity = useConsultationStore((state) => state.addActivity);
  const resetConsultation = useConsultationStore((state) => state.resetConsultation);
  const sourcePatients = patientsInStore.length ? patientsInStore : (patients ?? []);

  const filteredPatients = useMemo(
    () =>
      sourcePatients.filter((patient) =>
        patient.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [query, sourcePatients],
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
    let targetPatientId: string | null = null;
    let patientName = "";
    if (intakeMode === "existing" && selectedPatientId) {
      targetPatientId = selectedPatientId;
      patientName =
        sourcePatients.find((p) => p.id === selectedPatientId)?.name ?? "";
    } else {
      patientName = newPatientDraft.name.trim();
      targetPatientId = createPatientFromDraft();
      if (!targetPatientId) return;
      addActivity({ type: "patient_created", patientName });
    }
    resetConsultation();
    selectPatient(targetPatientId);
    setActiveConsultation(consultationId);
    setConsultationReason(consultationReason);
    addActivity({ type: "consultation_started", patientName });
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
            className="glass-card-input mt-4 w-full rounded-xl px-3 py-2 text-sm text-hiro-text outline-none"
          />
          <div className="mt-3 max-h-40 space-y-2 overflow-auto">
            {filteredPatients.map((patient) => (
              <button
                key={patient.id}
                type="button"
                onClick={() => selectPatient(patient.id)}
                className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
                  selectedPatientId === patient.id
                    ? intakeMode === "existing"
                      ? "border-white bg-white text-hiro-text shadow-[0_2px_14px_rgba(0,0,0,0.18)] ring-1 ring-white/90"
                      : "border-hiro-green bg-hiro-badge-ok-bg text-hiro-text"
                    : intakeMode === "existing"
                      ? "border-white/25 bg-white/15 text-white hover:bg-white/25"
                      : "glass-card-input text-hiro-text"
                }`}
              >
                <p>{patient.name}</p>
                <p
                  className={`text-xs ${
                    intakeMode === "existing" && selectedPatientId !== patient.id
                      ? "text-white/70"
                      : "text-hiro-muted"
                  }`}
                >
                  {formatDateBR(patient.dateOfBirth)}
                </p>
              </button>
            ))}
          </div>
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
              className="glass-card-input rounded-xl px-3 py-2 text-sm text-hiro-text outline-none"
            />
            <input
              value={newPatientDraft.dateOfBirth}
              onChange={(event) => {
                // Allow only digits and slashes, auto-insert slashes
                let v = event.target.value.replace(/[^\d/]/g, "");
                const digits = v.replace(/\//g, "");
                if (digits.length >= 3 && !v.includes("/")) {
                  v = digits.slice(0, 2) + "/" + digits.slice(2);
                }
                if (digits.length >= 5 && v.split("/").length < 3) {
                  const parts = v.split("/");
                  v = parts[0] + "/" + (parts[1]?.slice(0, 2) ?? "") + "/" + (parts[1]?.slice(2) ?? "") + (parts[2] ?? "");
                }
                if (v.length > 10) v = v.slice(0, 10);
                setNewPatientDraft({ dateOfBirth: v });
              }}
              type="text"
              inputMode="numeric"
              maxLength={10}
              placeholder="dd/mm/aaaa"
              className="glass-card-input rounded-xl px-3 py-2 text-sm text-hiro-text outline-none"
            />
            <select
              value={newPatientDraft.sex}
              onChange={(event) =>
                setNewPatientDraft({ sex: event.target.value as "M" | "F" | "Other" })
              }
              className="glass-card-input rounded-xl px-3 py-2 text-sm text-hiro-text outline-none"
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
                className="glass-card-input rounded-xl px-3 py-2 text-sm text-hiro-text outline-none"
              />
              <input
                placeholder="Peso (kg)"
                onChange={(event) =>
                  setNewPatientDraft({ weight: Number(event.target.value) || undefined })
                }
                className="glass-card-input rounded-xl px-3 py-2 text-sm text-hiro-text outline-none"
              />
              <input
                placeholder="Telefone"
                onChange={(event) => setNewPatientDraft({ phone: event.target.value })}
                className="glass-card-input rounded-xl px-3 py-2 text-sm text-hiro-text outline-none"
              />
              <input
                placeholder="Condição principal conhecida"
                onChange={(event) => setNewPatientDraft({ condition: event.target.value })}
                className="glass-card-input rounded-xl px-3 py-2 text-sm text-hiro-text outline-none"
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
            className="glass-card-input rounded-xl px-3 py-2 text-sm text-hiro-text outline-none"
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
            className="glass-card-input rounded-xl px-3 py-2 text-sm text-hiro-text outline-none"
          />
        </div>
      </CardHiro>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-black/8 bg-hiro-bg/95 p-4 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-end gap-3">
          <ButtonHiro onClick={handleStartConsultation} disabled={!canStart}>
            Iniciar consulta
          </ButtonHiro>
        </div>
      </div>
    </div>
  );
}
