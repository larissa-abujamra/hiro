import Link from "next/link";
import { ChevronRight } from "lucide-react";
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

interface DayTimelineProps {
  appointments: Appointment[];
}

export function DayTimeline({ appointments }: DayTimelineProps) {
  return (
    <section className="mt-8">
      <header className="flex items-center justify-between">
        <h3 className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-hiro-muted">
          Resto do dia · {appointments.length} {appointments.length === 1 ? "paciente" : "pacientes"}
        </h3>
        <Link
          href="/agenda"
          className="text-[12px] font-medium text-hiro-green underline-offset-2 transition-colors hover:underline"
        >
          Ver agenda completa →
        </Link>
      </header>

      {appointments.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-black/[0.1] bg-white/40 px-4 py-6 text-center text-[13px] text-hiro-muted">
          Nenhuma outra consulta agendada para hoje.
        </p>
      ) : (
        <ol className="relative mt-2">
          {appointments.length > 1 && (
            <span
              aria-hidden
              className="absolute bottom-6 left-[58px] top-6 border-l border-black/[0.1]"
            />
          )}
          {appointments.map((appt) => {
            const age = ageFromDob(appt.patient_dob);
            const typeLabel = TYPE_LABELS[appt.type] ?? appt.type;
            const complaint = appt.notes?.trim();
            return (
              <li
                key={appt.id}
                className="relative flex items-center gap-4 py-3 first:pt-1 last:pb-1"
              >
                <span className="w-12 shrink-0 text-right font-mono text-[13px] tabular-nums text-hiro-text">
                  {formatTime(appt.datetime)}
                </span>
                <span className="relative z-10 flex h-2.5 w-2.5 shrink-0 items-center justify-center">
                  <span className="h-2.5 w-2.5 rounded-full bg-hiro-green ring-4 ring-hiro-bg" />
                </span>
                <div className="flex min-w-0 flex-1 items-center justify-between gap-3 rounded-xl border border-white/40 bg-white/60 px-4 py-3 backdrop-blur-md transition-colors hover:bg-white/80">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <p className="text-[14px] font-medium text-hiro-text">
                        {appt.patient_name}
                      </p>
                      <p className="text-[12px] text-hiro-muted">
                        {age !== null && `${age} anos · `}
                        {appt.duration_minutes} min
                      </p>
                    </div>
                    <p className="mt-0.5 truncate text-[12px] text-hiro-muted">
                      <span className="font-mono uppercase tracking-[0.08em] text-hiro-green">
                        {typeLabel}
                      </span>
                      {complaint && (
                        <>
                          <span> · </span>
                          {complaint}
                        </>
                      )}
                    </p>
                  </div>
                  <Link
                    href={`/consulta/nova?appointmentId=${appt.id}`}
                    prefetch={false}
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-black/[0.08] px-3 py-1.5 text-[12px] font-medium text-hiro-text transition-colors hover:border-hiro-green/40 hover:bg-hiro-green/5"
                  >
                    Abrir
                    <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </Link>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
