"use client";

import { useState } from "react";
import { Check, Plus, X } from "lucide-react";
import type { SpecialtyField } from "@/types/onboarding";

interface SpecialtyFieldsStepProps {
  specialty: string;
  fields: SpecialtyField[];
  onUpdate: (fields: SpecialtyField[]) => void;
}

export function SpecialtyFieldsStep({ specialty, fields, onUpdate }: SpecialtyFieldsStepProps) {
  const [newFieldName, setNewFieldName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  function toggle(id: string) {
    onUpdate(fields.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f)));
  }

  function addCustom() {
    if (!newFieldName.trim()) return;
    onUpdate([...fields, { id: `custom_${Date.now()}`, name: newFieldName.trim(), enabled: true, isCustom: true }]);
    setNewFieldName("");
    setIsAdding(false);
  }

  function remove(id: string) {
    onUpdate(fields.filter((f) => f.id !== id));
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl text-hiro-text">Personalize seu prontuário</h2>
        <p className="mt-2 text-[14px] text-hiro-muted leading-relaxed">
          Baseado na sua especialidade em <span className="font-medium text-hiro-text">{specialty}</span>, sugerimos estes campos para o exame físico. Selecione os que deseja usar.
        </p>
      </div>

      <div className="space-y-2">
        {fields.map((field) => (
          <div
            key={field.id}
            onClick={() => toggle(field.id)}
            className={`flex cursor-pointer items-center justify-between rounded-xl border-2 px-4 py-3.5 transition-all ${
              field.enabled ? "border-hiro-green/40 bg-hiro-green/5" : "border-black/[0.06] bg-white/50 hover:border-black/[0.12]"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${field.enabled ? "bg-hiro-green text-white" : "bg-black/[0.06]"}`}>
                {field.enabled && <Check className="h-4 w-4" strokeWidth={2} />}
              </div>
              <span className={field.enabled ? "font-medium text-hiro-text" : "text-hiro-muted"}>{field.name}</span>
              {field.isCustom && (
                <span className="rounded-full bg-hiro-amber/15 px-2 py-0.5 text-[10px] font-medium text-hiro-amber">Personalizado</span>
              )}
            </div>
            {field.isCustom && (
              <button type="button" onClick={(e) => { e.stopPropagation(); remove(field.id); }} className="p-1 text-hiro-muted/40 hover:text-hiro-red">
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            )}
          </div>
        ))}
      </div>

      {isAdding ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={newFieldName}
            onChange={(e) => setNewFieldName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addCustom(); if (e.key === "Escape") setIsAdding(false); }}
            placeholder="Nome do campo"
            autoFocus
            className="glass-card-input flex-1 rounded-xl px-4 py-3 text-[14px] text-hiro-text outline-none focus:ring-2 focus:ring-hiro-green/30"
          />
          <button type="button" onClick={addCustom} disabled={!newFieldName.trim()} className="rounded-xl bg-hiro-green px-4 py-3 text-white hover:bg-[#244a3b] disabled:opacity-40">
            Adicionar
          </button>
          <button type="button" onClick={() => { setIsAdding(false); setNewFieldName(""); }} className="px-3 py-3 text-hiro-muted hover:text-hiro-text">
            Cancelar
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => setIsAdding(true)} className="flex w-full items-center gap-2 rounded-xl border-2 border-dashed border-black/[0.1] px-4 py-3.5 text-hiro-muted transition-colors hover:border-hiro-green/40 hover:text-hiro-green">
          <Plus className="h-5 w-5" strokeWidth={1.75} />
          Adicionar campo personalizado
        </button>
      )}

      <p className="text-[12px] text-hiro-muted/60">
        Você pode alterar esses campos a qualquer momento nas configurações.
      </p>
    </div>
  );
}
