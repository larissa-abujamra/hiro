interface PacientePageProps {
  params: Promise<{ id: string }>;
}

export default async function PacientePage({ params }: PacientePageProps) {
  const { id } = await params;

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-8">
      <h1 className="font-serif text-3xl text-hiro-text">Paciente {id}</h1>
      <p className="mt-2 text-sm text-hiro-muted">
        Perfil do paciente e graficos de evolucao.
      </p>
    </main>
  );
}
