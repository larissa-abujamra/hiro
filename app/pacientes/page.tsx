import { PatientsDashboard } from "@/components/paciente/PatientsDashboard";

export default function PacientesPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-4 md:px-6 md:py-6">
      <h1 className="font-serif text-3xl text-hiro-text">Pacientes</h1>
      <p className="mt-2 text-sm text-hiro-muted">
        Cadastro e acesso rápido ao perfil clínico.
      </p>
      <PatientsDashboard />
    </main>
  );
}
