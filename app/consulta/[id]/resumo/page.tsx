interface ResumoConsultaPageProps {
  params: Promise<{ id: string }>;
}

export default async function ResumoConsultaPage({
  params,
}: ResumoConsultaPageProps) {
  const { id } = await params;

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-8">
      <h1 className="font-serif text-3xl text-hiro-text">Resumo {id}</h1>
      <p className="mt-2 text-sm text-hiro-muted">
        Tela 3: notas geradas e documentos.
      </p>
    </main>
  );
}
