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
    <main className="mx-auto w-full max-w-6xl bg-hiro-bg px-6 py-6">
      <GeneratedSummaryWorkspace consultationId={id} patients={mockPatients} />
    </main>
  );
}
