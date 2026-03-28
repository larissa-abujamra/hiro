"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Mic, Play, Square } from "lucide-react";
import { CardHiro } from "@/components/ui/CardHiro";
import { OverlineLabel } from "@/components/ui/OverlineLabel";
import { AvatarInitials } from "@/components/ui/AvatarInitials";
import { ButtonHiro } from "@/components/ui/ButtonHiro";
import { useCidSuggestions } from "@/hooks/useCidSuggestions";
import { useDetection } from "@/hooks/useDetection";
import { useTranscription } from "@/hooks/useTranscription";
import { useConsultationStore } from "@/lib/store";
import type { DetectedItem, Patient } from "@/lib/types";

function detectedItemMeta(item: DetectedItem) {
  const badgeClass =
    item.type === "prescription"
      ? "bg-[#FAEEDA] text-[#854F0B]"
      : item.type === "exam"
        ? "bg-[#E1F5EE] text-[#0F6E56]"
        : item.type === "return"
          ? "bg-[#E6F1FB] text-[#185FA5]"
          : item.type === "certificate"
            ? "bg-[#F5F0E6] text-[#6B5B2E]"
            : item.type === "referral"
              ? "bg-[#EDEAF5] text-[#4A3D7A]"
              : "bg-[#F1EFE8] text-[#5F5E5A]";

  const typeLabel =
    item.type === "prescription"
      ? "Receituário"
      : item.type === "exam"
        ? "Pedido de exames"
        : item.type === "return"
          ? "Retorno"
          : item.type === "certificate"
            ? "Atestado"
            : item.type === "referral"
              ? "Encaminhamento"
              : "Detectado";

  return { badgeClass, typeLabel };
}

interface ConsultationWorkspaceProps {
  consultationId: string;
  patients: Patient[];
}

