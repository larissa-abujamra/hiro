"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Check,
  Copy,
  FileText,
  FlaskConical,
  Grid2x2,
  Sparkles,
  X,
} from "lucide-react";

function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`rounded-md p-1.5 transition-colors ${
        copied
          ? "text-hiro-green"
          : "text-hiro-muted/30 hover:bg-black/[0.04] hover:text-hiro-muted"
      } ${className ?? ""}`}
      title={copied ? "Copiado!" : "Copiar"}
    >
      {copied ? <Check className="h-3.5 w-3.5" strokeWidth={2} /> : <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />}
    </button>
  );
}
import { CardHiro } from "@/components/ui/CardHiro";
import { OverlineLabel } from "@/components/ui/OverlineLabel";
import { BadgeStatus } from "@/components/ui/BadgeStatus";
import { generateProntuarioPDF } from "@/lib/generatePdf";
import { iconCircleGlassOnLightCard } from "@/lib/iconCircleGlassStyles";
import { useConsultationStore } from "@/lib/store";
import type { GeneratedDocument, Patient } from "@/lib/types";
import { MemedPrescription } from "@/components/prontuario/MemedPrescription";
import { CIDSearchModal } from "@/components/cid/CIDSearchModal";
import { ReceitaModal } from "@/components/documentos/ReceitaModal";
import { PedidoExamesModal } from "@/components/documentos/PedidoExamesModal";
import type { Medicamento } from "@/lib/generateReceita";
import { useDoctorStore } from "@/lib/doctorStore";
import { specialtyConfigs } from "@/data/specialty-fields";

