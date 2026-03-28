import { NewConsultationFlow } from "@/components/consulta/NewConsultationFlow";

export default function NovaConsultaPage() {
  return (
    <div className="mx-auto w-full max-w-6xl bg-hiro-bg px-4 py-4 md:px-6 md:py-6">
      <h1 className="font-serif text-3xl text-hiro-text">Nova consulta</h1>
      <p className="mt-2 text-sm text-hiro-muted">
        Tela 1: selecao de paciente.
      </p>
      <NewConsultationFlow />
    </div>
  );
}
