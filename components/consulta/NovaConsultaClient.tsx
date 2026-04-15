"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Loader2, Play, User } from "lucide-react";
import { CardHiro } from "@/components/ui/CardHiro";
import { OverlineLabel } from "@/components/ui/OverlineLabel";
import { NewConsultationFlow } from "@/components/consulta/NewConsultationFlow";
import {
  useUpcomingAppointments,
  type UpcomingAppointment,
} from "@/hooks/useUpcomingAppointments";
import { useConsultationStore } from "@/lib/store";

interface NovaConsultaClientProps {
  appointmentId?: string;
  initialPatientName?: string;
}

type PageState = "loading" | "suggested" | "manual";

const TYPE_LABELS: Record<string, string> = {
  first_visit: "Primeira consulta",
  follow_up: "Retorno",
  routine: "Rotina",
  urgent: "Urgência",
  exam_review: "Revisão de exames",
};

function formatTime(datetime: string): string {
  return new Date(datetime).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatAppointmentType(type: string): string {
  return TYPE_LABELS[type] ?? type;
}

function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}

export function NovaConsultaClient({
  appointmentId,
  initialPatientName,
}: NovaConsultaClientProps) {
  const router = useRouter();
  const {
    appointments,
    currentAppointment,
    setCurrentAppointment,
    isLoading,
  } = useUpcomingAppointments(60);

  const [pageState, setPageState] = useState<PageState>("loading");
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If the user navigated in from the agenda with a specific appointment,
    // skip the suggestion step and go straight to the manual flow — the
    // existing NewConsultationFlow handles pre-filling from the URL.
    if (appointmentId) {
      setPageState("manual");
      return;
    }
    if (isLoading) return;
    setPageState(appointments.length > 0 ? "suggested" : "manual");
  }, [appointmentId, isLoading, appointments.length]);

  async function startConsultation(appointment: UpcomingAppointment) {
    if (isStarting) return;
    if (!appointment.patient_id) {
      setError(
        "Este agendamento não tem paciente vinculado. Edite o agendamento ou selecione o paciente manualmente.",
      );
      return;
    }

    setIsStarting(true);
    setError(null);

    try {
      const res = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: appointment.patient_id,
          appointment_id: appointment.id,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Erro ao criar consulta");
      }

      const consultation = await res.json();
      const consultationId = consultation.id as string;

      // Sync the store so /consulta/[id] finds the right context.
      const store = useConsultationStore.getState();
      store.selectPatient(appointment.patient_id);
      store.setActiveConsultation(consultationId);
      store.addActivity({
        type: "consultation_started",
        patientName: appointment.patient_name,
      });

      router.push(`/consulta/${consultationId}`);
    } catch (err) {
      console.error("[NovaConsulta] Erro ao iniciar consulta:", err);
      setError("Erro ao iniciar consulta. Tente novamente.");
      setIsStarting(false);
    }
  }

  // ─── Loading ───────────────────────────────────────────────────────
  if (pageState === "loading") {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-hiro-green" />
      </div>
    );
  }

  // ─── Suggested ─────────────────────────────────────────────────────
  if (pageState === "suggested" && currentAppointment) {
    const others = appointments.filter((a) => a.id !== currentAppointment.id);

    return (
      <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-6 md:px-6 md:py-8">
        <div className="text-center">
          <h1 className="font-serif text-3xl text-hiro-text">
            Próxima consulta
          </h1>
          <p className="mt-2 text-[13px] text-hiro-muted">
            Agendamento para {formatTime(currentAppointment.datetime)}
          </p>
        </div>

        <CardHiro className="rounded-2xl border-2 border-hiro-green/40 p-6">
          <div className="mb-5 flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-hiro-green">
              <User className="h-8 w-8 text-white" strokeWidth={1.5} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate font-serif text-xl text-hiro-text">
                {currentAppointment.patient_name}
              </h2>
              <p className="text-[12px] text-hiro-muted">
                {currentAppointment.patient_phone || "Sem telefone"}
              </p>
              <span className="mt-1 inline-block rounded-full bg-hiro-green/10 px-2 py-0.5 text-[11px] font-medium text-hiro-green">
                {formatAppointmentType(currentAppointment.type)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => startConsultation(currentAppointment)}
            disabled={isStarting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-hiro-active py-4 text-[15px] font-medium text-white transition-colors hover:bg-hiro-text disabled:opacity-60"
          >
            {isStarting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" strokeWidth={2} />
                Iniciando...
              </>
            ) : (
              <>
                <Play className="h-5 w-5" strokeWidth={2} />
                Iniciar consulta com {firstName(currentAppointment.patient_name)}
              </>
            )}
          </button>

          {error && (
            <p className="mt-3 text-center text-[12px] text-hiro-red">
              {error}
            </p>
          )}
        </CardHiro>

        {others.length > 0 && (
          <div className="space-y-2">
            <OverlineLabel>Outros pacientes agendados</OverlineLabel>
            {others.map((appointment) => (
              <button
                key={appointment.id}
                type="button"
                onClick={() => setCurrentAppointment(appointment)}
                className="flex w-full items-center justify-between rounded-xl border border-black/[0.08] bg-white/50 p-4 text-left transition-colors hover:border-hiro-green/40 hover:bg-white/80"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-hiro-green/10">
                    <User className="h-5 w-5 text-hiro-green" strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-hiro-text">
                      {appointment.patient_name}
                    </p>
                    <p className="text-[11px] text-hiro-muted">
                      {formatTime(appointment.datetime)} ·{" "}
                      {formatAppointmentType(appointment.type)}
                    </p>
                  </div>
                </div>
                <ChevronRight
                  className="h-4 w-4 text-hiro-muted/50"
                  strokeWidth={1.75}
                />
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            setError(null);
            setPageState("manual");
          }}
          className="block w-full text-center text-[12px] text-hiro-green hover:underline"
        >
          Ou selecionar outro paciente
        </button>
      </div>
    );
  }

  // ─── Manual ────────────────────────────────────────────────────────
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-4 md:px-6 md:py-6">
      <h1 className="font-serif text-3xl text-hiro-text">Nova consulta</h1>
      <p className="mt-2 text-sm text-hiro-muted">
        Tela 1: seleção de paciente.
      </p>
      <NewConsultationFlow
        appointmentId={appointmentId}
        initialPatientName={initialPatientName}
      />
    </div>
  );
}
