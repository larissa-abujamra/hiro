const mockMetrics = {
  consultasHoje: 7,
  consultasTotal: 8,
  proximaConsulta: "16h30",
  documentadas: 7,
  realizadas: 7,
  tempoMedio: 11,
  metaTempo: 15,
};

export function DailyMetricsCard() {
  const m = mockMetrics;

  const progressConsultas =
    m.consultasTotal > 0 ? (m.consultasHoje / m.consultasTotal) * 100 : 0;

  const progressDocs =
    m.realizadas > 0 ? (m.documentadas / m.realizadas) * 100 : 0;

  const progressTempo = Math.min((m.tempoMedio / m.metaTempo) * 100, 100);

  const tempoBarClass =
    m.tempoMedio < m.metaTempo ? "bg-hiro-amber" : "bg-hiro-green";

  return (
    <section
      className="animate-fade-up hiro-shadow-card overflow-hidden rounded-2xl bg-hiro-card"
      aria-label="Métricas do dia"
    >
      <div className="grid grid-cols-1 md:grid-cols-3">
        {/* Célula 1 — Consultas hoje */}
        <div className="flex flex-col border-b border-black/[0.07] px-5 py-5 md:border-b-0 md:border-r md:px-6 md:py-6">
          <span className="text-[11px] font-medium tracking-[0.06em] text-hiro-muted">
            Consultas hoje
          </span>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="font-serif text-4xl font-normal tabular-nums tracking-tight text-hiro-text sm:text-[2.5rem]">
              {m.consultasHoje}
            </span>
            <span className="text-lg font-medium tabular-nums text-hiro-muted">
              / {m.consultasTotal}
            </span>
          </div>
          <p className="mt-2 text-sm text-hiro-muted">
            próxima às {m.proximaConsulta}
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
        <div className="flex flex-col border-b border-black/[0.07] px-5 py-5 md:border-b-0 md:border-r md:px-6 md:py-6">
          <span className="text-[11px] font-medium tracking-[0.06em] text-hiro-muted">
            Documentadas pela IA
          </span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-4xl font-normal tabular-nums tracking-tight text-hiro-text sm:text-[2.5rem]">
              {m.documentadas}
            </span>
            <span className="text-sm font-medium text-hiro-muted">prontuários</span>
          </div>
          <p className="mt-2 text-sm text-hiro-muted">
            100% das consultas realizadas
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
          <span className="text-[11px] font-medium tracking-[0.06em] text-hiro-muted">
            Tempo médio
          </span>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="font-serif text-4xl font-normal tabular-nums tracking-tight text-hiro-text sm:text-[2.5rem]">
              {m.tempoMedio}
            </span>
            <span className="text-lg font-medium text-hiro-muted">min</span>
          </div>
          <p className="mt-2 text-sm text-hiro-muted">
            meta: {m.metaTempo} min por consulta
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
