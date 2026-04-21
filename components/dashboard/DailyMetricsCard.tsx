"use client";

import { useEffect, useMemo, useState } from "react";

function isSameDay(dateStr: string, ref: Date): boolean {
  const d = new Date(dateStr);
  return (
    d.getFullYear() === ref.getFullYear() &&
    d.getMonth() === ref.getMonth() &&
    d.getDate() === ref.getDate()
  );
}

interface DbConsultation {
  id: string;
  started_at: string;
  duration_minutes?: number | null;
  status: string;
  subjetivo?: string | null;
}

export function DailyMetricsCard() {
  const [dbConsultations, setDbConsultations] = useState<DbConsultation[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      try {
        const res = await fetch("/api/consultations?limit=50");
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled || !Array.isArray(data)) return;
        setDbConsultations(
          data.filter((c: DbConsultation) => isSameDay(c.started_at, today)),
        );
      } catch {}
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const metrics = useMemo(() => {
    const consultasRealizadas = dbConsultations.filter(
      (c) => c.status === "completed",
    ).length;

    const prontuariosHoje = dbConsultations.filter(
      (c) => c.status === "completed" && !!c.subjetivo,
    ).length;

    const consultasIniciadas = dbConsultations.length;
    const totalConsultas = Math.max(consultasIniciadas, consultasRealizadas);

    const durations = dbConsultations
      .map((c) => c.duration_minutes ?? 0)
      .filter((d) => d > 0);
    const tempoMedio =
      durations.length > 0
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
        : 0;

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
  }, [dbConsultations]);

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
                ? "Dentro da média"
                : "Acima da média"
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
