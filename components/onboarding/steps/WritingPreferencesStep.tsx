"use client";

import { Check } from "lucide-react";
import type { WritingPreferences } from "@/types/onboarding";

interface WritingPreferencesStepProps {
  preferences: WritingPreferences;
  onUpdate: (prefs: WritingPreferences) => void;
}

const TONES = [
  { value: "formal" as const, label: "Formal / Técnico", example: "Paciente refere quadro álgico em região epigástrica com início há 48 horas, sem irradiação..." },
  { value: "detailed" as const, label: "Detalhado", example: "Paciente relata que está sentindo uma dor na região do estômago, que começou há dois dias. A dor não se espalha para outras áreas..." },
  { value: "concise" as const, label: "Direto / Conciso", example: "Dor epigástrica há 2d, sem irradiação. Nega náuseas/vômitos." },
];

const PLAN_FORMATS = [
  { value: "numbered_list" as const, label: "Lista numerada", example: "1. Omeprazol 20mg — 1x/dia, em jejum, por 30 dias\n2. Solicitar EDA\n3. Retorno em 30 dias com resultado" },
  { value: "categories" as const, label: "Por categorias", example: "Medicações: Omeprazol 20mg 1x/dia em jejum\nExames: Endoscopia digestiva alta\nOrientações: Dieta leve, evitar frituras\nRetorno: 30 dias" },
  { value: "prose" as const, label: "Texto corrido", example: "Prescrito Omeprazol 20mg para uso diário em jejum por 30 dias. Solicitada endoscopia digestiva alta. Orientado dieta leve e retorno em 30 dias." },
];

const TOGGLES: { key: keyof WritingPreferences; label: string }[] = [
  { key: "includeDateTime", label: "Data e hora da consulta" },
  { key: "includeDuration", label: "Duração da consulta" },
  { key: "includeSuggestedCID", label: "CID-10 sugeridos" },
  { key: "includeSuggestedReturn", label: "Sugestão de retorno" },
];

export function WritingPreferencesStep({ preferences, onUpdate }: WritingPreferencesStepProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-2xl text-hiro-text">Estilo do prontuário</h2>
        <p className="mt-2 text-[14px] text-hiro-muted leading-relaxed">Como você prefere que suas notas sejam escritas?</p>
      </div>

      {/* Tone */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-hiro-muted mb-3">Tom da escrita</p>
        <div className="space-y-2">
          {TONES.map((t) => (
            <div key={t.value} onClick={() => onUpdate({ ...preferences, tone: t.value })}
              className={`cursor-pointer rounded-xl border-2 px-4 py-3.5 transition-all ${preferences.tone === t.value ? "border-hiro-green/40 bg-hiro-green/5" : "border-black/[0.06] hover:border-black/[0.12]"}`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-medium text-hiro-text">{t.label}</span>
                {preferences.tone === t.value && (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-hiro-green"><Check className="h-3 w-3 text-white" strokeWidth={2.5} /></div>
                )}
              </div>
              <p className="text-[12px] italic text-hiro-muted leading-relaxed">"{t.example}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* Plan format */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-hiro-muted mb-3">Formato do Plano</p>
        <div className="space-y-2">
          {PLAN_FORMATS.map((f) => (
            <div key={f.value} onClick={() => onUpdate({ ...preferences, planFormat: f.value })}
              className={`cursor-pointer rounded-xl border-2 px-4 py-3.5 transition-all ${preferences.planFormat === f.value ? "border-hiro-green/40 bg-hiro-green/5" : "border-black/[0.06] hover:border-black/[0.12]"}`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-medium text-hiro-text">{f.label}</span>
                {preferences.planFormat === f.value && (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-hiro-green"><Check className="h-3 w-3 text-white" strokeWidth={2.5} /></div>
                )}
              </div>
              <pre className="whitespace-pre-wrap font-sans text-[12px] text-hiro-muted leading-relaxed">{f.example}</pre>
            </div>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-hiro-muted mb-3">Incluir automaticamente</p>
        <div className="space-y-2">
          {TOGGLES.map(({ key, label }) => (
            <div key={key} onClick={() => onUpdate({ ...preferences, [key]: !preferences[key] })}
              className={`flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 transition-colors ${preferences[key] ? "bg-hiro-green/5" : "hover:bg-black/[0.02]"}`}
            >
              <div className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${preferences[key] ? "border-hiro-green bg-hiro-green" : "border-black/20"}`}>
                {preferences[key] && <Check className="h-3 w-3 text-white" strokeWidth={2.5} />}
              </div>
              <span className="text-[14px] text-hiro-text">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
