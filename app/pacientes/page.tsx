import Link from "next/link";
import { CardHiro } from "@/components/ui/CardHiro";
import { OverlineLabel } from "@/components/ui/OverlineLabel";
import { AvatarInitials } from "@/components/ui/AvatarInitials";
import { mockPatients } from "@/lib/mockData";

export default function PacientesPage() {
  return (
    <main className="mx-auto w-full max-w-6xl bg-hiro-bg px-4 py-4 md:px-6 md:py-6">
      <h1 className="font-serif text-3xl text-hiro-text">Pacientes</h1>
      <p className="mt-2 text-sm text-hiro-muted">
        Cadastro e acesso rápido ao perfil clínico.
      </p>
      <section className="mt-6 grid gap-4">
        {mockPatients.map((patient) => (
          <CardHiro key={patient.id} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <AvatarInitials name={patient.name} />
              <div>
                <p className="font-medium text-hiro-text">{patient.name}</p>
                <p className="text-xs text-hiro-muted">
                  {patient.consultations.length} consultas • {patient.medications.length} medicações
                </p>
              </div>
            </div>
            <div className="text-right">
              <OverlineLabel>Perfil</OverlineLabel>
              <Link href={`/pacientes/${patient.id}`} className="block text-sm underline">
                Ver paciente
              </Link>
            </div>
          </CardHiro>
        ))}
      </section>
    </main>
  );
}
