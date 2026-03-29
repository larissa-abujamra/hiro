import { OverlineLabel } from "@/components/ui/OverlineLabel";

export function ExamUpload() {
  return (
    <section className="glass-card rounded-2xl p-4">
      <OverlineLabel>Upload de exames</OverlineLabel>
      <div className="mt-3 rounded-xl border border-dashed border-white/50 bg-[rgba(255,255,255,0.6)] p-5 text-center">
        <p className="text-sm text-hiro-text">Arraste PDF/JPG/PNG ou clique para adicionar</p>
        <button
          type="button"
          className="mt-2 rounded-full border border-black/15 px-4 py-2 text-xs text-hiro-text"
        >
          Adicionar exame
        </button>
      </div>
      <p className="mt-2 text-xs text-hiro-muted">
        Preview e processamento disponíveis como contexto em próximas consultas.
      </p>
    </section>
  );
}
