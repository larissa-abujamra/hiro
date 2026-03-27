"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Award,
  Check,
  FileText,
  FlaskConical,
  Grid2x2,
} from "lucide-react";
import { CardHiro } from "@/components/ui/CardHiro";
import { OverlineLabel } from "@/components/ui/OverlineLabel";
import { BadgeStatus } from "@/components/ui/BadgeStatus";
import { useConsultationStore } from "@/lib/store";
import type { GeneratedDocument, Patient } from "@/lib/types";

interface GeneratedSummaryWorkspaceProps {
  consultationId: string;
  patients: Patient[];
}

export function GeneratedSummaryWorkspace({
  consultationId,
  patients,
}: GeneratedSummaryWorkspaceProps) {
  const router = useRouter();
  const patientsInStore = useConsultationStore((state) => state.patients);
  const selectedPatientId = useConsultationStore((state) => state.selectedPatientId);
  const consultationReason = useConsultationStore((state) => state.consultationReason);
  const recordingSeconds = useConsultationStore((state) => state.recordingSeconds);
  const liveTranscription = useConsultationStore((state) => state.liveTranscription);
  const cidSuggestions = useConsultationStore((state) => state.cidSuggestions);
  const detectedItems = useConsultationStore((state) => state.detectedItems);
  const generatedSoap = useConsultationStore((state) => state.generatedSoap);
  const setGeneratedSoap = useConsultationStore((state) => state.setGeneratedSoap);
  const patientSummary = useConsultationStore((state) => state.patientSummary);
  const flags = useConsultationStore((state) => state.flags);
  const saveSummary = useConsultationStore((state) => state.saveSummary);
  const saveConsultationToPatient = useConsultationStore(
    (state) => state.saveConsultationToPatient,
  );

  const sourcePatients = patientsInStore.length ? patientsInStore : patients;
  const patient =
    sourcePatients.find((item) => item.id === selectedPatientId) ??
    sourcePatients[0] ??
    null;

  const doctorName = "Dra. Larissa Oliveira";
  const [toast, setToast] = useState<string | null>(null);

  const soap = useMemo(
    () => ({
      s: generatedSoap?.s ?? "",
      o: generatedSoap?.o ?? "",
      a: generatedSoap?.a ?? "",
      p: generatedSoap?.p ?? "",
    }),
    [generatedSoap],
  );

  const updateSoap = (key: "s" | "o" | "a" | "p", value: string) => {
    setGeneratedSoap({
      ...soap,
      [key]: value,
    });
  };

  const generatedDocs = useMemo<
    Array<{
      type: GeneratedDocument["type"];
      status: GeneratedDocument["status"];
      summary: string;
    }>
  >(
    () => [
      {
        type: "prescription",
        status: "ready" as const,
        summary: "Medicamentos com posologia detectada na fala",
      },
      {
        type: "exam-request",
        status: "ready" as const,
        summary: "Solicitações com indicação clínica",
      },
      {
        type: "tiss",
        status: "pending" as const,
        summary: "XML validado, aguardando integração final",
      },
    ],
    [],
  );

  const detectedReturn = detectedItems.find((item) => item.type === "return") ?? null;
  const suggestedReturnDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toLocaleDateString("pt-BR");
  }, []);

  const docLabels: Record<GeneratedDocument["type"], string> = {
    prescription: "Receituário",
    "exam-request": "Pedido de exames",
    tiss: "Guia TISS",
    certificate: "Atestado médico",
    referral: "Encaminhamento",
  };

  const iconBg: Record<GeneratedDocument["type"], string> = {
    prescription: "bg-[#E1F5EE]",
    "exam-request": "bg-[#E6F1FB]",
    tiss: "bg-[#FAEEDA]",
    certificate: "bg-[#F1EFE8]",
    referral: "bg-[#EEEDFE]",
  };

  const DocIcon = ({ type }: { type: GeneratedDocument["type"] }) => {
    if (type === "prescription") return <FileText className="h-4 w-4 text-hiro-green" />;
    if (type === "exam-request") return <FlaskConical className="h-4 w-4 text-[#185FA5]" />;
    if (type === "tiss") return <Grid2x2 className="h-4 w-4 text-[#854F0B]" />;
    if (type === "certificate") return <Award className="h-4 w-4 text-[#5F5E5A]" />;
    return <ArrowUpRight className="h-4 w-4 text-[#5E4BA3]" />;
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 1800);
  };

  const persistConsultation = () => {
    if (!patient) return;
    saveConsultationToPatient({
      id: consultationId,
      patientId: patient.id,
      date: new Date().toISOString().slice(0, 10),
      reason: consultationReason || "Atendimento clínico",
      duration: Math.max(1, Math.round(recordingSeconds / 60)),
      transcription: liveTranscription,
      soap,
      confirmedCids: cidSuggestions,
      detectedItems,
      documents: generatedDocs.map((doc) => ({
        type: doc.type,
        status: doc.status,
        content: doc.summary,
      })),
    });
  };

  const exportPdf = () => {
    if (!patient) return;
    persistConsultation();
    const w = window.open("", "_blank", "noopener,noreferrer,width=900,height=700");
    if (!w) return;
    const html = `
      <html>
        <head><title>Resumo clínico - ${patient.name}</title></head>
        <body style="font-family: Arial, sans-serif; padding:24px;">
          <h1>Resumo clínico - ${patient.name}</h1>
          <p>Data: ${new Date().toLocaleDateString("pt-BR")}</p>
          <h3>S - Subjetivo</h3><p>${soap.s}</p>
          <h3>O - Objetivo</h3><p>${soap.o}</p>
          <h3>A - Avaliação</h3><p>${soap.a}</p>
          <h3>P - Plano</h3><p>${soap.p}</p>
        </body>
      </html>
    `;
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
    showToast("Resumo clínico pronto para salvar em PDF.");
  };

  const handleSaveWithoutSign = () => {
    persistConsultation();
    saveSummary({
      consultationId,
      patientId: patient?.id ?? "",
      savedAt: new Date().toISOString(),
      soap,
    });
    router.push(`/pacientes/${patient?.id ?? ""}`);
  };

  if (!patient) return null;

  return (
    <div className="relative mt-6 grid gap-5 lg:grid-cols-12">
      {toast && (
        <div className="fixed right-6 top-6 z-50 rounded-xl border border-black/10 bg-hiro-card px-4 py-2 text-sm text-hiro-text">
          {toast}
        </div>
      )}

      <section className="space-y-5 lg:col-span-8">
        <CardHiro className="rounded-2xl p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="font-serif text-3xl font-normal text-hiro-text">
                Prontuário — {patient.name}
              </h1>
              <p className="mt-1 text-[13px] text-hiro-muted">
                {new Date().toLocaleDateString("pt-BR")} · {doctorName} ·{" "}
                {Math.max(1, Math.round(recordingSeconds / 60))} min de gravação
              </p>
            </div>
            <BadgeStatus label="Gerado pela IA — revise antes de salvar" status="pending" />
          </div>
        </CardHiro>

        {patientSummary ? (
          <CardHiro className="rounded-2xl border border-black/[0.06] bg-hiro-bg p-5">
            <OverlineLabel tone="muted">RESUMO PARA O PACIENTE</OverlineLabel>
            <p className="mt-2 text-[14px] leading-relaxed text-hiro-text">{patientSummary}</p>
          </CardHiro>
        ) : null}

        {flags.length > 0 && (
          <CardHiro className="rounded-2xl border border-hiro-amber/35 bg-[#FAEEDA]/50 p-5">
            <OverlineLabel>ALERTAS</OverlineLabel>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[13px] text-hiro-text">
              {flags.map((flag, index) => (
                <li key={`${index}-${flag.slice(0, 48)}`}>{flag}</li>
              ))}
            </ul>
          </CardHiro>
        )}

        <CardHiro className="rounded-2xl p-5">
          <div className="flex flex-col gap-4">
            {(["s", "o", "a", "p"] as const).map((key) => (
              <div key={key} className="flex flex-col gap-2">
                <OverlineLabel>
                  {key === "s"
                    ? "S — SUBJETIVO"
                    : key === "o"
                      ? "O — OBJETIVO"
                      : key === "a"
                        ? "A — AVALIAÇÃO"
                        : "P — PLANO"}
                </OverlineLabel>
                <textarea
                  value={soap[key]}
                  onChange={(e) => updateSoap(key, e.target.value)}
                  className="min-h-[80px] w-full resize-none rounded-xl border border-black/[0.08] bg-white/70 px-4 py-3 text-[13px] leading-relaxed text-hiro-text focus:border-hiro-green/40 focus:outline-none"
                  style={{ height: "auto" }}
                  onInput={(e) => {
                    const t = e.currentTarget;
                    t.style.height = "auto";
                    t.style.height = `${t.scrollHeight}px`;
                  }}
                />
              </div>
            ))}
          </div>

          <hr className="my-6 border-black/[0.08]" />
          <OverlineLabel>DOCUMENTOS GERADOS</OverlineLabel>
          <div className="mt-3 flex flex-col gap-2">
            {generatedDocs.map((doc) => (
              <div
                key={doc.type}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-black/[0.06] bg-hiro-card p-4 transition-colors hover:bg-[#DDD9D1]"
              >
                <div
                  className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${iconBg[doc.type]}`}
                >
                  <DocIcon type={doc.type} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-hiro-text">{docLabels[doc.type]}</p>
                  <p className="truncate text-[12px] text-hiro-muted">{doc.summary}</p>
                </div>
                <BadgeStatus
                  label={doc.status === "ready" ? "Pronto" : "Pendente"}
                  status={doc.status}
                />
              </div>
            ))}
          </div>
          <button className="mt-4 w-full rounded-full border border-black/15 px-5 py-2.5 text-[13px] text-hiro-muted">
            Assinar em lote — em breve
          </button>
        </CardHiro>
      </section>

      <aside className="flex flex-col gap-4 lg:col-span-4">
        <CardHiro className="flex flex-col gap-3 rounded-2xl p-5">
          <OverlineLabel>CID-10 CONFIRMADO</OverlineLabel>
          {(cidSuggestions.length ? cidSuggestions : patient.consultations.at(-1)?.confirmedCids ?? []).map(
            (cid) => (
              <div
                key={cid.code}
                className="flex items-center gap-2.5 border-b border-black/[0.06] py-2 last:border-0"
              >
                <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-hiro-green">
                  <Check className="h-2.5 w-2.5 text-white" />
                </div>
                <div>
                  <span className="text-[12px] font-medium text-hiro-text">{cid.code}</span>
                  <span className="ml-1.5 text-[12px] text-hiro-muted">{cid.name}</span>
                </div>
              </div>
            ),
          )}
          <button className="mt-1 text-left text-[12px] text-hiro-green">+ Adicionar CID</button>
        </CardHiro>

        {detectedReturn && (
          <CardHiro className="flex flex-col gap-3 rounded-2xl p-5">
            <OverlineLabel>RETORNO DETECTADO</OverlineLabel>
            <p className="text-[13px] text-hiro-muted">
              Detectado:{" "}
              <span className="font-medium text-hiro-text">{detectedReturn.sourceQuote}</span>
            </p>
            <div className="rounded-lg bg-[#E1F5EE] px-4 py-2.5 text-[13px] font-medium text-[#0F6E56]">
              {suggestedReturnDate}
            </div>
            <button className="w-full rounded-full border border-black/15 px-4 py-2 text-[13px] text-hiro-muted">
              Confirmar agendamento
            </button>
          </CardHiro>
        )}

        <CardHiro className="flex flex-col gap-3 rounded-2xl p-5">
          <OverlineLabel>ASSINAR E FINALIZAR</OverlineLabel>
          <details className="rounded-xl border border-black/10 bg-hiro-bg px-4 py-3">
            <summary className="cursor-pointer text-[13px] font-medium text-hiro-text">
              Exportar resumo clínico
            </summary>
            <button
              onClick={exportPdf}
              className="mt-3 w-full rounded-full bg-hiro-text px-5 py-2.5 text-[13px] font-medium text-white"
            >
              Salvar PDF do laudo
            </button>
          </details>
          <p className="text-center text-[11px] text-hiro-muted">
            Resumo e documentos podem ser salvos no prontuário do paciente.
          </p>
          <button
            onClick={handleSaveWithoutSign}
            className="mt-1 w-full rounded-full border border-black/15 px-4 py-2.5 text-[13px] text-hiro-muted"
          >
            Salvar consulta
          </button>
        </CardHiro>

        <CardHiro className="flex flex-col gap-3 rounded-2xl p-5">
          <OverlineLabel>EXPORTAR PARA</OverlineLabel>
          <div className="mt-1 flex flex-wrap gap-2">
            {["iClinic", "MV SOUL", "Tasy", "Pixeon", "HL7 FHIR"].map((s) => (
              <button
                key={s}
                onClick={() => showToast(`Integração com ${s} — em breve`)}
                className="rounded-full border border-black/[0.08] bg-white/50 px-3 py-1.5 text-[11px] text-hiro-muted transition-colors hover:bg-white/80"
              >
                {s}
              </button>
            ))}
          </div>
        </CardHiro>
      </aside>
    </div>
  );
}
