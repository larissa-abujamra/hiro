"use client";

import { useMemo } from "react";
import { useConsultationStore } from "@/lib/store";

function isSameDay(dateStr: string, ref: Date): boolean {
  const d = new Date(dateStr);
  return (
    d.getFullYear() === ref.getFullYear() &&
    d.getMonth() === ref.getMonth() &&
    d.getDate() === ref.getDate()
  );
}

export function DailyMetricsCard() {
  const patients = useConsultationStore((s) => s.patients);
  const activityLog = useConsultationStore((s) => s.activityLog);

  const metrics = useMemo(() => {
    const today = new Date();

    // Gather all consultations across all patients that happened today
    const todayConsultations = patients.flatMap((p) =>
      p.consultations.filter((c) => isSameDay(c.date, today))
    );

    const consultasRealizadas = todayConsultations.length;

    // Count prontuarios generated today from activity log
    const prontuariosHoje = activityLog.filter(
      (a) => a.type === "prontuario_generated" && isSameDay(a.timestamp, today)
    ).length;

    // Count consultations started today from activity log (includes in-progress)
    const consultasIniciadas = activityLog.filter(
      (a) => a.type === "consultation_started" && isSameDay(a.timestamp, today)
    ).length;

    const totalConsultas = Math.max(consultasIniciadas, consultasRealizadas);

    // Average consultation time (in minutes)
    const durations = todayConsultations
      .map((c) => c.duration)
      .filter((d) => d > 0);
    const tempoMedio =
      durations.length > 0
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
        : 0;

    // Docs percentage
    const docPercent =
      consultasRealizadas > 0
        ? Math.round((prontuariosHoje / consultasRealizadas) * 100)
        : 0;

    return {
      consultasRealizadas,
      totalConsultas,
      prontuariosHoje,
      tempoMedio,
      docPercent,
    };
  }, [patients, activityLog]);

  const m = metrics;

  const progressConsultas =
    m.totalConsultas > 0
      ? (m.consultasRealizadas / m.totalConsultas) * 100
      : 0;

  const progressDocs = m.docPercent;

  const metaTempo = 15; // target: 15 min average
  const progressTempo =
    m.tempoMedio > 0 ? Math.min((m.tempoMedio / metaTempo) * 100, 100) : 0;

  const tempoBarClass =
    m.tempoMedio > 0 && m.tempoMedio <= metaTempo
      ? "bg-hiro-green"
      : "bg-hiro-amber";

  return (
    <section
      className="glass-card animate-fade-up overflow-hidden rounded-2xl"
      aria-label="Métricas do dia"
    >
      <div className="grid grid-cols-1 md:grid-cols-3">
        {/* Célula 1 — Consultas hoje */}
        <div className="flex flex-col border-b border-black/[0.16] px-5 py-5 md:border-b-0 md:border-r md:border-r-black/[0.14] md:px-6 md:py-6">
          <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-hiro-muted">
            Consultas hoje
          </span>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="font-serif text-4xl font-normal tabular-nums tracking-tight text-hiro-text sm:text-[2.5rem]">
              {m.consultasRealizadas}
            </span>
            {m.totalConsultas > 0 && (
              <span className="text-lg font-medium tabular-nums text-hiro-muted">
                / {m.totalConsultas}
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-hiro-muted">
            {m.totalConsultas === 0
              ? "Nenhuma consulta registrada"
              : m.consultasRealizadas === m.totalConsultas
                ? "Todas finalizadas"
                : `${m.totalConsultas - m.consultasRealizadas} em andamento`}
          </p>
          <div className="mt-auto pt-5">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/[0.06]">
              <div
                className="h-full rounded-full bg-hiro-green transition-[width] duration-500 ease-out"
                style={{ width: `${progressConsultas}%` }}
              />
            </div>
          </div>
        </div>

        {/* Célula 2 — Documentadas pela IA */}
        <div className="flex flex-col border-b border-black/[0.16] px-5 py-5 md:border-b-0 md:border-r md:border-r-black/[0.14] md:px-6 md:py-6">
          <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-hiro-muted">
            Documentadas pela IA
          </span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-4xl font-normal tabular-nums tracking-tight text-hiro-text sm:text-[2.5rem]">
              {m.prontuariosHoje}
            </span>
            <span className="text-sm font-medium text-hiro-muted">
              {m.prontuariosHoje === 1 ? "prontuário" : "prontuários"}
            </span>
          </div>
          <p className="mt-2 text-sm text-hiro-muted">
            {m.consultasRealizadas > 0
              ? `${m.docPercent}% das consultas realizadas`
              : "Nenhuma consulta finalizada"}
          </p>
          <div className="mt-auto pt-5">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/[0.06]">
              <div
                className="h-full rounded-full bg-hiro-green transition-[width] duration-500 ease-out"
                style={{ width: `${progressDocs}%` }}
              />
            </div>
          </div>
        </div>

        {/* Célula 3 — Tempo médio */}
        <div className="flex flex-col px-5 py-5 md:px-6 md:py-6">
          <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-hiro-muted">
            Tempo médio
          </span>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="font-serif text-4xl font-normal tabular-nums tracking-tight text-hiro-text sm:text-[2.5rem]">
              {m.tempoMedio > 0 ? m.tempoMedio : "—"}
            </span>
            {m.tempoMedio > 0 && (
              <span className="text-lg font-medium text-hiro-muted">min</span>
            )}
          </div>
          <p className="mt-2 text-sm text-hiro-muted">
            {m.tempoMedio > 0
              ? m.tempoMedio <= metaTempo
                ? "Dentro da meta"
                : "Acima da meta"
              : "Sem dados ainda"}
          </p>
          <div className="mt-auto pt-5">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/[0.06]">
              <div
                className={`h-full rounded-full transition-[width] duration-500 ease-out ${tempoBarClass}`}
                style={{ width: `${progressTempo}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
