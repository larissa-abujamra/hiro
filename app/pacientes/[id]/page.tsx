import { PatientProfileWorkspace } from "@/components/paciente/PatientProfileWorkspace";

interface PacientePageProps {
  params: Promise<{ id: string }>;
}

export default async function PacientePage({ params }: PacientePageProps) {
  const { id } = await params;

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-6">
      <PatientProfileWorkspace patientId={id} />
    </main>
  );
}
