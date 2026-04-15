import { NovaConsultaClient } from "@/components/consulta/NovaConsultaClient";

interface NovaConsultaPageProps {
  searchParams: Promise<{ appointmentId?: string; patientName?: string }>;
}

export default async function NovaConsultaPage({ searchParams }: NovaConsultaPageProps) {
  const params = await searchParams;
  console.log("[NovaConsultaPage] searchParams:", params);

  return (
    <NovaConsultaClient
      appointmentId={params.appointmentId}
      initialPatientName={params.patientName}
    />
  );
}
