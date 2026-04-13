"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown, ChevronUp, FileText, Pencil, Save, Sparkles, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CardHiro } from "@/components/ui/CardHiro";
import { OverlineLabel } from "@/components/ui/OverlineLabel";
import { ButtonHiro } from "@/components/ui/ButtonHiro";
import type { WritingPreferences, SpecialtyField, SpecialtySettings } from "@/types/onboarding";

interface WritingProfile {
  tom?: string;
  caracteristicas?: string[];
  terminologia?: string;
  expressoes_frequentes?: string[];
  nivel_detalhe?: string;
  instrucao_para_ia?: string;
}

interface ProfilePreferencesProps {
  userId: string;
}

const TONE_LABELS: Record<string, string> = { formal: "Formal / Técnico", detailed: "Detalhado", concise: "Direto / Conciso" };
const FORMAT_LABELS: Record<string, string> = { numbered_list: "Lista numerada", categories: "Por categorias", prose: "Texto corrido" };

export function ProfilePreferences({ userId }: ProfilePreferencesProps) {
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<string | null>("fields");

  const [specialty, setSpecialty] = useState("");
  const [fields, setFields] = useState<SpecialtyField[]>([]);
  const [prefs, setPrefs] = useState<WritingPreferences | null>(null);
  const [profile, setProfile] = useState<WritingProfile | null>(null);

  useEffect(() => { load(); }, [userId]);

  async function load() {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("especialidade, specialty_fields, writing_preferences, writing_profile")
      .eq("id", userId)
      .single();

    if (data) {
      setSpecialty(data.especialidade ?? "Clínica Geral");
      setFields(data.specialty_fields ?? []);
      setPrefs(data.writing_preferences ?? null);
      if (data.writing_profile) {
        try { setProfile(typeof data.writing_profile === "string" ? JSON.parse(data.writing_profile) : data.writing_profile); } catch {}
      }
    }
    setLoading(false);
  }

  async function save() {
    setSaving(true);
    const supabase = createClient();
    await supabase.from("profiles").update({
      specialty_fields: fields,
      writing_preferences: prefs,
    }).eq("id", userId);
    setSaving(false);
    setEditing(false);
  }

  function toggle(section: string) {
    setExpanded(expanded === section ? null : section);
  }

  if (loading) {
    return <div className="animate-pulse space-y-3"><div className="h-6 w-40 rounded bg-black/[0.06]" /><div className="h-20 rounded bg-black/[0.06]" /></div>;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-lg font-normal text-hiro-text">Preferências do Prontuário</h2>
        {editing ? (
          <div className="flex gap-2">
            <ButtonHiro variant="secondary" onClick={() => { setEditing(false); load(); }} className="px-4 py-2 text-[12px]">
              <X className="mr-1 h-3.5 w-3.5" strokeWidth={2} /> Cancelar
            </ButtonHiro>
            <ButtonHiro onClick={save} disabled={saving} className="px-4 py-2 text-[12px]">
              <Save className="mr-1 h-3.5 w-3.5" strokeWidth={2} /> {saving ? "Salvando..." : "Salvar"}
            </ButtonHiro>
          </div>
        ) : (
          <button type="button" onClick={() => setEditing(true)} className="inline-flex items-center gap-1.5 text-[12px] font-medium text-hiro-green transition-colors hover:text-hiro-green/80">
            <Pencil className="h-3.5 w-3.5" strokeWidth={2} /> Editar
          </button>
        )}
      </div>

      {/* Exam Fields */}
      <CardHiro className="overflow-hidden rounded-2xl p-0">
        <button type="button" onClick={() => toggle("fields")} className="flex w-full items-center justify-between px-5 py-4 transition-colors hover:bg-black/[0.02]">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-hiro-green" strokeWidth={1.75} />
            <span className="text-[13px] font-medium text-hiro-text">Campos do Exame Físico ({specialty})</span>
          </div>
          {expanded === "fields" ? <ChevronUp className="h-4 w-4 text-hiro-muted" /> : <ChevronDown className="h-4 w-4 text-hiro-muted" />}
        </button>
        {expanded === "fields" && (
          <div className="border-t border-black/[0.06] px-5 py-4 space-y-1.5">
            {fields.length === 0 ? (
              <p className="text-[12px] italic text-hiro-muted/60">Nenhum campo configurado</p>
            ) : fields.map((f) => (
              <div key={f.id} onClick={() => editing && setFields((fs) => fs.map((x) => x.id === f.id ? { ...x, enabled: !x.enabled } : x))}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 ${editing ? "cursor-pointer hover:bg-black/[0.02]" : ""} ${f.enabled ? "bg-hiro-green/5" : ""}`}
              >
                <div className={`flex h-4.5 w-4.5 items-center justify-center rounded border ${f.enabled ? "border-hiro-green bg-hiro-green" : "border-black/20"}`}>
                  {f.enabled && <Check className="h-3 w-3 text-white" strokeWidth={2.5} />}
                </div>
                <span className={`text-[13px] ${f.enabled ? "text-hiro-text" : "text-hiro-muted"}`}>{f.name}</span>
                {f.isCustom && <span className="rounded-full bg-hiro-amber/15 px-1.5 py-0.5 text-[9px] font-medium text-hiro-amber">Personalizado</span>}
              </div>
            ))}
          </div>
        )}
      </CardHiro>

      {/* Writing Preferences */}
      <CardHiro className="overflow-hidden rounded-2xl p-0">
        <button type="button" onClick={() => toggle("writing")} className="flex w-full items-center justify-between px-5 py-4 transition-colors hover:bg-black/[0.02]">
          <div className="flex items-center gap-2">
            <Pencil className="h-4 w-4 text-hiro-green" strokeWidth={1.75} />
            <span className="text-[13px] font-medium text-hiro-text">Estilo de Escrita</span>
          </div>
          {expanded === "writing" ? <ChevronUp className="h-4 w-4 text-hiro-muted" /> : <ChevronDown className="h-4 w-4 text-hiro-muted" />}
        </button>
        {expanded === "writing" && prefs && (
          <div className="border-t border-black/[0.06] px-5 py-4 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] text-hiro-muted">Tom</p>
                <p className="text-[13px] font-medium text-hiro-text">{TONE_LABELS[prefs.tone] ?? prefs.tone}</p>
              </div>
              <div>
                <p className="text-[11px] text-hiro-muted">Formato do Plano</p>
                <p className="text-[13px] font-medium text-hiro-text">{FORMAT_LABELS[prefs.planFormat] ?? prefs.planFormat}</p>
              </div>
            </div>
            <div>
              <p className="text-[11px] text-hiro-muted mb-1.5">Incluir automaticamente:</p>
              <div className="flex flex-wrap gap-1.5">
                {prefs.includeDateTime && <span className="rounded-full bg-hiro-green/10 px-2.5 py-1 text-[11px] font-medium text-hiro-green">Data e hora</span>}
                {prefs.includeDuration && <span className="rounded-full bg-hiro-green/10 px-2.5 py-1 text-[11px] font-medium text-hiro-green">Duração</span>}
                {prefs.includeSuggestedCID && <span className="rounded-full bg-hiro-green/10 px-2.5 py-1 text-[11px] font-medium text-hiro-green">CID sugerido</span>}
                {prefs.includeSuggestedReturn && <span className="rounded-full bg-hiro-green/10 px-2.5 py-1 text-[11px] font-medium text-hiro-green">Retorno sugerido</span>}
              </div>
            </div>
          </div>
        )}
        {expanded === "writing" && !prefs && (
          <div className="border-t border-black/[0.06] px-5 py-4">
            <p className="text-[12px] italic text-hiro-muted/60">Nenhuma preferência configurada</p>
          </div>
        )}
      </CardHiro>

      {/* Writing Profile (from AI analysis) */}
      {profile && (
        <CardHiro className="overflow-hidden rounded-2xl p-0">
          <button type="button" onClick={() => toggle("profile")} className="flex w-full items-center justify-between px-5 py-4 transition-colors hover:bg-black/[0.02]">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-hiro-amber" strokeWidth={1.75} />
              <span className="text-[13px] font-medium text-hiro-text">Perfil de Escrita (IA)</span>
              <span className="rounded-full bg-hiro-amber/15 px-2 py-0.5 text-[9px] font-medium text-hiro-amber">Aprendido</span>
            </div>
            {expanded === "profile" ? <ChevronUp className="h-4 w-4 text-hiro-muted" /> : <ChevronDown className="h-4 w-4 text-hiro-muted" />}
          </button>
          {expanded === "profile" && (
            <div className="border-t border-black/[0.06] px-5 py-4 space-y-3">
              {profile.instrucao_para_ia && (
                <div>
                  <p className="text-[11px] text-hiro-muted">Instrução para IA</p>
                  <p className="mt-1 text-[13px] italic text-hiro-text leading-relaxed">"{profile.instrucao_para_ia}"</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                {profile.tom && <div><p className="text-[11px] text-hiro-muted">Tom</p><p className="text-[13px] font-medium capitalize text-hiro-text">{profile.tom}</p></div>}
                {profile.nivel_detalhe && <div><p className="text-[11px] text-hiro-muted">Detalhe</p><p className="text-[13px] font-medium capitalize text-hiro-text">{profile.nivel_detalhe}</p></div>}
              </div>
              {profile.expressoes_frequentes && profile.expressoes_frequentes.length > 0 && (
                <div>
                  <p className="text-[11px] text-hiro-muted mb-1.5">Expressões frequentes:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.expressoes_frequentes.map((e, i) => (
                      <span key={i} className="rounded-full border border-black/[0.06] bg-white/50 px-2.5 py-1 text-[11px] text-hiro-muted">"{e}"</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardHiro>
      )}

      <a href="/onboarding" className="block text-center text-[12px] text-hiro-green transition-colors hover:underline">
        Refazer configuração inicial completa
      </a>
    </div>
  );
}
