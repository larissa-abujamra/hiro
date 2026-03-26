import { NewConsultationFlow } from "@/components/consulta/NewConsultationFlow";
import { mockPatients } from "@/lib/mockData";

export default function NovaConsultaPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-8">
      <h1 className="font-serif text-3xl text-hiro-text">Nova consulta</h1>
      <p className="mt-2 text-sm text-hiro-muted">
        Tela 1: selecao de paciente.
      </p>
      <NewConsultationFlow patients={mockPatients} />
    </main>
  );
}
