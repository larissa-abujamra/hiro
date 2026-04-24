"use client";

import { useEffect, useMemo, useState } from "react";
import type { Appointment } from "@/components/agenda/AppointmentModal";

interface DbConsultation {
  id: string;
  started_at: string;
  duration_minutes?: number | null;
  status: string;
  subjetivo?: string | null;
}

function isSameDay(dateStr: string, ref: Date): boolean {
  const d = new Date(dateStr);
  return (
    d.getFullYear() === ref.getFullYear() &&
    d.getMonth() === ref.getMonth() &&
    d.getDate() === ref.getDate()
  );
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

interface MetricsFooterProps {
  appointments: Appointment[];
}

export function MetricsFooter({ appointments }: MetricsFooterProps) {
  const [dbConsultations, setDbConsultations] = useState<DbConsultation[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/consultations?limit=50");
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled || !Array.isArray(data)) return;
        const today = new Date();
        setDbConsultations(
          data.filter((c: DbConsultation) => isSameDay(c.started_at, today)),
        );
      } catch {}
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const metrics = useMemo(() => {
    const completedAppts = appointments.filter((a) => a.status === "completed").length;
    const total = appointments.length;

    const documented = dbConsultations.filter(
      (c) => c.status === "completed" && !!c.subjetivo,
    ).length;

    const durations = dbConsultations
      .map((c) => c.duration_minutes ?? 0)
      .filter((d) => d > 0);
    const avgTime =
      durations.length > 0
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
        : null;

    let nextFree: string | null = null;
    if (appointments.length > 0) {
      const last = [...appointments].sort(
        (a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime(),
      )[0];
      const end = new Date(last.datetime);
      end.setMinutes(end.getMinutes() + last.duration_minutes);
      nextFree = formatTime(end);
    }

    return { completedAppts, total, documented, avgTime, nextFree };
  }, [appointments, dbConsultations]);

  const cells: Array<{ label: string; value: string; sub: string }> = [
    {
      label: "Consultas hoje",
      value: metrics.total > 0 ? `${metrics.completedAppts} / ${metrics.total}` : "—",
      sub:
        metrics.total === 0
          ? "Sem agendamentos"
          : metrics.completedAppts === metrics.total
            ? "Todas finalizadas"
            : `${metrics.total - metrics.completedAppts} restantes`,
    },
    {
      label: "Documentadas pela IA",
      value: String(metrics.documented),
      sub:
        metrics.completedAppts > 0
          ? `${Math.round((metrics.documented / metrics.completedAppts) * 100)}% das realizadas`
          : "Nenhuma consulta finalizada",
    },
    {
      label: "Tempo médio",
      value: metrics.avgTime !== null ? `${metrics.avgTime} min` : "—",
      sub: metrics.avgTime !== null ? "Hoje" : "Sem dados ainda",
    },
    {
      label: "Próximo livre",
      value: metrics.nextFree ?? "—",
      sub: metrics.nextFree ? "Após última consulta" : "Sem agendamentos",
    },
  ];

  return (
    <footer className="mt-8 hidden border-t border-[#1c2b1e]/10 pt-6 md:block">
      <div className="grid grid-cols-4 divide-x divide-[#1c2b1e]/10">
        {cells.map((cell) => (
          <div key={cell.label} className="px-6 first:pl-0 last:pr-0">
            <p className="text-xs uppercase tracking-wider text-[#6b7a6d]/70">
              {cell.label}
            </p>
            <p className="mt-2 text-xl font-medium tabular-nums text-[#59635a]">
              {cell.value}
            </p>
            <p className="mt-1 text-xs text-[#6b7a6d]/60">{cell.sub}</p>
          </div>
        ))}
      </div>
    </footer>
  );
}
