import type { CidCode } from "@/lib/types";

interface CidSuggestionsProps {
  suggestions: CidCode[];
}

export function CidSuggestions({ suggestions }: CidSuggestionsProps) {
  return (
    <section className="glass-card rounded-2xl p-5">
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
