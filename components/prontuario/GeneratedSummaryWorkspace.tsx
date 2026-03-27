"use client";

import { useMemo, useState } from "react";
import { CardHiro } from "@/components/ui/CardHiro";
import { OverlineLabel } from "@/components/ui/OverlineLabel";
import { BadgeStatus } from "@/components/ui/BadgeStatus";
import { ButtonHiro } from "@/components/ui/ButtonHiro";
import { useConsultationStore } from "@/lib/store";
import type { Patient } from "@/lib/types";

interface GeneratedSummaryWorkspaceProps {
  consultationId: string;
  patients: Patient[];
}

export function GeneratedSummaryWorkspace({
  consultationId,
  patients,
}: GeneratedSummaryWorkspaceProps) {
  const selectedPatientId = useConsultationStore((state) => state.selectedPatientId);
  const recordingSeconds = useConsultationStore((state) => state.recordingSeconds);
  const suggestedCids = useConsultationStore((state) => state.suggestedCids);

  const patient =
    patients.find((item) => item.id === selectedPatientId) ?? patients[0] ?? null;

  const [soap, setSoap] = useState({
    s: "Paciente refere melhora clínica e boa adesão ao tratamento.",
    o: "PA em queda progressiva; sem intercorrências na consulta.",
    a: "Hipertensão controlada em evolução favorável.",
    p: "Manter conduta, retorno em 30 dias, reforço de orientação alimentar.",
  });

  const generatedDocs = useMemo(
    () => [
      {
        title: "Receituário",
        subtitle: "Medicamentos com posologia detectada na fala",
        status: "ready" as const,
      },
      {
        title: "Pedido de exames",
        subtitle: "Solicitações com indicação clínica",
        status: "ready" as const,
      },
      {
        title: "Guia TISS",
        subtitle: "XML validado para faturamento",
        status: "pending" as const,
      },
    ],
    [],
  );

  if (!patient) return null;

  return (
    <div className="mt-6 grid gap-4 md:grid-cols-5">
      <section className="space-y-4 md:col-span-3">
        <CardHiro>
          <h1 className="font-serif text-3xl text-hiro-text">Prontuário — {patient.name}</h1>
          <p className="mt-2 text-sm text-hiro-muted">
            {new Date().toLocaleDateString("pt-BR")} • Duração: {recordingSeconds}s • Médico:
            Dr(a). responsável
          </p>
          <BadgeStatus
            label="Gerado pela IA — revise antes de salvar"
            className="mt-3"
            status="pending"
          />
        </CardHiro>

        <CardHiro className="space-y-3">
          {(["s", "o", "a", "p"] as const).map((key) => (
            <div key={key}>
              <OverlineLabel>{key.toUpperCase()}</OverlineLabel>
              <textarea
                value={soap[key]}
                onChange={(event) =>
                  setSoap((prev) => ({ ...prev, [key]: event.target.value }))
                }
                className="mt-2 min-h-24 w-full rounded-xl border border-black/10 bg-white/55 p-3 text-sm text-hiro-text outline-none"
              />
            </div>
          ))}
        </CardHiro>

        <CardHiro>
          <OverlineLabel>DOCUMENTOS GERADOS</OverlineLabel>
          <div className="mt-3 space-y-2">
            {generatedDocs.map((doc) => (
              <div
                key={doc.title}
                className="flex items-center justify-between rounded-xl border border-black/10 bg-white/55 p-3"
              >
                <div>
                  <p className="text-sm font-medium text-hiro-text">{doc.title}</p>
                  <p className="text-xs text-hiro-muted">{doc.subtitle}</p>
                </div>
                <BadgeStatus
                  label={doc.status === "ready" ? "Pronto" : "Pendente"}
                  status={doc.status}
                />
              </div>
            ))}
          </div>
          <ButtonHiro className="mt-4">Assinar em lote</ButtonHiro>
        </CardHiro>
      </section>

      <aside className="space-y-4 md:col-span-2">
        <CardHiro>
          <OverlineLabel>CIDs confirmados</OverlineLabel>
          <ul className="mt-3 space-y-2">
            {suggestedCids.map((cid) => (
              <li key={cid.code} className="text-sm text-hiro-text">
                ✅ {cid.code} — {cid.name}
              </li>
            ))}
          </ul>
        </CardHiro>
        <CardHiro>
          <OverlineLabel>Retorno agendado</OverlineLabel>
          <p className="mt-2 text-sm text-hiro-text">
            Detectado: "volte em 30 dias"
          </p>
          <p className="text-xs text-hiro-muted">
            Data sugerida:{" "}
            {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("pt-BR")}
          </p>
          <ButtonHiro className="mt-3">Confirmar agendamento</ButtonHiro>
        </CardHiro>
        <CardHiro>
          <OverlineLabel>Assinar e finalizar</OverlineLabel>
          <ButtonHiro className="mt-3 w-full">Assinar e enviar ao paciente</ButtonHiro>
          <p className="mt-2 text-xs text-hiro-muted">
            Prontuário + receita + exames via WhatsApp (em breve).
          </p>
        </CardHiro>
        <CardHiro>
          <OverlineLabel>Exportar para prontuário</OverlineLabel>
          <div className="mt-3 flex flex-wrap gap-2">
            {["iClinic", "MV SOUL", "Tasy", "Pixeon", "HL7 FHIR"].map((tag) => (
              <span key={tag} className="rounded-full border border-black/15 px-3 py-1 text-xs">
                {tag}
              </span>
            ))}
          </div>
          <ButtonHiro variant="secondary" className="mt-3 w-full">
            Exportar com 1 clique (em breve)
          </ButtonHiro>
        </CardHiro>
      </aside>
      <input type="hidden" value={consultationId} readOnly />
    </div>
  );
}
