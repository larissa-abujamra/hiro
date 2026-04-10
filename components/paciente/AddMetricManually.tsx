"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { ButtonHiro } from "@/components/ui/ButtonHiro";
import type { TrackedMetric } from "@/lib/types";

const COMMON_METRICS = [
  { name: "Peso", unit: "kg" },
  { name: "Pressão sistólica", unit: "mmHg" },
  { name: "Pressão diastólica", unit: "mmHg" },
  { name: "Frequência cardíaca", unit: "bpm" },
  { name: "Temperatura", unit: "°C" },
  { name: "Saturação O₂", unit: "%" },
  { name: "Glicemia capilar", unit: "mg/dL" },
  { name: "IMC", unit: "kg/m²" },
];

interface AddMetricManuallyProps {
  currentMetrics: TrackedMetric[];
  onSave: (name: string, value: number, unit: string) => void;
}

const inputClass =
  "glass-card-input w-full rounded-xl px-3 py-2 text-[13px] text-hiro-text outline-none focus:ring-2 focus:ring-hiro-green/30";

export function AddMetricManually({ currentMetrics, onSave }: AddMetricManuallyProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [metricName, setMetricName] = useState("");
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("");

  function selectCommon(name: string, u: string) {
    setMetricName(name);
    setUnit(u);
  }

  function handleSave() {
    const numVal = parseFloat(value);
    if (!metricName.trim() || isNaN(numVal)) return;
    onSave(metricName.trim(), numVal, unit.trim());
    setIsOpen(false);
    setMetricName("");
    setValue("");
    setUnit("");
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 text-[12px] font-medium text-hiro-green transition-colors hover:text-hiro-green/80"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2} />
        Adicionar medida manualmente
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl border border-black/[0.08] bg-[#f0ede6] p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-xl font-normal text-hiro-text">
            Adicionar Medida
          </h3>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-full p-1.5 text-hiro-muted transition-colors hover:bg-black/[0.04] hover:text-hiro-text"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>

        {/* Quick-select pills */}
        <p className="text-[11px] font-semibold uppercase tracking-wide text-hiro-muted mb-2">
          Métricas comuns
        </p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {COMMON_METRICS.map((m) => {
            const selected = metricName === m.name;
            return (
              <button
                key={m.name}
                type="button"
                onClick={() => selectCommon(m.name, m.unit)}
                className={`rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors ${
                  selected
                    ? "bg-[#2d5a47] text-white"
                    : "border border-black/[0.08] bg-white/50 text-hiro-muted hover:border-hiro-green/40 hover:text-hiro-text"
                }`}
              >
                {m.name}
              </button>
            );
          })}
        </div>

        {/* Fields */}
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Nome da métrica"
            value={metricName}
            onChange={(e) => setMetricName(e.target.value)}
            className={inputClass}
          />
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Valor"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className={`${inputClass} flex-1`}
              step="any"
            />
            <input
              type="text"
              placeholder="Unidade"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className={`${inputClass} w-24`}
            />
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <ButtonHiro
            onClick={handleSave}
            className="flex-1"
            disabled={!metricName.trim() || !value}
          >
            Salvar
          </ButtonHiro>
          <ButtonHiro variant="secondary" onClick={() => setIsOpen(false)} className="px-6">
            Cancelar
          </ButtonHiro>
        </div>
      </div>
    </div>
  );
}
