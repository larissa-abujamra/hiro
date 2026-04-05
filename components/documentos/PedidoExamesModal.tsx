"use client";

import { useState } from "react";
import { Plus, Search, Trash2, X } from "lucide-react";
import { ButtonHiro } from "@/components/ui/ButtonHiro";
import { generatePedidoExamesPDF } from "@/lib/generatePedidoExames";

interface PedidoExamesModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  patientAge: number;
  doctorName: string;
  crm: string;
  uf: string;
  /** Pre-extracted from SOAP */
  initialExames: string[];
  /** Pre-filled from SOAP Assessment */
  initialIndicacao: string;
}

const EXAMES_COMUNS = [
  "Hemograma completo",
  "Glicemia de jejum",
  "Hemoglobina glicada (HbA1c)",
  "Colesterol total e frações",
  "Triglicerídeos",
  "TGO / TGP",
  "Ureia e creatinina",
  "Ácido úrico",
  "TSH e T4 livre",
  "Urina tipo 1 (EAS)",
  "Raio-X de tórax",
  "Eletrocardiograma",
  "Ultrassom abdominal",
  "PCR (proteína C reativa)",
  "VHS",
  "Vitamina D (25-OH)",
  "Vitamina B12",
  "Ferritina e ferro sérico",
];

const inputClass =
  "glass-card-input w-full rounded-xl px-3 py-2 text-[13px] text-hiro-text outline-none focus:ring-2 focus:ring-hiro-green/30";

export function PedidoExamesModal({
  isOpen,
  onClose,
  patientName,
  patientAge,
  doctorName,
  crm,
  uf,
  initialExames,
  initialIndicacao,
}: PedidoExamesModalProps) {
  const [exames, setExames] = useState<string[]>(
    initialExames.length > 0 ? initialExames : [],
  );
  const [indicacao, setIndicacao] = useState(initialIndicacao);
  const [search, setSearch] = useState("");
  const [generated, setGenerated] = useState(false);

  if (!isOpen) return null;

  const filtered = EXAMES_COMUNS.filter(
    (e) =>
      e.toLowerCase().includes(search.toLowerCase()) &&
      !exames.includes(e),
  );

  function addExame(name: string) {
    if (!exames.includes(name)) {
      setExames((prev) => [...prev, name]);
    }
    setSearch("");
  }

  function addCustom() {
    const trimmed = search.trim();
    if (trimmed && !exames.includes(trimmed)) {
      setExames((prev) => [...prev, trimmed]);
    }
    setSearch("");
  }

  function removeExame(name: string) {
    setExames((prev) => prev.filter((e) => e !== name));
  }

  function handleGenerate() {
    if (exames.length === 0) return;
    generatePedidoExamesPDF({
      patientName,
      patientAge,
      doctorName,
      crm,
      uf,
      exames,
      indicacaoClinica: indicacao,
    });
    setGenerated(true);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-black/[0.08] bg-[#f0ede6] p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif text-2xl font-normal text-hiro-text">
            Pedido de Exames
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-hiro-muted transition-colors hover:bg-black/[0.04] hover:text-hiro-text"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>

        {/* Patient */}
        <p className="text-[12px] text-hiro-muted mb-4">
          Paciente:{" "}
          <span className="font-medium text-hiro-text">
            {patientName} — {patientAge} anos
          </span>
        </p>

        {/* Selected exams */}
        {exames.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {exames.map((e) => (
              <span
                key={e}
                className="inline-flex items-center gap-1.5 rounded-full border border-hiro-green/20 bg-hiro-green/5 px-3 py-1.5 text-[12px] font-medium text-hiro-green"
              >
                {e}
                <button
                  type="button"
                  onClick={() => removeExame(e)}
                  className="rounded-full p-0.5 transition-colors hover:bg-hiro-green/10"
                >
                  <X className="h-3 w-3" strokeWidth={2} />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Search / add */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-hiro-muted/50" strokeWidth={1.75} />
          <input
            className={`${inputClass} pl-9`}
            placeholder="Buscar exame ou digitar novo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (filtered.length > 0) addExame(filtered[0]);
                else addCustom();
              }
            }}
          />
        </div>

        {/* Quick-select list */}
        {search ? (
          <div className="mb-4 max-h-[180px] overflow-y-auto rounded-xl border border-black/[0.06] bg-white/50">
            {filtered.length > 0 ? (
              filtered.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => addExame(e)}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] text-hiro-text transition-colors hover:bg-black/[0.03] border-b border-black/[0.04] last:border-0"
                >
                  <Plus className="h-3.5 w-3.5 shrink-0 text-hiro-green" strokeWidth={2} />
                  {e}
                </button>
              ))
            ) : (
              <button
                type="button"
                onClick={addCustom}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] text-hiro-green transition-colors hover:bg-black/[0.03]"
              >
                <Plus className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                Adicionar "{search.trim()}"
              </button>
            )}
          </div>
        ) : (
          <div className="mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-hiro-muted mb-2">
              Exames comuns
            </p>
            <div className="flex flex-wrap gap-1.5">
              {EXAMES_COMUNS.filter((e) => !exames.includes(e))
                .slice(0, 10)
                .map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => addExame(e)}
                    className="rounded-full border border-black/[0.08] bg-white/50 px-3 py-1.5 text-[11px] text-hiro-muted transition-colors hover:bg-white/80 hover:text-hiro-text"
                  >
                    + {e}
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Clinical indication */}
        <div className="mb-5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-hiro-muted mb-2">
            Indicação clínica
          </p>
          <textarea
            className={`${inputClass} min-h-[60px] resize-none`}
            rows={2}
            placeholder="Diagnóstico ou justificativa para os exames..."
            value={indicacao}
            onChange={(e) => setIndicacao(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <ButtonHiro
            onClick={handleGenerate}
            className="flex-1"
            disabled={exames.length === 0}
          >
            {generated ? "Baixar novamente" : "Gerar Pedido (PDF)"}
          </ButtonHiro>
          <ButtonHiro variant="secondary" onClick={onClose} className="px-6">
            Fechar
          </ButtonHiro>
        </div>

        {generated && (
          <p className="mt-3 text-center text-[12px] text-hiro-green">
            PDF gerado e baixado com sucesso.
          </p>
        )}
      </div>
    </div>
  );
}
