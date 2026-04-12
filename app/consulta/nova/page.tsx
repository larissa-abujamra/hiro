import { NewConsultationFlow } from "@/components/consulta/NewConsultationFlow";

interface NovaConsultaPageProps {
  searchParams: Promise<{ appointmentId?: string; patientName?: string }>;
}

export default async function NovaConsultaPage({ searchParams }: NovaConsultaPageProps) {
  const params = await searchParams;
  console.log("[NovaConsultaPage] searchParams:", params);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-4 md:px-6 md:py-6">
      <h1 className="font-serif text-3xl text-hiro-text">Nova consulta</h1>
      <p className="mt-2 text-sm text-hiro-muted">
        Tela 1: seleção de paciente.
      </p>
      <NewConsultationFlow
        appointmentId={params.appointmentId}
        initialPatientName={params.patientName}
      />
    </div>
  );
}
