import { GeneratedSummaryWorkspace } from "@/components/prontuario/GeneratedSummaryWorkspace";
import { mockPatients } from "@/lib/mockData";

interface ResumoConsultaPageProps {
  params: Promise<{ id: string }>;
}

export default async function ResumoConsultaPage({
  params,
}: ResumoConsultaPageProps) {
  const { id } = await params;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-6">
      <GeneratedSummaryWorkspace consultationId={id} patients={mockPatients} />
    </div>
  );
}
