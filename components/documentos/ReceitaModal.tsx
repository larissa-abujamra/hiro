"use client";

import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { ButtonHiro } from "@/components/ui/ButtonHiro";
import { generateReceitaPDF, type Medicamento } from "@/lib/generateReceita";

interface ReceitaModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  doctorName: string;
  crm: string;
  uf: string;
  clinicAddress?: string;
  rqe?: string;
  especialidade?: string;
  /** Pre-extracted from SOAP Plan field */
  initialMeds: Medicamento[];
}

const inputClass =
  "glass-card-input w-full rounded-xl px-3 py-2 text-[13px] text-hiro-text outline-none focus:ring-2 focus:ring-hiro-green/30";

const EMPTY_MED: Medicamento = { nome: "", dosagem: "", posologia: "", quantidade: "" };

export function ReceitaModal({
  isOpen,
  onClose,
  patientName,
  doctorName,
  crm,
  uf,
  clinicAddress,
  rqe,
  especialidade,
  initialMeds,
}: ReceitaModalProps) {
  const [meds, setMeds] = useState<Medicamento[]>(
    initialMeds.length > 0 ? initialMeds : [{ ...EMPTY_MED }],
  );
  const [generated, setGenerated] = useState(false);

  if (!isOpen) return null;

  function updateMed(index: number, field: keyof Medicamento, value: string) {
    setMeds((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)),
    );
  }

  function removeMed(index: number) {
    setMeds((prev) => prev.filter((_, i) => i !== index));
  }

  function addMed() {
    setMeds((prev) => [...prev, { ...EMPTY_MED }]);
  }

  function handleGenerate() {
    const valid = meds.filter((m) => m.nome.trim());
    if (valid.length === 0) return;
    generateReceitaPDF({ patientName, doctorName, crm, uf, medicamentos: valid, clinicAddress, rqe, especialidade });
    setGenerated(true);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-black/[0.08] bg-[#f0ede6] p-6 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif text-2xl font-normal text-hiro-text">
            Receituário
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
          Paciente: <span className="font-medium text-hiro-text">{patientName}</span>
        </p>

        {/* Medication list */}
        <div className="space-y-4">
          {meds.map((med, i) => (
            <div
              key={i}
              className="relative rounded-2xl border border-black/[0.06] bg-white/50 p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-hiro-muted">
                  Medicamento {i + 1}
                </p>
                {meds.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMed(i)}
                    className="rounded-full p-1 text-hiro-muted/40 transition-colors hover:text-hiro-red"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2">
                  <input
                    className={inputClass}
                    placeholder="Nome do medicamento"
                    value={med.nome}
                    onChange={(e) => updateMed(i, "nome", e.target.value)}
                  />
                </div>
                <input
                  className={inputClass}
                  placeholder="Dosagem (ex: 500mg)"
                  value={med.dosagem}
                  onChange={(e) => updateMed(i, "dosagem", e.target.value)}
                />
                <input
                  className={inputClass}
                  placeholder="Quantidade"
                  value={med.quantidade}
                  onChange={(e) => updateMed(i, "quantidade", e.target.value)}
                />
                <div className="col-span-2">
                  <input
                    className={inputClass}
                    placeholder="Posologia (ex: 1 comp de 8/8h por 7 dias)"
                    value={med.posologia}
                    onChange={(e) => updateMed(i, "posologia", e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add medication */}
        <button
          type="button"
          onClick={addMed}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-black/15 py-2.5 text-[12px] font-medium text-hiro-muted transition-colors hover:border-hiro-green/40 hover:text-hiro-green"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2} />
          Adicionar medicamento
        </button>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <ButtonHiro
            onClick={handleGenerate}
            className="flex-1"
            disabled={meds.every((m) => !m.nome.trim())}
          >
            {generated ? "Baixar novamente" : "Gerar Receita (PDF)"}
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
