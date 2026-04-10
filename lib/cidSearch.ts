import { CID10_DATA, type CID10Entry } from "@/data/cid10";

export interface DiagnosticoSugerido {
  texto: string;
  termos_busca: string[];
  categoria: string;
  sourceQuote: string;
  matches: CID10Entry[];
}

/**
 * Search the local CID-10 database using multiple terms.
 * Returns entries sorted by relevance (exact code match > description match).
 */
export function searchCIDs(terms: string[], maxResults = 8): CID10Entry[] {
  if (terms.length === 0) return [];

  const normalizedTerms = terms.map((t) => t.toLowerCase().trim()).filter(Boolean);

  const scored: { entry: CID10Entry; score: number }[] = [];

  for (const entry of CID10_DATA) {
    const codeLower = entry.codigo.toLowerCase();
    const descLower = entry.descricao.toLowerCase();
    let score = 0;

    for (const term of normalizedTerms) {
      // Exact code match (highest priority)
      if (codeLower === term) {
        score += 100;
      }
      // Code starts with term (e.g. "M54" matches "M54.5")
      else if (codeLower.startsWith(term)) {
        score += 50;
      }
      // Code contains term
      else if (codeLower.includes(term)) {
        score += 30;
      }
      // Description contains term
      if (descLower.includes(term)) {
        score += 10 + (term.length > 4 ? 5 : 0); // longer terms score higher
      }
    }

    if (score > 0) {
      scored.push({ entry, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, maxResults).map((s) => s.entry);
}

/**
 * Takes the API response diagnosticos and matches each against the local CID-10 database.
 */
export function matchDiagnosticos(
  diagnosticos: { texto: string; termos_busca: string[]; categoria: string; sourceQuote?: string }[]
): DiagnosticoSugerido[] {
  return diagnosticos.map((d) => ({
    texto: d.texto,
    termos_busca: d.termos_busca,
    categoria: d.categoria,
    sourceQuote: d.sourceQuote ?? "",
    matches: searchCIDs(d.termos_busca),
  }));
}
