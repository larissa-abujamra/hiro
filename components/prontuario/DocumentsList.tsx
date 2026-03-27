import type { GeneratedDocument } from "@/lib/types";

interface DocumentsListProps {
  documents: GeneratedDocument[];
}

export function DocumentsList({ documents }: DocumentsListProps) {
  return (
    <section className="rounded-2xl border border-black/8 bg-hiro-card p-5">
      <p className="text-sm font-medium text-hiro-text">Documentos</p>
      <ul className="mt-3 space-y-2">
        {documents.map((doc, index) => (
          <li key={`${doc.type}-${index}`} className="text-sm text-hiro-text">
            {doc.type} ({doc.status})
          </li>
        ))}
      </ul>
    </section>
  );
}
