import { ConsultationWorkspace } from "@/components/consulta/ConsultationWorkspace";
import { mockPatients } from "@/lib/mockData";

interface ConsultaPageProps {
  params: Promise<{ id: string }>;
}

export default async function ConsultaPage({ params }: ConsultaPageProps) {
  const { id } = await params;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-6">
      <ConsultationWorkspace consultationId={id} patients={mockPatients} />
    </div>
  );
}
