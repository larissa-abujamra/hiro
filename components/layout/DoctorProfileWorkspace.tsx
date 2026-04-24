"use client";

import { useState } from "react";
import { Check, UserCircle } from "lucide-react";
import { CardHiro } from "@/components/ui/CardHiro";
import { OverlineLabel } from "@/components/ui/OverlineLabel";
import { ButtonHiro } from "@/components/ui/ButtonHiro";
import { useDoctorStore } from "@/lib/doctorStore";
import { SpecialtyFieldsConfig } from "@/components/settings/SpecialtyFieldsConfig";
import { specialtyOptions } from "@/data/specialty-fields";
import { MEDICAL_DISCLAIMER } from "@/lib/legal";

const UF_LIST = [
  "AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT",
  "PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO",
];

const inputClass =
  "glass-card-input w-full rounded-xl px-4 py-2.5 text-[13px] text-hiro-text placeholder:text-hiro-muted/60 focus:outline-none focus:ring-2 focus:ring-hiro-green/30";

const labelClass = "block text-[11px] font-semibold uppercase tracking-wide text-hiro-muted mb-1";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}

export function DoctorProfileWorkspace() {
  const profile = useDoctorStore((s) => s.profile);
  const setProfile = useDoctorStore((s) => s.setProfile);
  const isProfileComplete = useDoctorStore((s) => s.isProfileComplete);
  const selectedSpecialtyFields = useDoctorStore((s) => s.selectedSpecialtyFields);
  const setSelectedSpecialtyFields = useDoctorStore((s) => s.setSelectedSpecialtyFields);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinic_address: profile.clinic_address,
          rqe: profile.rqe,
          especialidade: profile.especialidade,
          crm: profile.crm,
          uf: profile.uf,
        }),
      });
    } catch (err) {
      console.error("[Profile] Save error:", err);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const complete = isProfileComplete();

  return (
    <>
    <form onSubmit={handleSave} className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-hiro-green/10">
          <UserCircle className="h-6 w-6 text-hiro-green" />
        </div>
        <div>
          <h1 className="font-serif text-2xl font-normal tracking-tight text-hiro-text">
            Perfil do médico
          </h1>
          <p className="text-[12px] text-hiro-muted">
            Dados usados na prescrição digital (Memed) e no prontuário PDF.
          </p>
        </div>
      </div>

      {/* Dados pessoais */}
      <CardHiro className="rounded-2xl p-5">
        <OverlineLabel>DADOS PESSOAIS</OverlineLabel>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Nome *">
            <input
              className={inputClass}
              placeholder="Nome"
              value={profile.nome}
              onChange={(e) => setProfile({ nome: e.target.value })}
            />
          </Field>
          <Field label="Sobrenome *">
            <input
              className={inputClass}
              placeholder="Sobrenome"
              value={profile.sobrenome}
              onChange={(e) => setProfile({ sobrenome: e.target.value })}
            />
          </Field>
          <Field label="CPF * (só números)">
            <input
              className={inputClass}
              placeholder="00000000000"
              maxLength={11}
              value={profile.cpf}
              onChange={(e) =>
                setProfile({ cpf: e.target.value.replace(/\D/g, "") })
              }
            />
          </Field>
          <Field label="Data de nascimento * (DD/MM/AAAA)">
            <input
              className={inputClass}
              placeholder="01/01/1985"
              value={profile.data_nascimento}
              onChange={(e) => setProfile({ data_nascimento: e.target.value })}
            />
          </Field>
          <Field label="Sexo">
            <select
              className={inputClass}
              value={profile.sexo}
              onChange={(e) =>
                setProfile({ sexo: e.target.value as "M" | "F" })
              }
            >
              <option value="F">Feminino</option>
              <option value="M">Masculino</option>
            </select>
          </Field>
          <Field label="E-mail">
            <input
              type="email"
              className={inputClass}
              placeholder="larissa@clinica.com.br"
              value={profile.email}
              onChange={(e) => setProfile({ email: e.target.value })}
            />
          </Field>
        </div>
      </CardHiro>

      {/* Dados profissionais */}
      <CardHiro className="rounded-2xl p-5">
        <OverlineLabel>DADOS PROFISSIONAIS</OverlineLabel>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="CRM * (só números)">
            <input
              className={inputClass}
              placeholder="123456"
              value={profile.crm}
              onChange={(e) =>
                setProfile({ crm: e.target.value.replace(/\D/g, "") })
              }
            />
          </Field>
          <Field label="UF do CRM *">
            <select
              className={inputClass}
              value={profile.uf}
              onChange={(e) => setProfile({ uf: e.target.value })}
            >
              <option value="">Selecione</option>
              {UF_LIST.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Especialidade">
            <select
              className={inputClass}
              value={specialtyOptions.includes(profile.especialidade) ? profile.especialidade : profile.especialidade ? "Outra" : ""}
              onChange={(e) => {
                if (e.target.value === "Outra") {
                  setProfile({ especialidade: "Outra" });
                } else {
                  setProfile({ especialidade: e.target.value });
                }
              }}
            >
              <option value="">Selecione</option>
              {specialtyOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </Field>
          {(profile.especialidade === "Outra" || (profile.especialidade && !specialtyOptions.includes(profile.especialidade))) && (
            <Field label="Qual especialidade?">
              <input
                className={inputClass}
                placeholder="Especifique sua especialidade"
                value={profile.especialidade === "Outra" ? "" : profile.especialidade}
                onChange={(e) => setProfile({ especialidade: e.target.value })}
              />
            </Field>
          )}
          <Field label="Clínica / Consultório">
            <input
              className={inputClass}
              placeholder="Clínica hiro"
              value={profile.clinica}
              onChange={(e) => setProfile({ clinica: e.target.value })}
            />
          </Field>
          <Field label="Endereço da clínica">
            <input
              className={inputClass}
              placeholder="Ex: Rua das Flores, 123 - Jardins, São Paulo - SP"
              value={profile.clinic_address}
              onChange={(e) => setProfile({ clinic_address: e.target.value })}
            />
          </Field>
          <Field label="RQE — Registro de Qualificação de Especialista">
            <input
              className={inputClass}
              placeholder="Número do RQE"
              value={profile.rqe}
              onChange={(e) => setProfile({ rqe: e.target.value })}
            />
          </Field>
        </div>
      </CardHiro>

      {/* Save */}
      <div className="flex items-center gap-3">
        <ButtonHiro type="submit" className="px-6">
          {saved ? (
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-4 w-4" />
              Salvo
            </span>
          ) : (
            "Salvar perfil"
          )}
        </ButtonHiro>
        {saved && (
          <p className="text-[12px] text-hiro-muted">
            Dados salvos no navegador.
          </p>
        )}
      </div>
    </form>

    {/* Specialty fields config */}
    {profile.especialidade && (
      <CardHiro className="mt-5 rounded-2xl p-5">
        <SpecialtyFieldsConfig
          specialty={profile.especialidade}
          selectedFields={selectedSpecialtyFields}
          onSave={setSelectedSpecialtyFields}
        />
      </CardHiro>
    )}

    <CardHiro className="mt-5 rounded-2xl p-5">
      <OverlineLabel>AVISO LEGAL</OverlineLabel>
      <p className="mt-2 text-[12px] leading-relaxed text-hiro-muted">
        {MEDICAL_DISCLAIMER}
      </p>
    </CardHiro>
    </>
  );
}
