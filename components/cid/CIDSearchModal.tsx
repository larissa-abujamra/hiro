"use client";

import { useMemo, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { CID10_DATA, CID10_COMUNS, type CID10Entry } from "@/data/cid10";

interface CIDSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (code: string, name: string) => void;
  /** Already-confirmed CID codes to exclude from results */
  existingCodes: string[];
}

export function CIDSearchModal({
  isOpen,
  onClose,
  onAdd,
  existingCodes,
}: CIDSearchModalProps) {
  const [query, setQuery] = useState("");

  const existingSet = new Set(existingCodes.map((c) => c.toUpperCase()));

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return CID10_DATA.filter(
      (c) =>
        !existingSet.has(c.codigo.toUpperCase()) &&
        (c.codigo.toLowerCase().includes(q) ||
          c.descricao.toLowerCase().includes(q)),
    ).slice(0, 20);
  }, [query, existingSet]);

  const quickPicks = CID10_COMUNS.filter(
    (c) => !existingSet.has(c.codigo.toUpperCase()),
  );

  if (!isOpen) return null;

  function handleSelect(entry: CID10Entry) {
    onAdd(entry.codigo, entry.descricao);
    setQuery("");
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden rounded-2xl border border-black/[0.08] bg-[#f0ede6] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="font-serif text-xl font-normal text-hiro-text">
            Buscar CID-10
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-hiro-muted transition-colors hover:bg-black/[0.04] hover:text-hiro-text"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>

        {/* Search input */}
        <div className="relative px-5 pb-3">
          <Search
            className="absolute left-8 top-1/2 h-4 w-4 -translate-y-1/2 text-hiro-muted/50"
            strokeWidth={1.75}
          />
          <input
            type="text"
            autoFocus
            className="glass-card-input w-full rounded-xl py-2.5 pl-9 pr-3 text-[14px] text-hiro-text outline-none placeholder:text-hiro-muted/40 focus:ring-2 focus:ring-hiro-green/30"
            placeholder="Digite código ou descrição..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-5 pb-5">
          {query.trim() ? (
            results.length > 0 ? (
              <div className="space-y-1.5">
                {results.map((entry) => (
                  <button
                    key={entry.codigo}
                    type="button"
                    onClick={() => handleSelect(entry)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-black/[0.04]"
                  >
                    <Plus
                      className="h-4 w-4 shrink-0 text-hiro-green"
                      strokeWidth={2}
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[13px] font-semibold text-hiro-green">
                        {entry.codigo}
                      </span>
                      <span className="ml-2 text-[13px] text-hiro-text">
                        {entry.descricao}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-[13px] text-hiro-muted">
                Nenhum resultado para "{query}"
              </p>
            )
          ) : (
            <>
              {quickPicks.length > 0 && (
                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-hiro-muted">
                    CIDs frequentes
                  </p>
                  <div className="space-y-1.5">
                    {quickPicks.map((entry) => (
                      <button
                        key={entry.codigo}
                        type="button"
                        onClick={() => handleSelect(entry)}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-black/[0.04]"
                      >
                        <Plus
                          className="h-4 w-4 shrink-0 text-hiro-green"
                          strokeWidth={2}
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-[13px] font-semibold text-hiro-green">
                            {entry.codigo}
                          </span>
                          <span className="ml-2 text-[13px] text-hiro-text">
                            {entry.descricao}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {quickPicks.length === 0 && (
                <p className="py-8 text-center text-[13px] text-hiro-muted">
                  Digite para buscar códigos CID-10
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
