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
  const latestConsultationDate =
    mockPatients[0]?.consultations[mockPatients[0].consultations.length - 1]?.date;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col bg-hiro-bg px-4 py-4 md:px-6 md:py-6">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-serif text-4xl text-hiro-text">Hiro</p>
          <p className="mt-2 text-sm text-hiro-muted">
            Plataforma de apoio clínico com IA
          </p>
        </div>
        <BadgeStatus label="Protótipo ativo" status="ready" />
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <CardHiro>
          <OverlineLabel tone="muted">Pacientes</OverlineLabel>
          <p className="mt-2 text-3xl font-semibold">{totalPatients}</p>
          <p className="mt-2 text-sm text-hiro-muted">cadastros ativos</p>
        </CardHiro>
        <CardHiro>
          <OverlineLabel tone="muted">Consultas</OverlineLabel>
          <p className="mt-2 text-3xl font-semibold">{totalConsultations}</p>
          <p className="mt-2 text-sm text-hiro-muted">atendimentos registrados</p>
        </CardHiro>
        <CardHiro>
          <OverlineLabel tone="muted">Último retorno</OverlineLabel>
          <p className="mt-2 text-3xl font-semibold">
            {latestConsultationDate ?? "--"}
          </p>
          <p className="mt-2 text-sm text-hiro-muted">data da consulta mais recente</p>
        </CardHiro>
      </section>

      <section className="mt-6 rounded-2xl bg-hiro-card p-6">
        <OverlineLabel tone="success">Ações rápidas</OverlineLabel>
        <h1 className="mt-2 font-serif text-2xl text-hiro-text">Bem-vinda</h1>
        <p className="mt-2 text-sm text-hiro-muted">
          Inicie os fluxos clínicos diretamente pelo painel.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <Link
            href="/consulta/nova"
            className="rounded-full bg-hiro-text px-7 py-3 text-center text-sm font-medium text-white transition hover:brightness-110"
          >
            Nova consulta
          </Link>
          <Link
            href="/pacientes"
            className="rounded-full border border-black/15 bg-transparent px-7 py-3 text-center text-sm font-medium text-hiro-text transition hover:bg-black/5"
          >
            Lista de pacientes
          </Link>
        </div>
      </section>
    </main>
  );
}