function CopyFullSoapButton({ soap }: { soap: { s: string; o: string; a: string; p: string } }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = `SUBJETIVO:\n${soap.s}\n\nOBJETIVO:\n${soap.o}\n\nAVALIAÇÃO:\n${soap.a}\n\nPLANO:\n${soap.p}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center justify-center gap-2 rounded-full border border-black/[0.08] bg-transparent px-5 py-2.5 text-[13px] font-medium text-hiro-muted transition-all duration-200 hover:bg-black/[0.03] active:scale-[0.98]"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-hiro-green" strokeWidth={2} />
          <span className="text-hiro-green">Copiado!</span>
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" strokeWidth={1.75} />
          Copiar Prontuário Completo
        </>
      )}
    </button>
  );
}

/* ─── Return date calculation ────────────────────────────────────────────── */

const WORD_TO_NUM: Record<string, number> = {
  um: 1, uma: 1, dois: 2, duas: 2, "três": 3, tres: 3,
  quatro: 4, cinco: 5, seis: 6, sete: 7, oito: 8,
  nove: 9, dez: 10, quinze: 15, vinte: 20, trinta: 30,
};

function addDays(date: Date, days: number): Date {
  const r = new Date(date);
  r.setDate(r.getDate() + days);
  return r;
}

function calculateReturnDate(text: string, today: Date): Date {
  let t = text;
  // Replace words with numbers
  for (const [word, num] of Object.entries(WORD_TO_NUM)) {
    t = t.replace(new RegExp(`\\b${word}\\b`, "gi"), String(num));
  }

  // "2, 3 dias" or "2 a 3 dias" → use the higher number
  const rangeMatch = t.match(/(\d+)\s*[,a]\s*(\d+)\s*dias?/);
  if (rangeMatch) return addDays(today, Math.max(Number(rangeMatch[1]), Number(rangeMatch[2])));

  // "X meses" or "X mês"
  const monthsMatch = t.match(/(\d+)\s*m[eê]s(?:es)?/);
  if (monthsMatch) return addDays(today, Number(monthsMatch[1]) * 30);

  // "X semanas"
  const weeksMatch = t.match(/(\d+)\s*semanas?/);
  if (weeksMatch) return addDays(today, Number(weeksMatch[1]) * 7);

  // "X dias"
  const daysMatch = t.match(/(\d+)\s*dias?/);
  if (daysMatch) return addDays(today, Number(daysMatch[1]));

  // Fallback: 7 days
  return addDays(today, 7);
}

function formatReturnDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/* ─────────────────────────────────────────────────────────────────────────── */

interface GeneratedSummaryWorkspaceProps {
  consultationId: string;
  patients: Patient[];
}

export function GeneratedSummaryWorkspace({
  consultationId,
  patients,
}: GeneratedSummaryWorkspaceProps) {
  const router = useRouter();
  const [patientIdFromUrl, setPatientIdFromUrl] = useState<string | null>(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("patient");
    if (pid) setPatientIdFromUrl(pid);
  }, []);

  const patientsInStore = useConsultationStore((state) => state.patients);
  const selectedPatientId = useConsultationStore((state) => state.selectedPatientId);
  const consultationReason = useConsultationStore((state) => state.consultationReason);
  const recordingSeconds = useConsultationStore((state) => state.recordingSeconds);
  const liveTranscription = useConsultationStore((state) => state.liveTranscription);
  const cidSuggestions = useConsultationStore((state) => state.cidSuggestions);
  const diagnosticosSugeridos = useConsultationStore((state) => state.diagnosticosSugeridos);
  const detectedItems = useConsultationStore((state) => state.detectedItems);
  const generatedSoap = useConsultationStore((state) => state.generatedSoap);
  const setGeneratedSoap = useConsultationStore((state) => state.setGeneratedSoap);
  const generatedSpecialtyFields = useConsultationStore((state) => state.generatedSpecialtyFields);
  const flags = useConsultationStore((state) => state.flags);
  const saveSummary = useConsultationStore((state) => state.saveSummary);
  const addActivity = useConsultationStore((state) => state.addActivity);

  const [consultationData, setConsultationData] = useState<Record<string, unknown> | null>(null);
  const [isLoadingConsultation, setIsLoadingConsultation] = useState(true);

  useEffect(() => {
    if (!consultationId) return;
    let cancelled = false;
    async function load() {
      setIsLoadingConsultation(true);
      try {
        const res = await fetch(`/api/consultations/${consultationId}`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          console.log("[Prontuário] Loaded consultation from DB:", data?.id);
          setConsultationData(data);
        }
      } catch (err) {
        console.error("[Prontuário] Error loading consultation:", err);
      } finally {
        if (!cancelled) setIsLoadingConsultation(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [consultationId]);

  const dbSoap = consultationData
    ? {
        s: (consultationData.subjetivo as string) ?? "",
        o: (consultationData.objetivo as string) ?? "",
        a: (consultationData.avaliacao as string) ?? "",
        p: (consultationData.plano as string) ?? "",
      }
    : null;

  const dbPatientId = (consultationData?.patient_id as string) ?? null;
  const sourcePatients = patientsInStore.length ? patientsInStore : patients;
  const resolvedPatientId = selectedPatientId ?? patientIdFromUrl ?? dbPatientId;

  const patient =
    (resolvedPatientId
      ? sourcePatients.find((item) => item.id === resolvedPatientId)
      : null) ??
    sourcePatients[0] ??
    null;

  const savedConsultation = patient?.consultations.find(
    (c) => c.id === consultationId
  ) ?? null;
  const isReviewMode = !generatedSoap && (!!savedConsultation || !!consultationData);

  const doctorProfile = useDoctorStore((s) => s.profile);
  const doctorName = doctorProfile.nome
    ? `${doctorProfile.sexo === "M" ? "Dr." : "Dra."} ${doctorProfile.nome} ${doctorProfile.sobrenome}`.trim()
    : "Dra. Larissa Oliveira";
  const [toast, setToast] = useState<string | null>(null);
  const [receitaOpen, setReceitaOpen] = useState(false);
  const [pedidoOpen, setPedidoOpen] = useState(false);
  const [cidModalOpen, setCidModalOpen] = useState(false);
  const [addedCids, setAddedCids] = useState<{ code: string; name: string }[]>([]);

  const soapSource = generatedSoap ?? dbSoap ?? savedConsultation?.soap ?? null;
  const soap = useMemo(
    () => ({
      s: soapSource?.s ?? "",
      o: soapSource?.o ?? "",
      a: soapSource?.a ?? "",
      p: soapSource?.p ?? "",
    }),
    [soapSource],
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
    ],
    [],
  );

  const resolvedCids = cidSuggestions.length > 0
    ? cidSuggestions
    : savedConsultation?.confirmedCids ?? [];
  const resolvedDetectedItems = detectedItems.length > 0
    ? detectedItems
    : savedConsultation?.detectedItems ?? [];
  const resolvedTranscription = liveTranscription.length > 0
    ? liveTranscription
    : savedConsultation?.transcription ?? [];
  const resolvedReason = consultationReason || (consultationData?.chief_complaint as string) || savedConsultation?.reason || "Atendimento clínico";
  const resolvedDuration = recordingSeconds > 0
    ? Math.max(1, Math.round(recordingSeconds / 60))
    : (consultationData?.duration_minutes as number) ?? savedConsultation?.duration ?? 0;

  const detectedReturn = resolvedDetectedItems.find((item) => item.type === "return") ?? null;
  const suggestedReturnDate = useMemo(() => {
    const today = new Date();

    if (!detectedReturn) {
      today.setDate(today.getDate() + 7);
      return formatReturnDate(today);
    }

    const text = (detectedReturn.sourceQuote || detectedReturn.text || "").toLowerCase();
    return formatReturnDate(calculateReturnDate(text, today));
  }, [detectedReturn]);

  const docLabels: Record<GeneratedDocument["type"], string> = {
    prescription: "Receituário",
    "exam-request": "Pedido de exames",
    tiss: "Guia TISS",
    certificate: "Atestado médico",
    referral: "Encaminhamento",
  };

  const DocIcon = ({ type }: { type: GeneratedDocument["type"] }) => {
    if (type === "prescription") return <FileText className="h-4 w-4 text-hiro-green" />;
    if (type === "exam-request") return <FlaskConical className="h-4 w-4 text-[#185FA5]" />;
    if (type === "tiss") return <Grid2x2 className="h-4 w-4 text-[#854F0B]" />;
    if (type === "certificate") return <Sparkles className="h-4 w-4 text-[#5F5E5A]" />;
    return <ArrowUpRight className="h-4 w-4 text-[#5E4BA3]" />;
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 1800);
  };

  const persistConsultation = async () => {
    if (!patient) return;

    const soapPayload = {
      subjetivo: soap.s,
      objetivo: soap.o,
      avaliacao: soap.a,
      plano: soap.p,
    };

    try {
      const res = await fetch(`/api/consultations/${consultationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcription: JSON.stringify(resolvedTranscription),
          subjetivo: soap.s,
          objetivo: soap.o,
          avaliacao: soap.a,
          plano: soap.p,
          soap: soapPayload,
          chief_complaint: resolvedReason,
          duration_minutes: resolvedDuration,
          ended_at: new Date().toISOString(),
          status: "completed",
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("[Prontuário] Failed to persist consultation:", err);
      }
    } catch (err) {
      console.error("[Prontuário] Error persisting consultation:", err);
    }
  };

  const handleSavePDF = () => {
    if (!patient) return;
    persistConsultation();
    addActivity({ type: "prontuario_generated", patientName: patient.name });
    const dateStr = new Date().toLocaleDateString("pt-BR");
    const confirmedForPdf = resolvedCids.map((c) => ({ code: c.code, name: c.name }));
    const patientAge = Math.max(
      0,
      new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear(),
    );
    generateProntuarioPDF({
      patientName: patient.name,
      patientAge,
      date: dateStr,
      doctorName,
      duration: resolvedDuration,
      soap: { s: soap.s, o: soap.o, a: soap.a, p: soap.p },
      confirmedCids: confirmedForPdf,
      medications: patient.medications.map((m) => `${m.name} (${m.dose})`),
    });
    showToast("PDF preparado para salvar");
  };

  const handleSaveWithoutSign = () => {
    persistConsultation();
    addActivity({ type: "consultation_saved", patientName: patient?.name ?? "" });
    saveSummary({
      consultationId,
      patientId: patient?.id ?? "",
      savedAt: new Date().toISOString(),
      soap,
    });
    router.push(`/pacientes/${patient?.id ?? ""}`);
  };

  if (isLoadingConsultation && !generatedSoap) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-hiro-green border-t-transparent" />
      </div>
    );
  }

  if (!patient) return null;

  return (
    <div className="relative mt-6 grid gap-5 lg:grid-cols-12">
      {toast && (
        <div className="glass-card fixed right-6 top-6 z-50 rounded-xl px-4 py-2 text-sm text-hiro-text">
          {toast}
        </div>
      )}

      <section className="space-y-5 lg:col-span-8">
        <CardHiro className="rounded-2xl p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="font-serif text-3xl font-normal tracking-tight text-balance text-hiro-text">
                Prontuário — {patient.name}
              </h1>
              <p className="mt-1 max-w-[65ch] text-[13px] leading-relaxed text-hiro-muted">
                {new Date().toLocaleDateString("pt-BR")} · {doctorName} ·{" "}
                <span className="tabular-nums">
                  {resolvedDuration > 0 ? `${resolvedDuration} min de gravação` : ""}
                </span>
              </p>
            </div>
            <span className="glass-ia-badge inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-medium text-hiro-text">
              Gerado pela IA — revise antes de salvar
            </span>
          </div>
        </CardHiro>

        {flags.length > 0 && (
          <CardHiro className="rounded-2xl border border-hiro-amber/35 bg-[#FAEEDA]/50 p-5">
            <OverlineLabel>ALERTAS</OverlineLabel>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[15px] text-hiro-text">
              {flags.map((flag, index) => (
                <li key={`${index}-${flag.slice(0, 48)}`}>{flag}</li>
              ))}
            </ul>
          </CardHiro>
        )}

        <CardHiro className="hiro-surface-glow rounded-2xl p-5">
          <div className="flex flex-col gap-4">
            {(["s", "o", "a", "p"] as const).map((key) => {
              const sectionMap = { s: "subjetivo", o: "objetivo", a: "avaliacao", p: "plano" } as const;
              const soapHeading =
                key === "s"
                  ? { title: "Subjetivo", hint: "Relato do paciente" }
                  : key === "o"
                    ? { title: "Objetivo", hint: "Exames e medidas" }
                    : key === "a"
                      ? { title: "Avaliação", hint: "Diagnóstico / raciocínio" }
                      : { title: "Plano", hint: "Conduta" };

              // Find specialty fields for this section
              const specialty = doctorProfile.especialidade;
              const config = specialty ? specialtyConfigs[specialty] : null;
              const sectionFields = config?.fields.filter(
                (f) => f.section === sectionMap[key] && generatedSpecialtyFields[f.id]
              ) ?? [];

              return (
              <div key={key} className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div>
                    <OverlineLabel>{soapHeading.title.toUpperCase()}</OverlineLabel>
                    <p className="text-[12px] leading-snug text-hiro-muted">{soapHeading.hint}</p>
                  </div>
                  <CopyButton text={soap[key]} />
                </div>
                <textarea
                  value={soap[key]}
                  onChange={(e) => updateSoap(key, e.target.value)}
                  className="glass-card-input min-h-[80px] w-full resize-none rounded-xl px-4 py-3 text-[15px] leading-relaxed text-hiro-text focus:outline-none focus:ring-2 focus:ring-hiro-green/30"
                  style={{ height: "auto" }}
                  onInput={(e) => {
                    const t = e.currentTarget;
                    t.style.height = "auto";
                    t.style.height = `${t.scrollHeight}px`;
                  }}
                />
                {sectionFields.length > 0 && (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 rounded-xl border border-black/[0.04] bg-white/30 px-4 py-3">
                    {sectionFields.map((f) => (
                      <div key={f.id} className="text-[12px]">
                        <span className="text-hiro-muted">{f.label}: </span>
                        <span className="font-medium text-hiro-text">
                          {generatedSpecialtyFields[f.id]}
                          {f.unit ? ` ${f.unit}` : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              );
            })}
          </div>
        </CardHiro>

        {/* Copy full SOAP */}
        <CopyFullSoapButton soap={soap} />
      </section>

      <aside className="flex flex-col gap-4 lg:col-span-4">
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
          <OverlineLabel>SALVAR</OverlineLabel>
          <button
            onClick={handleSaveWithoutSign}
            className="w-full rounded-xl bg-[#2d5a47] px-5 py-4 text-[14px] font-medium text-white transition-all duration-200 hover:bg-[#244a3b] hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(45,92,63,0.2)] active:translate-y-0 active:scale-[0.98]"
          >
            Salvar consulta
          </button>
          <p className="text-center text-[11px] text-hiro-muted">
            Resumo e documentos salvos no prontuário do paciente.
          </p>
        </CardHiro>

        {/* CID Confirmado */}
        <CardHiro className="flex flex-col gap-3 rounded-2xl p-5">
          <OverlineLabel>CID-10 CONFIRMADO</OverlineLabel>
          {[...resolvedCids.map((c) => ({ code: c.code, name: c.name })), ...addedCids].length === 0 && diagnosticosSugeridos.length === 0 && (
            <p className="text-[12px] italic text-hiro-muted/60">Nenhum CID confirmado ainda.</p>
          )}
          {[...resolvedCids.map((c) => ({ code: c.code, name: c.name })), ...addedCids].map((cid) => (
            <div key={cid.code} className="flex items-center gap-2.5 border-b border-black/[0.06] py-2 last:border-0">
              <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-hiro-green">
                <Check className="h-2.5 w-2.5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[12px] font-medium text-hiro-text">{cid.code}</span>
                <span className="ml-1.5 text-[12px] text-hiro-muted">{cid.name}</span>
              </div>
              <button type="button" onClick={() => setAddedCids((prev) => prev.filter((c) => c.code !== cid.code))} className="shrink-0 rounded-full p-0.5 text-hiro-muted/30 transition-colors hover:text-hiro-red">
                <X className="h-3 w-3" strokeWidth={2} />
              </button>
            </div>
          ))}
          {diagnosticosSugeridos.length > 0 && (
            <div className="mt-2 space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-hiro-amber">Sugerido pela IA — selecione o CID</p>
              {diagnosticosSugeridos.map((diag, idx) => (
                <div key={idx} className="rounded-xl border border-hiro-amber/20 bg-[#FAEEDA]/30 px-3 py-2.5">
                  <p className="text-[12px] font-medium text-hiro-text">{diag.texto}</p>
                  <p className="text-[10px] text-hiro-muted">{diag.categoria}</p>
                  {diag.sourceQuote && <p className="mt-1 text-[10px] italic text-hiro-muted/60">"{diag.sourceQuote}"</p>}
                  <div className="mt-2 space-y-1">
                    {diag.matchCodes.slice(0, 5).map((match) => {
                      const alreadyAdded = addedCids.some((c) => c.code === match.codigo) || resolvedCids.some((c) => c.code === match.codigo);
                      return (
                        <button key={match.codigo} type="button" disabled={alreadyAdded} onClick={() => setAddedCids((prev) => [...prev, { code: match.codigo, name: match.descricao }])} className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[12px] transition-colors ${alreadyAdded ? "opacity-40" : "hover:bg-black/[0.04]"}`}>
                          <span className="font-semibold text-hiro-green">{match.codigo}</span>
                          <span className="flex-1 text-hiro-text">{match.descricao}</span>
                          {alreadyAdded ? <Check className="h-3 w-3 text-hiro-green" strokeWidth={2} /> : <span className="text-[10px] text-hiro-green">+</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
          <button type="button" onClick={() => setCidModalOpen(true)} className="mt-1 text-left text-[12px] font-medium text-hiro-green transition-colors hover:text-hiro-green/80">+ Buscar CID manualmente</button>
        </CardHiro>

        <CardHiro className="flex flex-col gap-3 rounded-2xl p-5">
          <OverlineLabel>DOCUMENTOS GERADOS</OverlineLabel>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={handleSavePDF}
              className="glass-card-input flex cursor-pointer items-center gap-3 rounded-xl p-4 text-left transition-all duration-150 ease-out hover:-translate-y-px hover:bg-black/[0.03] active:scale-[0.995]"
            >
              <div
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
                style={iconCircleGlassOnLightCard}
              >
                <FileText className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-hiro-text">Resumo clínico</p>
                <p className="truncate text-[12px] text-hiro-muted">Prontuário completo em PDF</p>
              </div>
              <BadgeStatus label="Pronto" status="ready" />
            </button>

            {generatedDocs.map((doc) => (
              <button
                key={doc.type}
                type="button"
                onClick={() => {
                  if (doc.type === "prescription") setReceitaOpen(true);
                  if (doc.type === "exam-request") setPedidoOpen(true);
                }}
                className="glass-card-input flex cursor-pointer items-center gap-3 rounded-xl p-4 text-left transition-all duration-150 ease-out hover:-translate-y-px hover:bg-black/[0.03] active:scale-[0.995]"
              >
                <div
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
                  style={iconCircleGlassOnLightCard}
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
              </button>
            ))}
          </div>
        </CardHiro>

        <CardHiro className="flex flex-col gap-3 rounded-2xl p-5">
          <OverlineLabel>PRESCRIÇÃO DIGITAL</OverlineLabel>
          <p className="text-[12px] leading-relaxed text-hiro-muted">
            Prescreva digitalmente via Memed com assinatura integrada.
          </p>
          <MemedPrescription
            planText={soap.p}
            prescriptionItems={resolvedDetectedItems.filter((i) => i.type === "prescription")}
          />
        </CardHiro>
      </aside>

      {/* ─── Modals ──────────────────────────────────────────────────────── */}

      <CIDSearchModal
        isOpen={cidModalOpen}
        onClose={() => setCidModalOpen(false)}
        existingCodes={[
          ...resolvedCids.map((c) => c.code),
          ...addedCids.map((c) => c.code),
        ]}
        onAdd={(code, name) => {
          setAddedCids((prev) => [...prev, { code, name }]);
        }}
      />

      <ReceitaModal
        isOpen={receitaOpen}
        onClose={() => setReceitaOpen(false)}
        patientName={patient.name}
        doctorName={doctorName}
        crm={doctorProfile.crm || "000000"}
        uf={doctorProfile.uf || "SP"}
        initialMeds={extractMedsFromPlan(soap.p, resolvedDetectedItems)}
      />

      <PedidoExamesModal
        isOpen={pedidoOpen}
        onClose={() => setPedidoOpen(false)}
        patientName={patient.name}
        patientAge={Math.max(0, new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear())}
        doctorName={doctorName}
        crm={doctorProfile.crm || "000000"}
        uf={doctorProfile.uf || "SP"}
        initialExames={extractExamesFromSoap(soap, resolvedDetectedItems)}
        initialIndicacao={soap.a}
      />
    </div>
  );
}

/* ─── Extraction helpers ─────────────────────────────────────────────────── */

function extractMedsFromPlan(plan: string, items: { type: string; text: string }[]): Medicamento[] {
  const meds: Medicamento[] = [];

  // From detected prescription items
  items
    .filter((i) => i.type === "prescription")
    .forEach((item) => {
      meds.push({ nome: item.text, dosagem: "", posologia: "", quantidade: "" });
    });

  // From plan text — look for common patterns
  if (plan && meds.length === 0) {
    const lines = plan.split(/[;\n]/).map((l) => l.trim()).filter(Boolean);
    const medPattern = /(\w[\w\s]+?)\s+(\d+\s*mg|\d+\s*ml|\d+\s*mcg|\d+\s*g)/i;
    for (const line of lines) {
      const match = line.match(medPattern);
      if (match) {
        meds.push({
          nome: match[1].trim(),
          dosagem: match[2].trim(),
          posologia: line.replace(match[0], "").replace(/^[,;.\s-]+/, "").trim(),
          quantidade: "",
        });
      }
    }
  }

  return meds;
}

function extractExamesFromSoap(
  soap: { s: string; o: string; a: string; p: string },
  items: { type: string; text: string }[],
): string[] {
  const exames: string[] = [];

  // From detected exam items
  items
    .filter((i) => i.type === "exam")
    .forEach((item) => {
      if (!exames.includes(item.text)) exames.push(item.text);
    });

  // From plan text — look for exam keywords
  const fullText = `${soap.p} ${soap.o}`.toLowerCase();
  const examKeywords = [
    { keyword: "hemograma", name: "Hemograma completo" },
    { keyword: "glicemia", name: "Glicemia de jejum" },
    { keyword: "hba1c", name: "Hemoglobina glicada (HbA1c)" },
    { keyword: "hemoglobina glicada", name: "Hemoglobina glicada (HbA1c)" },
    { keyword: "colesterol", name: "Colesterol total e frações" },
    { keyword: "triglicerídeo", name: "Triglicerídeos" },
    { keyword: "triglicerideos", name: "Triglicerídeos" },
    { keyword: "tgo", name: "TGO / TGP" },
    { keyword: "tgp", name: "TGO / TGP" },
    { keyword: "transaminase", name: "TGO / TGP" },
    { keyword: "ureia", name: "Ureia e creatinina" },
    { keyword: "creatinina", name: "Ureia e creatinina" },
    { keyword: "ácido úrico", name: "Ácido úrico" },
    { keyword: "acido urico", name: "Ácido úrico" },
    { keyword: "tsh", name: "TSH e T4 livre" },
    { keyword: "tireoide", name: "TSH e T4 livre" },
    { keyword: "urina", name: "Urina tipo 1 (EAS)" },
    { keyword: "raio-x", name: "Raio-X de tórax" },
    { keyword: "raio x", name: "Raio-X de tórax" },
    { keyword: "eletrocardiograma", name: "Eletrocardiograma" },
    { keyword: "ecg", name: "Eletrocardiograma" },
    { keyword: "ultrassom", name: "Ultrassom abdominal" },
  ];

  for (const { keyword, name } of examKeywords) {
    if (fullText.includes(keyword) && !exames.includes(name)) {
      exames.push(name);
    }
  }

  return exames;
}
