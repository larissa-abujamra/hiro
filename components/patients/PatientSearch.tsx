"use client";

import { useEffect, useRef, useState } from "react";
import { Search, User } from "lucide-react";
import { formatDateBR } from "@/lib/formatDate";

export interface PatientSearchResult {
  id: string;
  name: string;
  phone?: string;
  dateOfBirth?: string;
  sex?: string;
}

interface PatientSearchProps {
  onSelect: (patient: PatientSearchResult) => void;
}

export function PatientSearch({ onSelect }: PatientSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PatientSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    let cancelled = false;
    const debounce = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/patients?q=${encodeURIComponent(query.trim())}`,
        );
        if (!res.ok) {
          if (!cancelled) {
            setResults([]);
            setIsOpen(true);
          }
          return;
        }
        const data = await res.json();
        if (cancelled) return;
        setResults(data.patients ?? []);
        setIsOpen(true);
      } catch (err) {
        console.error("[PatientSearch] fetch error:", err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(debounce);
    };
  }, [query]);

  return (
    <div className="relative">
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-hiro-muted/60"
          strokeWidth={1.75}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Digite o nome do paciente..."
          className="glass-card-input w-full rounded-xl pl-9 pr-9 py-2.5 text-[13px] text-hiro-text outline-none focus:ring-2 focus:ring-hiro-green/30"
          autoFocus
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-hiro-green border-t-transparent" />
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute left-0 right-0 z-20 mt-1 max-h-64 overflow-auto rounded-xl border border-black/[0.08] bg-[#f0ede6] shadow-lg">
          {results.map((patient) => (
            <button
              key={patient.id}
              type="button"
              onMouseDown={() => {
                onSelect(patient);
                setIsOpen(false);
                setQuery("");
              }}
              className="flex w-full items-center gap-3 border-b border-black/[0.04] px-3 py-2.5 text-left transition-colors last:border-0 hover:bg-black/[0.03]"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-hiro-green/10">
                <User className="h-4 w-4 text-hiro-green" strokeWidth={1.75} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-hiro-text">
                  {patient.name}
                </p>
                <p className="truncate text-[11px] text-hiro-muted">
                  {patient.dateOfBirth
                    ? formatDateBR(patient.dateOfBirth)
                    : "Sem data nasc."}
                  {" · "}
                  {patient.phone || "Sem telefone"}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen &&
        query.trim().length >= 2 &&
        results.length === 0 &&
        !isLoading && (
          <div className="absolute left-0 right-0 z-20 mt-1 rounded-xl border border-black/[0.08] bg-[#f0ede6] p-4 text-center text-[12px] text-hiro-muted shadow-lg">
            Nenhum paciente encontrado
          </div>
        )}
    </div>
  );
}
