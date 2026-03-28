import Link from "next/link";
import { BadgeStatus } from "@/components/ui/BadgeStatus";
import { CardHiro } from "@/components/ui/CardHiro";
import { OverlineLabel } from "@/components/ui/OverlineLabel";
import { mockPatients } from "@/lib/mockData";

export default function Home() {
  const totalPatients = mockPatients.length;
  const totalConsultations = mockPatients.reduce(
    (acc, patient) => acc + patient.consultations.length,
    0,
  );
  const latestConsultationDate = mockPatients
    .flatMap((p) => p.consultations.map((c) => c.date))
    .sort()
    .at(-1);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col bg-hiro-bg px-4 py-4 md:px-6 md:py-6">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-serif text-4xl font-normal tracking-tight text-balance text-hiro-text">
            Hiro
          </p>
          <p className="mt-2 max-w-[65ch] text-sm leading-relaxed text-hiro-muted">
            Plataforma de apoio clínico com IA
          </p>
        </div>
        <BadgeStatus label="Protótipo ativo" status="ready" />
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <CardHiro
          className="animate-fade-up hiro-shadow-card"
          style={{ animationDelay: "0ms" }}
        >
          <OverlineLabel tone="muted">Pacientes</OverlineLabel>
          <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-hiro-text">
            {totalPatients}
          </p>
          <p className="mt-2 text-sm text-hiro-muted">cadastros ativos</p>
        </CardHiro>
        <CardHiro
          className="animate-fade-up hiro-shadow-card"
          style={{ animationDelay: "60ms" }}
        >
          <OverlineLabel tone="muted">Consultas</OverlineLabel>
          <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-hiro-text">
            {totalConsultations}
          </p>
          <p className="mt-2 text-sm text-hiro-muted">atendimentos registrados</p>
        </CardHiro>
        <CardHiro
          className="animate-fade-up hiro-shadow-card"
          style={{ animationDelay: "120ms" }}
        >
          <OverlineLabel tone="muted">Último retorno</OverlineLabel>
          <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-hiro-text">
            {latestConsultationDate ?? "--"}
          </p>
          <p className="mt-2 text-sm text-hiro-muted">data da consulta mais recente</p>
        </CardHiro>
      </section>

      <section className="mt-6 rounded-2xl bg-hiro-card p-6 hiro-shadow-card">
        <OverlineLabel tone="success">Ações rápidas</OverlineLabel>
        <h1 className="mt-2 font-serif text-2xl font-normal tracking-tight text-balance text-hiro-text">
          Bem-vindo
        </h1>
        <p className="mt-2 max-w-[65ch] text-sm leading-relaxed text-hiro-muted">
          Inicie os fluxos clínicos diretamente pelo painel.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <Link
            href="/consulta/nova"
            prefetch={false}
            className="rounded-full bg-hiro-text px-7 py-3 text-center text-sm font-medium text-white transition-all duration-200 ease-out hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(28,43,30,0.2)] hover:brightness-110 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hiro-active/40 focus-visible:ring-offset-2 focus-visible:ring-offset-hiro-card"
          >
            Nova consulta
          </Link>
          <Link
            href="/pacientes"
            className="rounded-full border border-black/15 bg-transparent px-7 py-3 text-center text-sm font-medium text-hiro-text transition-all duration-200 hover:bg-black/[0.04] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hiro-active/35 focus-visible:ring-offset-2 focus-visible:ring-offset-hiro-card"
          >
            Lista de pacientes
          </Link>
        </div>
      </section>
    </main>
  );
}
