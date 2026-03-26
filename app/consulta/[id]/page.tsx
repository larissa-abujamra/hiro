import { ConsultationWorkspace } from "@/components/consulta/ConsultationWorkspace";
import { mockPatients } from "@/lib/mockData";

interface ConsultaPageProps {
  params: Promise<{ id: string }>;
}

export default async function ConsultaPage({ params }: ConsultaPageProps) {
  const { id } = await params;

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-8">
      <h1 className="font-serif text-3xl text-hiro-text">Consulta {id}</h1>
      <p className="mt-2 text-sm text-hiro-muted">
        Tela 2: gravacao e transcricao em tempo real.
      </p>
      <ConsultationWorkspace consultationId={id} patients={mockPatients} />
    </main>
  );
}
