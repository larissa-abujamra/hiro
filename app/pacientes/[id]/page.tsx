import Link from "next/link";
import { ConsultationHistory } from "@/components/paciente/ConsultationHistory";
import { EvolutionCharts } from "@/components/paciente/EvolutionCharts";
import { ExamUpload } from "@/components/paciente/ExamUpload";
import { AvatarInitials } from "@/components/ui/AvatarInitials";
import { BadgeStatus } from "@/components/ui/BadgeStatus";
import { ButtonHiro } from "@/components/ui/ButtonHiro";
import { CardHiro } from "@/components/ui/CardHiro";
import { OverlineLabel } from "@/components/ui/OverlineLabel";
import { mockPatients } from "@/lib/mockData";

interface PacientePageProps {
  params: Promise<{ id: string }>;
}

export default async function PacientePage({ params }: PacientePageProps) {
  const { id } = await params;
  const patient = mockPatients.find((item) => item.id === id) ?? mockPatients[0];
  const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();
  const bmi =
    patient.height && patient.weight
      ? (patient.weight / ((patient.height / 100) * (patient.height / 100))).toFixed(1)
      : "—";

  return (
    <main className="mx-auto w-full max-w-6xl bg-hiro-bg px-4 py-4 md:px-6 md:py-6">
      <CardHiro className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AvatarInitials name={patient.name} size="lg" />
          <div>
            <h1 className="font-serif text-3xl text-hiro-text">{patient.name}</h1>
            <p className="text-sm text-hiro-muted">
              {age} anos • {patient.sex} • Altura: {patient.height ?? "—"} cm • Peso:{" "}
              {patient.weight ?? "—"} kg • IMC: {bmi}
            </p>
          </div>
        </div>
        <Link href="/consulta/nova">
          <ButtonHiro>Nova consulta com este paciente</ButtonHiro>
        </Link>
      </CardHiro>

      <section className="mt-4 grid gap-4 md:grid-cols-2">
        <ConsultationHistory consultations={patient.consultations} patientId={patient.id} />
        <ExamUpload />
      </section>

      <section className="mt-4">
        <EvolutionCharts data={patient.metrics} />
      </section>

      <section className="mt-4 grid gap-4 md:grid-cols-2">
        <CardHiro>
          <OverlineLabel>Medicamentos ativos</OverlineLabel>
          <ul className="mt-3 space-y-2">
            {patient.medications.map((medication) => (
              <li key={medication.name} className="rounded-xl bg-white/55 p-3">
                <p className="text-sm font-medium text-hiro-text">
                  {medication.name} — {medication.dose}
                </p>
                <p className="text-xs text-hiro-muted">Status: {medication.status}</p>
              </li>
            ))}
          </ul>
          <BadgeStatus
            className="mt-3"
            status="pending"
            label="Interações medicamentosas: validação básica ativa"
          />
        </CardHiro>
        <CardHiro>
          <OverlineLabel>CIDs ao longo do tempo</OverlineLabel>
          <ul className="mt-3 space-y-2">
            {patient.cids.map((cid) => (
              <li key={cid.code} className="rounded-xl bg-white/55 p-3">
                <p className="text-sm font-medium text-hiro-text">
                  {cid.code} — {cid.name}
                </p>
                <p className="text-xs text-hiro-muted">
                  Primeira ocorrência: {cid.firstSeen} • Última: {cid.lastSeen}
                </p>
              </li>
            ))}
          </ul>
        </CardHiro>
      </section>
    </main>
  );
}
