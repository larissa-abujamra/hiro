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
            Medical scribe dashboard scaffold
          </p>
        </div>
        <BadgeStatus label="Prototype active" status="ready" />
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <CardHiro>
          <OverlineLabel tone="muted">Patients</OverlineLabel>
          <p className="mt-2 text-3xl font-semibold">{totalPatients}</p>
          <p className="mt-2 text-sm text-hiro-muted">registered records</p>
        </CardHiro>
        <CardHiro>
          <OverlineLabel tone="muted">Consultations</OverlineLabel>
          <p className="mt-2 text-3xl font-semibold">{totalConsultations}</p>
          <p className="mt-2 text-sm text-hiro-muted">historical entries</p>
        </CardHiro>
        <CardHiro>
          <OverlineLabel tone="muted">Last follow-up</OverlineLabel>
          <p className="mt-2 text-3xl font-semibold">
            {latestConsultationDate ?? "--"}
          </p>
          <p className="mt-2 text-sm text-hiro-muted">latest consultation date</p>
        </CardHiro>
      </section>

      <section className="mt-6 rounded-2xl bg-hiro-card p-6">
        <OverlineLabel tone="success">Quick actions</OverlineLabel>
        <h1 className="mt-2 font-serif text-2xl text-hiro-text">Welcome</h1>
        <p className="mt-2 text-sm text-hiro-muted">
          Open a clinical flow directly from the dashboard.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <Link
            href="/consulta/nova"
            className="rounded-full bg-hiro-text px-7 py-3 text-center text-sm font-medium text-white transition hover:brightness-110"
          >
            New consultation
          </Link>
          <Link
            href="/pacientes"
            className="rounded-full border border-black/15 bg-transparent px-7 py-3 text-center text-sm font-medium text-hiro-text transition hover:bg-black/5"
          >
            Patient list
          </Link>
          <Link
            href="/pacientes/patient-bruno-ferreira"
            className="rounded-full border border-black/15 bg-transparent px-7 py-3 text-center text-sm font-medium text-hiro-text transition hover:bg-black/5"
          >
            Bruno profile
          </Link>
        </div>
      </section>
    </main>
  );
}