export function ConsultationWorkspace({
  consultationId,
  patients,
}: ConsultationWorkspaceProps) {
  const patientsInStore = useConsultationStore((state) => state.patients);
  const selectedPatientId = useConsultationStore((state) => state.selectedPatientId);
  const activeConsultationId = useConsultationStore(
    (state) => state.activeConsultationId,
  );
  const reason = useConsultationStore((state) => state.consultationReason);
  const recordingSeconds = useConsultationStore((state) => state.recordingSeconds);
  const detectedItems = useConsultationStore((state) => state.detectedItems);
  const setActiveConsultation = useConsultationStore(
    (state) => state.setActiveConsultation,
  );
  const startRecording = useConsultationStore((state) => state.startRecording);
  const stopRecording = useConsultationStore((state) => state.stopRecording);
  const tickRecording = useConsultationStore((state) => state.tickRecording);
  const setTranscriptionLines = useConsultationStore(
    (state) => state.setTranscriptionLines,
  );
  const setGeneratedSoap = useConsultationStore((state) => state.setGeneratedSoap);
  const setPatientSummary = useConsultationStore((state) => state.setPatientSummary);
  const setFlags = useConsultationStore((state) => state.setFlags);
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [recordingPhase, setRecordingPhase] = useState<"idle" | "recording" | "paused">(
    "idle",
  );
  const panelRef = useRef<HTMLDivElement>(null);
  const {
    lines,
    interimText,
    isSupported,
    error,
    start,
    stop,
    wordCount,
  } = useTranscription();

  const { analyze } = useDetection(consultationId);
  const { analyze: analyzeCids } = useCidSuggestions(consultationId);

  useEffect(() => {
    if (activeConsultationId !== consultationId) {
      setActiveConsultation(consultationId);
    }
  }, [activeConsultationId, consultationId, setActiveConsultation]);

  useEffect(() => {
    const timer = setInterval(() => tickRecording(), 1000);
    return () => clearInterval(timer);
  }, [tickRecording]);

  useEffect(() => {
    panelRef.current?.scrollTo({
      top: panelRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [lines, interimText]);

  useEffect(() => {
    const mapped = lines.map((line) => ({
      speaker: "doctor" as const,
      text: line.text,
      timestamp: line.timestamp,
      isFinal: line.isFinal,
    }));
    setTranscriptionLines(mapped);
  }, [lines, setTranscriptionLines]);

  const sourcePatients = patientsInStore.length ? patientsInStore : patients;
  const patient =
    sourcePatients.find((item) => item.id === selectedPatientId) ??
    sourcePatients[0] ??
    null;

  const age = patient
    ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()
    : null;

  const timerLabel = useMemo(() => {
    const minutes = `${Math.floor(recordingSeconds / 60)}`.padStart(2, "0");
    const seconds = `${recordingSeconds % 60}`.padStart(2, "0");
    return `${minutes}:${seconds}`;
  }, [recordingSeconds]);

  const isRecordingActive = recordingPhase === "recording";
  const isPaused = recordingPhase === "paused";

  const handleStopAndGenerate = useCallback(async () => {
    if (recordingSeconds < 30) return;

    stop();
    stopRecording();
    setRecordingPhase("idle");
    setIsGenerating(true);

    try {
      const store = useConsultationStore.getState();
      const list = store.patients;
      const sp = store.selectedPatientId
        ? list.find((p) => p.id === store.selectedPatientId) ?? null
        : null;

      const transcriptText = store.liveTranscription
        .map((l) => l.text)
        .join(" ")
        .trim();

      const patientContext = sp
        ? `${sp.name}, ${new Date().getFullYear() - new Date(sp.dateOfBirth).getFullYear()} anos.
Condições: ${sp.cids.map((c) => c.name).join(", ") || "não informado"}.
Medicamentos ativos: ${sp.medications
            .filter((m) => m.status === "active")
            .map((m) => `${m.name} ${m.dose}`)
            .join(", ") || "nenhum"}.`
        : null;

      const res = await fetch("/api/prontuario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcription: transcriptText,
          patientContext,
          confirmedCids: store.cidSuggestions,
          detectedItems: store.detectedItems,
        }),
      });

      const data = (await res.json()) as {
        soap?: { s?: string; o?: string; a?: string; p?: string };
        summary?: string;
        flags?: unknown[];
      };

      const soap = data.soap ?? {};
      setGeneratedSoap({
        s: typeof soap.s === "string" ? soap.s : "",
        o: typeof soap.o === "string" ? soap.o : "",
        a: typeof soap.a === "string" ? soap.a : "",
        p: typeof soap.p === "string" ? soap.p : "",
      });
      setPatientSummary(typeof data.summary === "string" ? data.summary : "");
      setFlags(
        Array.isArray(data.flags)
          ? data.flags.filter((f): f is string => typeof f === "string")
          : [],
      );

      router.push(`/consulta/${consultationId}/resumo`);
    } catch (err) {
      console.error("Prontuário error:", err);
      router.push(`/consulta/${consultationId}/resumo`);
    } finally {
      setIsGenerating(false);
    }
  }, [
    consultationId,
    recordingSeconds,
    router,
    setFlags,
    setGeneratedSoap,
    setPatientSummary,
    stop,
    stopRecording,
  ]);

  const toggleMainRecording = () => {
    if (!isSupported) return;

    if (recordingPhase === "idle") {
      const ok = start();
      if (!ok) return;
      startRecording();
      setRecordingPhase("recording");
      return;
    }
    if (recordingPhase === "recording") {
      stop();
      setRecordingPhase("paused");
      stopRecording();
      return;
    }
    const ok = start();
    if (!ok) return;
    startRecording();
    setRecordingPhase("recording");
  };

  useEffect(() => {
    if (lines.length === 0) return;
    const last = lines[lines.length - 1];
    if (!last.isFinal) return;

    const previous = lines.slice(-6, -1).map((l) => l.text);
    void analyze(last.text, previous);
  }, [lines, analyze]);

  useEffect(() => {
    if (lines.length === 0) return;
    const last = lines[lines.length - 1];
    if (!last.isFinal) return;

    const allTexts = lines.filter((l) => l.isFinal).map((l) => l.text);
    void analyzeCids(allTexts);
  }, [lines, analyzeCids]);

  const lastConsultation = patient?.consultations.at(-1) ?? null;

  const detectedByTypes = useMemo(() => {
    const exam = detectedItems.filter((i) => i.type === "exam");
    const plano = detectedItems.filter((i) =>
      ["prescription", "return", "certificate", "referral"].includes(i.type),
    );
    return { exam, plano };
  }, [detectedItems]);

  if (!patient) {
    return (
      <section className="rounded-2xl border border-black/8 bg-hiro-card p-6">
        <p className="text-sm text-hiro-muted">
          Nenhum paciente disponível para iniciar consulta.
        </p>
      </section>
    );
  }

  return (
    <div className="relative mt-6 grid gap-5 pb-24 lg:grid-cols-12">
      {isGenerating && (
        <div
          className="glass-loading-overlay fixed inset-0 z-[100] flex flex-col items-center justify-center gap-3 px-6"
          role="alertdialog"
          aria-busy="true"
          aria-label="Gerando prontuário"
        >
          <Loader2 className="h-10 w-10 animate-spin text-hiro-active" aria-hidden />
          <p className="text-center font-medium text-hiro-text">Gerando prontuário</p>
          <p className="max-w-[65ch] text-center text-sm leading-relaxed text-hiro-muted">
            A IA está analisando a transcrição
          </p>
        </div>
      )}
      <section className="space-y-5 lg:col-span-7">
        <CardHiro className="rounded-2xl p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <AvatarInitials name={patient.name} />
              <div>
                <p className="text-[15px] font-medium text-hiro-text">{patient.name}</p>
                <p className="text-[13px] text-hiro-muted">
                  {age} anos · {reason || "Motivo não informado"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-white/60 px-2.5 py-1 text-[11px] text-hiro-muted">
                {patient.consultations.length} consultas anteriores
              </span>
              <Link
                href={`/pacientes/${patient.id}`}
                className="link-arrow text-[12px] font-medium text-hiro-green underline-offset-2 hover:underline"
              >
                <span>Ver perfil</span>
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </CardHiro>

        <CardHiro className="hiro-surface-glow rounded-2xl p-8">
          <div className="flex flex-col items-center gap-5">
            <button
              type="button"
              onClick={toggleMainRecording}
              className={`relative flex h-20 w-20 cursor-pointer items-center justify-center rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hiro-active/50 focus-visible:ring-offset-2 active:scale-[0.97] ${
                isRecordingActive
                  ? "bg-[#8B1A1A] text-white rec-ring"
                  : isPaused
                    ? "border-2 border-hiro-active bg-hiro-card text-hiro-active"
                    : "bg-hiro-active text-white"
              }`}
            >
              {isRecordingActive ? (
                <Square className="relative h-6 w-6" />
              ) : isPaused ? (
                <Play className="relative h-7 w-7" />
              ) : (
                <Mic className="relative h-7 w-7" />
              )}
            </button>

            {isRecordingActive && (
              <div
                className="flex w-full max-w-[220px] flex-col items-center gap-2 rounded-xl border border-[#8B1A1A]/30 bg-[#FAECE7]/50 px-4 py-3"
                role="status"
                aria-live="polite"
              >
                <div className="flex h-9 items-end justify-center gap-0.5">
                  {[0, 0.1, 0.2, 0.15, 0.05, 0.12, 0.08, 0.03].map((delay, i) => (
                    <div
                      key={i}
                      className="w-1.5 rounded-full bg-[#8B1A1A]"
                      style={{
                        animation: "waveBar 1s ease-in-out infinite",
                        animationDelay: `${delay}s`,
                      }}
                    />
                  ))}
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8B1A1A]">
                  Gravando
                </p>
              </div>
            )}

            <p
              className={`font-serif text-[28px] tabular-nums ${
                isRecordingActive ? "text-[#8B1A1A]" : "text-hiro-text"
              }`}
            >
              {timerLabel}
            </p>
            <p className="text-center text-[13px] text-hiro-muted">
              {recordingPhase === "idle"
                ? "Toque para iniciar a gravação"
                : recordingPhase === "recording"
                  ? "Gravando — toque para pausar"
                  : "Pausado — toque para continuar"}
            </p>

            {recordingPhase !== "idle" && (
              <ButtonHiro
                variant="secondary"
                onClick={() => {
                  if (isRecordingActive) {
                    setRecordingPhase("paused");
                    stop();
                    stopRecording();
                  } else {
                    const ok = start();
                    if (!ok) return;
                    setRecordingPhase("recording");
                    startRecording();
                  }
                }}
                className="px-5 py-2 text-[13px] text-hiro-muted"
              >
                {isRecordingActive ? "Pausar" : "Retomar"}
              </ButtonHiro>
            )}
            {!isSupported && (
              <div className="w-full rounded-xl border border-hiro-red/30 bg-[#FAECE7] px-4 py-3 text-sm text-hiro-red">
                Reconhecimento de voz não disponível neste navegador. Use Chrome
                ou Edge para transcrição em tempo real.
              </div>
            )}
            {error && isSupported && (
              <div className="w-full rounded-xl border border-hiro-red/30 bg-[#FAECE7] px-4 py-3 text-sm text-hiro-red">
                {error}
              </div>
            )}
          </div>
        </CardHiro>

        <CardHiro className="rounded-2xl p-5">
          <OverlineLabel>TRANSCRIÇÃO EM TEMPO REAL</OverlineLabel>
          <div
            ref={panelRef}
            className="mt-3 flex max-h-[260px] flex-col gap-2 overflow-y-auto"
          >
            {lines.length === 0 && !interimText && (
              <p className="rounded-xl bg-hiro-bg px-3 py-3 text-sm text-hiro-muted">
                Inicie a gravação para ver a transcrição em tempo real...
              </p>
            )}
            {lines.map((line) => (
              <div
                key={line.id}
                className={`rounded-xl px-3 py-2 ${
                  line.isFinal ? "bg-hiro-bg" : "border border-dashed border-black/15"
                }`}
              >
                <p className="text-sm text-hiro-text">{line.text}</p>
              </div>
            ))}
            {interimText && (
              <div className="rounded-xl border border-dashed border-black/15 px-3 py-2">
                <p className="text-sm italic text-hiro-muted">{interimText}</p>
              </div>
            )}
          </div>
          <p className="mt-2 text-[11px] text-hiro-muted">
            {wordCount} {wordCount === 1 ? "palavra transcrita" : "palavras transcritas"}
          </p>
        </CardHiro>
      </section>

      <aside className="space-y-5 lg:col-span-5">
        <div className="glass-warm flex flex-col gap-4 rounded-2xl p-5">
          <OverlineLabel>CONTEXTO PRÉVIO</OverlineLabel>
          <p className="text-xs leading-relaxed text-hiro-muted">
            Dados do prontuário e da última anamnese úteis para esta consulta.
          </p>
          <div className="space-y-3 text-sm">
            <div className="rounded-xl border border-black/[0.06] bg-hiro-bg/80 p-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-hiro-muted">
                Motivo desta consulta
              </p>
              <p className="mt-1 text-[13px] text-hiro-text">
                {reason?.trim() ? reason : "—"}
              </p>
            </div>
            {(patient.conditions?.length ?? 0) > 0 && (
              <div className="rounded-xl border border-black/[0.06] bg-hiro-bg/80 p-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-hiro-muted">
                  Condições / histórico
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-hiro-text">
                  {(patient.conditions ?? []).join(" · ")}
                </p>
              </div>
            )}
            {patient.medications.filter((m) => m.status === "active").length > 0 && (
              <div className="rounded-xl border border-black/[0.06] bg-hiro-bg/80 p-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-hiro-muted">
                  Medicamentos ativos
                </p>
                <ul className="mt-1 list-inside list-disc space-y-0.5 text-[13px] text-hiro-text">
                  {patient.medications
                    .filter((m) => m.status === "active")
                    .map((m) => (
                      <li key={m.name}>
                        {m.name} — {m.dose}
                      </li>
                    ))}
                </ul>
              </div>
            )}
            {patient.cids.length > 0 && (
              <div className="rounded-xl border border-black/[0.06] bg-hiro-bg/80 p-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-hiro-muted">
                  CID registrados anteriormente
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-hiro-text">
                  {patient.cids.map((c) => `${c.code} (${c.name})`).join(" · ")}
                </p>
              </div>
            )}
            {lastConsultation && (
              <div className="rounded-xl border border-black/[0.06] bg-hiro-bg/80 p-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-hiro-muted">
                  Última consulta ({lastConsultation.date})
                </p>
                <p className="mt-1 text-[13px] text-hiro-text">{lastConsultation.reason}</p>
                {lastConsultation.soap?.s ? (
                  <p className="mt-2 border-t border-black/[0.06] pt-2 text-[12px] leading-relaxed text-hiro-muted">
                    <span className="font-medium text-hiro-text">S: </span>
                    {lastConsultation.soap.s}
                  </p>
                ) : null}
              </div>
            )}
          </div>
        </div>

        <div className="glass-warm flex flex-col gap-4 rounded-2xl p-5">
          <OverlineLabel>DETECTADO NA FALA</OverlineLabel>
          <p className="text-xs leading-relaxed text-hiro-muted">
            Sintomas, histórico relatado, achados de exame e itens de conduta extraídos da conversa.
            Os CID sugeridos ficam no prontuário (tela seguinte).
          </p>

          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-hiro-muted">
                Sintomas e queixas
              </p>
              <p className="mt-1.5 rounded-xl border border-dashed border-black/10 bg-white/20 px-3 py-2 text-xs italic text-hiro-muted">
                Trechos serão destacados automaticamente quando a IA identificar queixas na fala.
              </p>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-hiro-muted">
                Histórico relatado nesta sessão
              </p>
              <p className="mt-1.5 rounded-xl border border-dashed border-black/10 bg-white/20 px-3 py-2 text-xs italic text-hiro-muted">
                Evoluções e antecedentes mencionados pelo paciente aparecerão aqui.
              </p>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-hiro-muted">
                Exame clínico / solicitações
              </p>
              <div className="mt-1.5 space-y-2">
                {detectedByTypes.exam.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-black/10 bg-white/20 px-3 py-2 text-xs italic text-hiro-muted">
                    Nenhum pedido de exame detectado ainda.
                  </p>
                ) : (
                  detectedByTypes.exam.map((item, itemIndex) => {
                    const { badgeClass, typeLabel } = detectedItemMeta(item);
                    return (
                      <div
                        key={item.id}
                        className="animate-fade-up flex flex-col gap-2 rounded-xl border border-black/10 bg-white/30 px-3 py-2"
                        style={{ animationDelay: `${itemIndex * 40}ms` }}
                      >
                        <span
                          className={`inline-flex w-fit max-w-full rounded-md px-2 py-1 text-[11px] font-medium leading-snug ${badgeClass}`}
                        >
                          {typeLabel} — {item.text}
                        </span>
                        <p className="text-xs italic text-hiro-muted">{item.sourceQuote}</p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-hiro-muted">
                Plano, retorno e documentos
              </p>
              <div className="mt-1.5 space-y-2">
                {detectedByTypes.plano.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-black/10 bg-white/20 px-3 py-2 text-xs italic text-hiro-muted">
                    Nenhum item de conduta detectado ainda.
                  </p>
                ) : (
                  detectedByTypes.plano.map((item, itemIndex) => {
                    const { badgeClass, typeLabel } = detectedItemMeta(item);
                    return (
                      <div
                        key={item.id}
                        className="animate-fade-up flex flex-col gap-2 rounded-xl border border-black/10 bg-white/30 px-3 py-2"
                        style={{ animationDelay: `${itemIndex * 40}ms` }}
                      >
                        <span
                          className={`inline-flex w-fit max-w-full rounded-md px-2 py-1 text-[11px] font-medium leading-snug ${badgeClass}`}
                        >
                          {typeLabel} — {item.text}
                        </span>
                        <p className="text-xs italic text-hiro-muted">{item.sourceQuote}</p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="glass-warm sticky bottom-0 z-30 border-t border-black/10 px-6 py-3 lg:col-span-12">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
          <ButtonHiro variant="secondary">Cancelar consulta</ButtonHiro>
          <ButtonHiro
            type="button"
            disabled={recordingSeconds < 30 || isGenerating}
            onClick={() => void handleStopAndGenerate()}
            className="inline-flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Gerando prontuário...
              </>
            ) : (
              "Parar e gerar prontuário"
            )}
          </ButtonHiro>
        </div>
      </div>
    </div>
  );
}
