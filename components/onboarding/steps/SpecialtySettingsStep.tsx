"use client";

import { Check } from "lucide-react";
import { SPECIALTY_SPECIFIC_QUESTIONS } from "@/data/specialty-onboarding";
import type { SpecialtySettings } from "@/types/onboarding";

interface SpecialtySettingsStepProps {
  specialty: string;
  settings: SpecialtySettings;
  onUpdate: (settings: SpecialtySettings) => void;
}

export function SpecialtySettingsStep({ specialty, settings, onUpdate }: SpecialtySettingsStepProps) {
  const config = SPECIALTY_SPECIFIC_QUESTIONS[specialty];
  if (!config) return null;

  const s = settings as Record<string, unknown>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl text-hiro-text">{config.title}</h2>
        <p className="mt-2 text-[14px] text-hiro-muted leading-relaxed">Configurações específicas para sua especialidade.</p>
      </div>

      <div className="space-y-6">
        {config.questions.map((q) => (
          <div key={q.id}>
            <p className="text-[13px] font-medium text-hiro-text mb-2">{q.label}</p>

            {q.type === "checkbox" && (
              <div
                onClick={() => onUpdate({ ...settings, [q.id]: !s[q.id] })}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3.5 transition-all ${s[q.id] ? "border-hiro-green/40 bg-hiro-green/5" : "border-black/[0.06] hover:border-black/[0.12]"}`}
              >
                <div className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${s[q.id] ? "bg-hiro-green text-white" : "bg-black/[0.06]"}`}>
                  {!!s[q.id] && <Check className="h-4 w-4" strokeWidth={2} />}
                </div>
                <span className="text-hiro-text">Ativar</span>
              </div>
            )}

            {q.type === "radio" && q.options && (
              <div className="space-y-2">
                {q.options.map((opt) => (
                  <div key={opt.value} onClick={() => onUpdate({ ...settings, [q.id]: opt.value })}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3.5 transition-all ${s[q.id] === opt.value ? "border-hiro-green/40 bg-hiro-green/5" : "border-black/[0.06] hover:border-black/[0.12]"}`}
                  >
                    <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${s[q.id] === opt.value ? "border-hiro-green" : "border-black/20"}`}>
                      {s[q.id] === opt.value && <div className="h-3 w-3 rounded-full bg-hiro-green" />}
                    </div>
                    <span className="text-hiro-text">{opt.label}</span>
                  </div>
                ))}
              </div>
            )}

            {q.type === "multiselect" && q.options && (
              <div className="grid grid-cols-2 gap-2">
                {q.options.map((opt) => {
                  const vals = (s[q.id] as string[] | undefined) ?? [];
                  const selected = vals.includes(opt.value);
                  return (
                    <div key={opt.value}
                      onClick={() => {
                        const next = selected ? vals.filter((v) => v !== opt.value) : [...vals, opt.value];
                        onUpdate({ ...settings, [q.id]: next });
                      }}
                      className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 px-3 py-2.5 transition-all ${selected ? "border-hiro-green/40 bg-hiro-green/5" : "border-black/[0.06] hover:border-black/[0.12]"}`}
                    >
                      <div className={`flex h-5 w-5 items-center justify-center rounded transition-colors ${selected ? "bg-hiro-green text-white" : "bg-black/[0.06]"}`}>
                        {selected && <Check className="h-3 w-3" strokeWidth={2.5} />}
                      </div>
                      <span className="text-[13px] text-hiro-text">{opt.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
