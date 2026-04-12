"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Calendar, Clock, Loader2, User } from "lucide-react";

interface Appointment {
  id: string;
  patient_name: string;
  datetime: string;
  duration_minutes: number;
  type: string;
  status: string;
}

const TYPE_LABELS: Record<string, string> = {
  first_visit: "Primeira consulta",
  follow_up: "Retorno",
  routine: "Rotina",
  urgent: "Urgência",
  exam_review: "Revisão de exames",
};

const STATUS_DOT: Record<string, string> = {
  scheduled: "bg-hiro-muted/40",
  confirmed: "bg-[#185FA5]",
  in_progress: "bg-hiro-amber",
  completed: "bg-hiro-green",
  cancelled: "bg-hiro-red/40",
  no_show: "bg-hiro-red",
};

function formatTime(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

export function TodayAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();

    fetch(`/api/appointments?from=${startOfDay}&to=${endOfDay}`)
      .then((res) => (res.ok ? res.json() : { appointments: [] }))
      .then((data) => {
        const today = (data.appointments ?? [])
          .filter((a: Appointment) => isToday(a.datetime))
          .sort((a: Appointment, b: Appointment) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
        setAppointments(today);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="glass-card rounded-2xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-hiro-green" strokeWidth={1.75} />
          <h3 className="text-sm font-semibold text-hiro-text">
            Consultas do Dia
          </h3>
        </div>
        <Link
          href="/agenda"
          className="inline-flex items-center gap-1 text-[12px] font-medium text-hiro-green transition-colors hover:text-hiro-green/80"
        >
          Ver agenda completa
          <ArrowRight className="h-3 w-3" strokeWidth={2} />
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-hiro-green" />
        </div>
      ) : appointments.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-sm text-hiro-muted">Nenhuma consulta agendada para hoje.</p>
          <Link
            href="/agenda"
            className="mt-2 inline-block text-[12px] font-medium text-hiro-green transition-colors hover:underline"
          >
            Agendar consulta
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-black/[0.05]">
          {appointments.map((appt, i) => (
            <div
              key={appt.id}
              className="flex items-center gap-3 py-2.5 animate-fade-up"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <span className={`h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[appt.status] ?? STATUS_DOT.scheduled}`} />
              <span className="w-12 shrink-0 text-sm font-medium tabular-nums text-hiro-text">
                {formatTime(appt.datetime)}
              </span>
              <div className="min-w-0 flex-1">
                <span className="truncate text-sm text-hiro-text">{appt.patient_name}</span>
              </div>
              <span className="text-[11px] text-hiro-muted">
                {TYPE_LABELS[appt.type] ?? appt.type}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
