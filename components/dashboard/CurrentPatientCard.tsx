import Link from "next/link";
import { Clock, Mic } from "lucide-react";
import type { Appointment } from "@/components/agenda/AppointmentModal";

const TYPE_LABELS: Record<string, string> = {
  first_visit: "Primeira consulta",
  follow_up: "Retorno",
  routine: "Rotina",
  urgent: "Urgência",
  exam_review: "Revisão de exames",
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function ageFromDob(dob?: string) {
  if (!dob) return null;
  const d = new Date(dob);
  if (isNaN(d.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return age;
}

interface CurrentPatientCardProps {
  appointment: Appointment;
}

export function CurrentPatientCard({ appointment }: CurrentPatientCardProps) {
  const inProgress = appointment.status === "in_progress";
  const badgeLabel = inProgress ? "EM ANDAMENTO" : "AGORA";
  const time = formatTime(appointment.datetime);
  const age = ageFromDob(appointment.patient_dob);
  const typeLabel = TYPE_LABELS[appointment.type] ?? appointment.type;
  const notes = appointment.notes?.trim();

  return (
    <section
      className="mt-5 overflow-hidden rounded-2xl border border-white/50 border-l-4 bg-white/70 p-5 backdrop-blur-xl md:p-6"
      style={{
        borderLeftColor: "#c9a962",
        boxShadow: "0 4px 24px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
      }}
    >
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-2 rounded-full bg-hiro-green/[0.08] px-2.5 py-1 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-hiro-green">
          <span className="relative inline-flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-hiro-green opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-hiro-green" />
          </span>
          {badgeLabel}
        </span>
        <span className="font-mono text-[12px] tabular-nums text-hiro-muted">· {time}</span>
      </div>

      <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="font-serif text-2xl font-normal text-hiro-text md:text-3xl">
            {appointment.patient_name}
            {age !== null && (
              <span className="text-hiro-muted">, {age} anos</span>
            )}
          </h2>
          <p className="mt-1 text-[13px] font-medium text-hiro-muted">
            {typeLabel}
          </p>
          {notes && (
            <p className="mt-2 text-[15px] leading-relaxed text-[#1c2b1e]">
              {notes}
            </p>
          )}
          <div className="mt-3 flex items-center gap-1.5 text-[12px] text-hiro-muted">
            <Clock className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span>{appointment.duration_minutes} min</span>
          </div>
        </div>

        <Link
          href={`/consulta/nova?appointmentId=${appointment.id}`}
          prefetch={false}
          className="inline-flex shrink-0 items-center justify-center gap-3 rounded-lg bg-[#2d5a47] px-8 py-4 text-base font-medium text-[#f5f0e8] transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
        >
          <Mic className="h-[18px] w-[18px]" strokeWidth={2} />
          {inProgress ? "Retomar consulta" : "Iniciar consulta"}
        </Link>
      </div>
    </section>
  );
}
