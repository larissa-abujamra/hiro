import type { CidCode } from "@/lib/types";

interface CidSuggestionsProps {
  suggestions: CidCode[];
}

export function CidSuggestions({ suggestions }: CidSuggestionsProps) {
  return (
    <section className="rounded-2xl border border-black/8 bg-hiro-card p-5">
      <p className="text-sm font-medium text-hiro-text">CID sugeridos</p>
      <ul className="mt-3 space-y-2">
        {suggestions.map((cid) => (
          <li key={cid.code} className="text-sm text-hiro-text">
            {cid.code} - {cid.name}
          </li>
        ))}
      </ul>
    </section>
  );
}
