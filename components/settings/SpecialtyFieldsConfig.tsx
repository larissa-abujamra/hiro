"use client";

import { useEffect, useState } from "react";
import { Check, Plus, X } from "lucide-react";
import { specialtyConfigs } from "@/data/specialty-fields";
import { SPECIALTY_FIELDS as ONBOARDING_FIELDS } from "@/data/specialty-onboarding";
import { ButtonHiro } from "@/components/ui/ButtonHiro";
import { createClient } from "@/lib/supabase/client";

interface FieldItem {
  id: string;
  label: string;
  isCustom?: boolean;
}

interface SpecialtyFieldsConfigProps {
  specialty: string;
  selectedFields: string[];
  onSave: (fields: string[]) => void;
}

export function SpecialtyFieldsConfig({
  specialty,
  selectedFields: propSelectedFields,
  onSave,
}: SpecialtyFieldsConfigProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(propSelectedFields));
  const [allFields, setAllFields] = useState<FieldItem[]>([]);
  const [customFields, setCustomFields] = useState<FieldItem[]>([]);
  const [newFieldName, setNewFieldName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Build the field list from multiple sources
  useEffect(() => {
    const fields: FieldItem[] = [];
    const seenIds = new Set<string>();

    // 1. Predefined fields from specialty-fields.ts (used in SOAP generation)
    const config = specialtyConfigs[specialty];
    if (config) {
      for (const f of config.fields) {
        if (!seenIds.has(f.id)) {
          fields.push({ id: f.id, label: f.label });
          seenIds.add(f.id);
        }
      }
    }

    // 2. Onboarding fields from specialty-onboarding.ts
    const onboardingFields = ONBOARDING_FIELDS[specialty];
    if (onboardingFields) {
      for (const f of onboardingFields) {
        if (!seenIds.has(f.id)) {
          fields.push({ id: f.id, label: f.name });
          seenIds.add(f.id);
        }
      }
    }

    setAllFields(fields);

    // 3. Load saved fields from Supabase (includes custom fields from onboarding)
    loadSavedFields(seenIds);
  }, [specialty]);

  async function loadSavedFields(existingIds: Set<string>) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoaded(true); return; }

    const { data } = await supabase
      .from("profiles")
      .select("specialty_fields")
      .eq("id", user.id)
      .single();

    if (data?.specialty_fields && Array.isArray(data.specialty_fields)) {
      const savedFields = data.specialty_fields as { id: string; name: string; enabled: boolean; isCustom?: boolean }[];

      // Pre-select fields that were enabled in onboarding
      const newSelected = new Set(propSelectedFields);
      const customs: FieldItem[] = [];

      for (const sf of savedFields) {
        if (sf.enabled) newSelected.add(sf.id);

        // Add custom fields that aren't in predefined lists
        if (!existingIds.has(sf.id)) {
          customs.push({ id: sf.id, label: sf.name, isCustom: true });
          existingIds.add(sf.id);
        }
      }

      setSelected(newSelected);
      setCustomFields(customs);
    }

    setLoaded(true);
  }

  function toggleField(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    setSaved(false);
  }

  function addCustomField() {
    if (!newFieldName.trim()) return;
    const id = `custom_${Date.now()}`;
    setCustomFields((prev) => [...prev, { id, label: newFieldName.trim(), isCustom: true }]);
    setSelected((prev) => new Set(prev).add(id));
    setNewFieldName("");
    setIsAdding(false);
    setSaved(false);
  }

  function removeCustomField(id: string) {
    setCustomFields((prev) => prev.filter((f) => f.id !== id));
    setSelected((prev) => { const next = new Set(prev); next.delete(id); return next; });
    setSaved(false);
  }

  function handleSave() {
    onSave(Array.from(selected));

    // Also save custom fields to Supabase profile
    const allFieldsToSave = [
      ...allFields.map((f) => ({ id: f.id, name: f.label, enabled: selected.has(f.id), isCustom: false })),
      ...customFields.map((f) => ({ id: f.id, name: f.label, enabled: selected.has(f.id), isCustom: true })),
    ];

    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from("profiles").update({ specialty_fields: allFieldsToSave }).eq("id", user.id);
      }
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const combined = [...allFields, ...customFields];
  const hasFields = combined.length > 0;

  if (!loaded) {
    return <div className="animate-pulse space-y-2"><div className="h-5 w-40 rounded bg-black/[0.06]" /><div className="h-12 rounded bg-black/[0.06]" /><div className="h-12 rounded bg-black/[0.06]" /></div>;
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-serif text-lg font-normal text-hiro-text">
          Campos para {specialty}
        </h3>
        <p className="mt-1 text-[12px] text-hiro-muted">
          {hasFields
            ? "Selecione os campos que deseja incluir no prontuário. Eles aparecerão como sugestões durante a consulta."
            : "Esta especialidade não tem campos pré-definidos. Adicione campos personalizados abaixo."}
        </p>
      </div>

      {hasFields && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {combined.map((field) => {
            const isSelected = selected.has(field.id);
            return (
              <div
                key={field.id}
                onClick={() => toggleField(field.id)}
                className={`flex cursor-pointer items-center justify-between rounded-xl border px-3 py-2.5 transition-colors ${
                  isSelected ? "border-hiro-green/40 bg-hiro-green/5" : "border-black/[0.06] hover:border-black/[0.12]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`flex h-5 w-5 items-center justify-center rounded border ${isSelected ? "border-hiro-green bg-hiro-green" : "border-black/20"}`}>
                    {isSelected && <Check className="h-3 w-3 text-white" strokeWidth={2.5} />}
                  </div>
                  <span className={`text-[13px] ${isSelected ? "font-medium text-hiro-text" : "text-hiro-muted"}`}>{field.label}</span>
                </div>
                {field.isCustom && (
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-full bg-hiro-amber/15 px-1.5 py-0.5 text-[9px] font-medium text-hiro-amber">Personalizado</span>
                    <button type="button" onClick={(e) => { e.stopPropagation(); removeCustomField(field.id); }} className="text-hiro-muted/30 hover:text-hiro-red">
                      <X className="h-3.5 w-3.5" strokeWidth={2} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add custom field */}
      {isAdding ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={newFieldName}
            onChange={(e) => setNewFieldName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addCustomField(); if (e.key === "Escape") setIsAdding(false); }}
            placeholder="Nome do campo personalizado"
            autoFocus
            className="glass-card-input flex-1 rounded-xl px-4 py-2.5 text-[13px] text-hiro-text outline-none focus:ring-2 focus:ring-hiro-green/30"
          />
          <button type="button" onClick={addCustomField} disabled={!newFieldName.trim()} className="rounded-xl bg-hiro-green px-4 py-2.5 text-white hover:bg-[#244a3b] disabled:opacity-40">
            Adicionar
          </button>
          <button type="button" onClick={() => { setIsAdding(false); setNewFieldName(""); }} className="px-3 text-hiro-muted hover:text-hiro-text">
            Cancelar
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => setIsAdding(true)} className="flex w-full items-center gap-2 rounded-xl border-2 border-dashed border-black/[0.1] px-4 py-3 text-[13px] text-hiro-muted transition-colors hover:border-hiro-green/40 hover:text-hiro-green">
          <Plus className="h-4 w-4" strokeWidth={2} />
          Adicionar campo personalizado
        </button>
      )}

      <div className="flex items-center gap-3 border-t border-black/[0.06] pt-4">
        <ButtonHiro onClick={handleSave} className="px-6">
          {saved ? (
            <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4" /> Salvo</span>
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
