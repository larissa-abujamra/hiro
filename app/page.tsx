import Link from "next/link";
import {
  UpcomingPatientsSection,
  type UpcomingPatient,
} from "@/components/dashboard/UpcomingPatientsSection";
import { DailyMetricsCard } from "@/components/dashboard/DailyMetricsCard";
import { BadgeStatus } from "@/components/ui/BadgeStatus";
import { OverlineLabel } from "@/components/ui/OverlineLabel";

const upcomingPatients: UpcomingPatient[] = [
  {
    id: "patient-ana-clara-ribeiro",
    name: "Ana Clara Ribeiro",
    initials: "AC",
    age: 34,
    reason: "Consulta de rotina",
    time: "14:30",
    status: "confirmed",
    avatarColor: { bg: "#E1F5EE", text: "#0F6E56" },
  },
  {
    id: "patient-cintia-souza",
    name: "Cíntia Souza",
    initials: "CS",
    age: 42,
    reason: "Diabetes — retorno",
    time: "15:00",
    status: "waiting",
    avatarColor: { bg: "#E6F1FB", text: "#185FA5" },
  },
  {
    id: "patient-bruno-ferreira",
    name: "Bruno Ferreira",
    initials: "BF",
    age: 58,
    reason: "Pressão alta",
    time: "15:30",
    status: "confirmed",
    avatarColor: { bg: "#FAEEDA", text: "#854F0B" },
  },
  {
    id: "patient-elaine-prado",
    name: "Elaine Prado",
    initials: "EP",
    age: 61,
    reason: "Cardiologia",
    time: "16:00",
    status: "confirmed",
    avatarColor: { bg: "#E8E4DC", text: "#5F5E5A" },
  },
  {
    id: "patient-rodrigo-mendes",
    name: "Rodrigo Mendes",
    initials: "RM",
    age: 47,
    reason: "Dor lombar",
    time: "16:30",
    status: "waiting",
    avatarColor: { bg: "#FAECE7", text: "#993C1D" },
  },
];

export default function Home() {
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

      <DailyMetricsCard />

      <UpcomingPatientsSection patients={upcomingPatients} />

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
