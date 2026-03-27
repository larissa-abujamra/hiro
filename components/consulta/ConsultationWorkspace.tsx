"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Mic,
  Play,
  Search,
  Square,
} from "lucide-react";
import { PatientContext } from "@/components/consulta/PatientContext";
import { CardHiro } from "@/components/ui/CardHiro";
import { OverlineLabel } from "@/components/ui/OverlineLabel";
import { AvatarInitials } from "@/components/ui/AvatarInitials";
import { ButtonHiro } from "@/components/ui/ButtonHiro";
import { useTranscription } from "@/hooks/useTranscription";
import { useConsultationStore } from "@/lib/store";
import type { Patient } from "@/lib/types";

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
  const liveTranscription = useConsultationStore((state) => state.liveTranscription);
  const suggestedCids = useConsultationStore((state) => state.suggestedCids);
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
  const setSuggestedCids = useConsultationStore((state) => state.setSuggestedCids);
  const setDetectedItems = useConsultationStore((state) => state.setDetectedItems);
  const [expandedCid, setExpandedCid] = useState<string | null>(null);
  const [showContext, setShowContext] = useState(true);
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
    if (liveTranscription.length === 0) return;
    const last = liveTranscription[liveTranscription.length - 1];
    const normalized = last.text.toLowerCase();
    const alreadyDetected = (type: "return" | "exam" | "prescription") =>
      detectedItems.some(
        (item) => item.type === type && item.sourceQuote === last.text,
      );

    if ((normalized.includes("retorno") || normalized.includes("volte")) && !alreadyDetected("return")) {
      setDetectedItems([
        ...detectedItems,
        {
          type: "return",
          text: "Retorno mencionado",
          sourceQuote: last.text,
        },
      ]);
    } else if (
      (normalized.includes("exame") ||
        normalized.includes("hemograma") ||
        normalized.includes("ultrassom")) &&
      !alreadyDetected("exam")
    ) {
      setDetectedItems([
        ...detectedItems,
        {
          type: "exam",
          text: "Pedido de exames detectado",
          sourceQuote: last.text,
        },
      ]);
    } else if (
      (normalized.includes("mg") ||
        normalized.includes("miligram") ||
        normalized.includes("tomar")) &&
      !alreadyDetected("prescription")
    ) {
      setDetectedItems([
        ...detectedItems,
        {
          type: "prescription",
          text: "Receituário detectado",
          sourceQuote: last.text,
        },
      ]);
    }
  }, [detectedItems, liveTranscription, setDetectedItems]);

  useEffect(() => {
    if ((recordingSeconds < 30 && liveTranscription.length === 0) || suggestedCids.length > 0) {
      return;
    }
    const quote = liveTranscription.at(-1)?.text ?? "Trecho clínico identificado na fala.";
    setSuggestedCids([
      {
        code: "I10",
        name: "Hipertensão essencial (primária)",
        confidence: 0.91,
        sourceQuote: quote,
        confirmed: false,
      },
      {
        code: "E78.5",
        name: "Hiperlipidemia não especificada",
        confidence: 0.78,
        sourceQuote: quote,
        confirmed: false,
      },
    ]);
  }, [liveTranscription, recordingSeconds, setSuggestedCids, suggestedCids.length]);

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
    <div className="mt-6 grid gap-5 pb-24 lg:grid-cols-12">
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
                className="text-[12px] text-hiro-green underline-offset-2 hover:underline"
              >
                Ver perfil →
              </Link>
            </div>
          </div>
        </CardHiro>

        <CardHiro className="rounded-2xl p-8">
          <div className="flex flex-col items-center gap-5">
            <button
              type="button"
              onClick={toggleMainRecording}
              className={`relative flex h-20 w-20 items-center justify-center rounded-full transition-colors duration-150 ${
                isRecordingActive
                  ? "bg-[#8B1A1A] text-white"
                  : isPaused
                    ? "border-2 border-hiro-active bg-hiro-card text-hiro-active"
                    : "bg-hiro-active text-white"
              }`}
            >
              {isRecordingActive && (
                <span className="absolute inset-0 animate-ping rounded-full bg-[#8B1A1A] opacity-30" />
              )}
              {isRecordingActive ? (
                <Square className="relative h-6 w-6" />
              ) : isPaused ? (
                <Play className="relative h-7 w-7" />
              ) : (
                <Mic className="relative h-7 w-7" />
              )}
            </button>

            {isRecordingActive && (
              <div className="flex items-end gap-1">
                {[0, 0.1, 0.2, 0.15, 0.05, 0.12, 0.08].map((delay, i) => (
                  <div
                    key={i}
                    className="w-1.5 rounded-full bg-hiro-green"
                    style={{
                      animation: "waveBar 1s ease-in-out infinite",
                      animationDelay: `${delay}s`,
                    }}
                  />
                ))}
              </div>
            )}

            <p
              className={`font-serif text-[28px] tabular-nums ${
                isRecordingActive ? "text-[#8B1A1A]" : "text-hiro-text"
              }`}
            >
              {timerLabel}
            </p>
            <p className="text-[13px] text-hiro-muted">
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
        <CardHiro className="flex flex-col gap-3 rounded-2xl p-5">
          <OverlineLabel>CID-10 DETECTADO</OverlineLabel>
          <div className="space-y-2">
            {(suggestedCids.length
              ? suggestedCids
              : patient.consultations.at(-1)?.confirmedCids ?? []
            ).map((cid) => (
              <div
                key={cid.code}
                className={`rounded-xl border p-3 ${
                  cid.confirmed
                    ? "border-hiro-green/30 bg-[#D6E8DC]"
                    : "border-black/10 bg-hiro-bg"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-md bg-[#E6F1FB] px-2 py-0.5 text-xs text-[#185FA5]">
                    {cid.code}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-hiro-muted">
                    {Math.round(cid.confidence * 100)}%
                    {cid.confirmed && <span className="text-hiro-green">✓</span>}
                  </div>
                </div>
                <p className="mt-2 text-sm font-medium text-hiro-text">{cid.name}</p>
                <p
                  className={`mt-1 text-xs italic text-hiro-muted ${
                    expandedCid === cid.code ? "" : "line-clamp-2"
                  }`}
                >
                  "{cid.sourceQuote}"
                </p>
                <button
                  type="button"
                  onClick={() => setExpandedCid(expandedCid === cid.code ? null : cid.code)}
                  className="mt-2 text-xs text-hiro-green"
                >
                  {expandedCid === cid.code ? "ver menos" : "ver trecho completo"}
                </button>
              </div>
            ))}
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-hiro-muted" />
            <input
              placeholder="Buscar outro CID..."
              className="w-full rounded-full border border-black/15 bg-transparent py-2 pl-9 pr-3 text-sm text-hiro-text outline-none"
            />
          </div>
        </CardHiro>

        <CardHiro className="flex flex-col gap-3 rounded-2xl p-5">
          <OverlineLabel>DETECTADO NA FALA</OverlineLabel>
          <div className="space-y-2">
            {detectedItems.map((item, index) => {
              const badgeClass =
                item.type === "prescription"
                  ? "bg-[#FAEEDA] text-[#854F0B]"
                  : item.type === "exam"
                    ? "bg-[#E1F5EE] text-[#0F6E56]"
                    : item.type === "return"
                      ? "bg-[#E6F1FB] text-[#185FA5]"
                      : "bg-[#F1EFE8] text-[#5F5E5A]";

              const typeLabel =
                item.type === "prescription"
                  ? "Receituário"
                  : item.type === "exam"
                    ? "Pedido de exames"
                    : item.type === "return"
                      ? "Retorno"
                      : "Atestado";

              return (
                <div
                  key={`${item.type}-${index}`}
                  className="flex items-start justify-between gap-2 rounded-xl border border-black/10 bg-hiro-bg px-3 py-2"
                >
                  <div>
                    <p className="text-sm text-hiro-text">{item.text}</p>
                    <p className="text-xs italic text-hiro-muted">{item.sourceQuote}</p>
                  </div>
                  <span className={`rounded-md px-2 py-1 text-[11px] ${badgeClass}`}>
                    {typeLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </CardHiro>

        {patient.consultations.length > 0 && (
          <CardHiro className="flex flex-col gap-3 rounded-2xl p-5">
            <button
              type="button"
              onClick={() => setShowContext((prev) => !prev)}
              className="flex items-center justify-between"
            >
              <OverlineLabel>CONTEXTO DO PACIENTE</OverlineLabel>
              {showContext ? (
                <ChevronUp className="h-4 w-4 text-hiro-muted" />
              ) : (
                <ChevronDown className="h-4 w-4 text-hiro-muted" />
              )}
            </button>
            {showContext && (
              <div className="space-y-2 text-sm">
                <div className="rounded-xl bg-hiro-bg p-3">
                  <p className="text-xs text-hiro-muted">Última consulta</p>
                  <p className="text-sm text-hiro-text">
                    há 5 dias — {patient.consultations.at(-1)?.reason ?? "Sem descrição"}
                  </p>
                </div>
                <PatientContext patient={patient} />
              </div>
            )}
          </CardHiro>
        )}
      </aside>

      <div className="sticky bottom-0 z-30 border-t border-black/[0.08] bg-hiro-bg px-6 py-3 lg:col-span-12">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
          <ButtonHiro variant="secondary">Cancelar consulta</ButtonHiro>
          <Link href={`/consulta/${consultationId}/resumo`}>
            <ButtonHiro disabled={recordingSeconds < 30}>
              Parar e gerar prontuário
            </ButtonHiro>
          </Link>
        </div>
      </div>
    </div>
  );
}
