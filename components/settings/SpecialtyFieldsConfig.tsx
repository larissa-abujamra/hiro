"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { specialtyConfigs, type SpecialtyField } from "@/data/specialty-fields";
import { CardHiro } from "@/components/ui/CardHiro";
import { OverlineLabel } from "@/components/ui/OverlineLabel";
import { ButtonHiro } from "@/components/ui/ButtonHiro";

const SECTION_LABELS: Record<string, string> = {
  subjetivo: "Subjetivo",
  objetivo: "Objetivo",
  avaliacao: "Avaliação",
  plano: "Plano",
};

interface SpecialtyFieldsConfigProps {
  specialty: string;
  selectedFields: string[];
  onSave: (fields: string[]) => void;
}

export function SpecialtyFieldsConfig({
  specialty,
  selectedFields,
  onSave,
}: SpecialtyFieldsConfigProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedFields));
  const [saved, setSaved] = useState(false);

  const config = specialtyConfigs[specialty];

  if (!config) {
    return (
      <p className="text-[13px] italic text-hiro-muted/60">
        Selecione uma especialidade no perfil para personalizar os campos do prontuário.
      </p>
    );
  }

  function toggleField(fieldId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(fieldId)) next.delete(fieldId);
      else next.add(fieldId);
      return next;
    });
    setSaved(false);
  }

  function handleSave() {
    onSave(Array.from(selected));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  // Group fields by section
  const fieldsBySection = config.fields.reduce<Record<string, SpecialtyField[]>>(
    (acc, field) => {
      if (!acc[field.section]) acc[field.section] = [];
      acc[field.section].push(field);
      return acc;
    },
    {},
  );

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-serif text-lg font-normal text-hiro-text">
          Campos para {specialty}
        </h3>
        <p className="mt-1 text-[12px] text-hiro-muted">
          Selecione os campos que deseja incluir no prontuário. Eles aparecerão como sugestões durante a consulta.
        </p>
      </div>

      {Object.entries(fieldsBySection).map(([section, fields]) => (
        <div key={section}>
          <OverlineLabel>{SECTION_LABELS[section] ?? section}</OverlineLabel>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {fields.map((field) => {
              const isSelected = selected.has(field.id);
              return (
                <button
                  key={field.id}
                  type="button"
                  onClick={() => toggleField(field.id)}
                  className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-left transition-colors ${
                    isSelected
                      ? "border-hiro-green/40 bg-hiro-green/5"
                      : "border-black/[0.06] hover:border-black/[0.12]"
                  }`}
                >
                  <div>
                    <p className="text-[13px] font-medium text-hiro-text">{field.label}</p>
                    {field.unit && (
                      <p className="text-[11px] text-hiro-muted">{field.unit}</p>
                    )}
                  </div>
                  {isSelected && (
                    <Check className="h-4 w-4 shrink-0 text-hiro-green" strokeWidth={2} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-3 border-t border-black/[0.06] pt-4">
        <ButtonHiro onClick={handleSave} className="px-6">
          {saved ? (
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-4 w-4" /> Salvo
            </span>
          ) : (
            "Salvar preferências"
          )}
        </ButtonHiro>
        <p className="text-[11px] text-hiro-muted">
          {selected.size} campo(s) selecionado(s)
        </p>
      </div>
    </div>
  );
}
