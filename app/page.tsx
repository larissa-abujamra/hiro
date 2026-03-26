export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10">
      <header className="mb-10">
        <p className="font-serif text-4xl text-hiro-text">Hiro</p>
        <p className="mt-2 text-sm text-hiro-muted">
          Medical scribe dashboard scaffold
        </p>
      </header>
      <section className="rounded-2xl bg-hiro-card p-6">
        <h1 className="font-serif text-2xl text-hiro-text">Welcome</h1>
        <p className="mt-2 text-sm text-hiro-muted">
          Base project structure is ready for patient, consultation and summary
          flows.
        </p>
      </section>
    </main>
  );
}
