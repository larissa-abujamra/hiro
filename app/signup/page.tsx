"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { specialtyOptions } from "@/data/specialty-fields";
import { isValidEmail } from "@/lib/validation";

const UF_LIST = [
  "AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT",
  "PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO",
];

const inputClass =
  "glass-auth-input w-full rounded-xl px-4 py-3 text-[14px] placeholder:text-white/30 focus:outline-none";

const labelClass =
  "block text-[11px] font-semibold uppercase tracking-wide text-white/45 mb-1.5";

type Sexo = "F" | "M" | "O";

const SEXO_OPTIONS: { value: Sexo; label: string }[] = [
  { value: "F", label: "Feminino" },
  { value: "M", label: "Masculino" },
  { value: "O", label: "Outro" },
];

function AuthBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
      <div
        className="absolute"
        style={{
          top: "10%",
          left: "-10%",
          width: "min(90vw, 700px)",
          height: "min(90vw, 700px)",
          background:
            "radial-gradient(ellipse at 40% 50%, rgba(22, 78, 45, 0.72) 0%, rgba(14, 50, 30, 0.38) 45%, transparent 72%)",
          filter: "blur(2px)",
        }}
      />
      <div
        className="absolute"
        style={{
          top: "-8%",
          right: "-5%",
          width: "min(65vw, 520px)",
          height: "min(65vw, 520px)",
          background:
            "radial-gradient(ellipse at 55% 45%, rgba(18, 65, 38, 0.6) 0%, rgba(10, 40, 22, 0.28) 50%, transparent 72%)",
          filter: "blur(4px)",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: "-15%",
          right: "5%",
          width: "min(70vw, 560px)",
          height: "min(70vw, 560px)",
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(12, 55, 32, 0.55) 0%, rgba(8, 30, 18, 0.2) 55%, transparent 75%)",
          filter: "blur(6px)",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: "-5%",
          left: "15%",
          width: "min(50vw, 400px)",
          height: "min(50vw, 400px)",
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(16, 48, 28, 0.4) 0%, transparent 68%)",
          filter: "blur(8px)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          opacity: 0.032,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "180px 180px",
        }}
      />
    </div>
  );
}

export default function SignupPage() {
  const router = useRouter();

  const [fields, setFields] = useState({
    nome: "",
    email: "",
    password: "",
    sexo: "F" as Sexo,
    crm: "",
    uf: "",
    especialidade: "",
    clinic_address: "",
    rqe: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  function setField(key: keyof typeof fields) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setFields((prev) => ({ ...prev, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidEmail(fields.email)) {
      setEmailError("Email inválido");
      return;
    }
    setEmailError(null);
    setError(null);
    setLoading(true);

    const supabase = createClient();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: fields.email,
      password: fields.password,
      options: {
        data: {
          full_name: fields.nome,
          sexo: fields.sexo,
          crm: fields.crm.replace(/\D/g, ""),
          uf: fields.uf,
          especialidade: fields.especialidade,
          clinic_address: fields.clinic_address,
          rqe: fields.rqe,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      await supabase.from("profiles").upsert({
        id: data.user!.id,
        full_name: fields.nome,
        sexo: fields.sexo,
        crm: fields.crm.replace(/\D/g, ""),
        uf: fields.uf,
        especialidade: fields.especialidade,
        clinic_address: fields.clinic_address || null,
        rqe: fields.rqe || null,
      });
      router.push("/onboarding");
      router.refresh();
      return;
    }

    setEmailSent(true);
    setLoading(false);
  }

  if (emailSent) {
    return (
      <div className="auth-bg relative flex min-h-screen items-center justify-center px-4 py-12 overflow-hidden">
        <AuthBackground />
        <div className="relative z-10 w-full max-w-sm text-center">
          <span className="font-serif text-4xl font-normal tracking-tight text-white/90">
            hiro.
          </span>
          <div className="glass-auth-card mt-8 rounded-2xl p-8">
            <div className="mb-4 mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/8 border border-white/12">
              <svg
                className="h-6 w-6 text-white/70"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                />
              </svg>
            </div>
            <h1 className="font-serif text-xl font-normal text-white/88">
              Verifique seu e-mail
            </h1>
            <p className="mt-2 text-[13px] text-white/45 leading-relaxed">
              Enviamos um link de confirmação para{" "}
              <span className="font-medium text-white/75">{fields.email}</span>.
              Clique no link para ativar sua conta.
            </p>
          </div>
          <p className="mt-5 text-[13px] text-white/35">
            Já confirmou?{" "}
            <Link
              href="/login"
              className="font-medium text-white/70 underline-offset-2 hover:text-white hover:underline transition-colors"
            >
              Entrar
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-bg relative flex min-h-screen items-center justify-center px-4 py-12 overflow-hidden">
      <AuthBackground />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="font-serif text-4xl font-normal tracking-tight text-white/90">
            hiro.
          </span>
          <p className="mt-1 text-[13px] text-white/38">
            Assistente clínico com IA
          </p>
        </div>

        <div className="glass-auth-card rounded-2xl p-7">
          <h1 className="mb-6 font-serif text-xl font-normal text-white/88">
            Criar conta
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="nome" className={labelClass}>
                Nome completo
              </label>
              <input
                id="nome"
                type="text"
                autoComplete="name"
                required
                className={inputClass}
                placeholder="João Silva"
                value={fields.nome}
                onChange={setField("nome")}
              />
            </div>

            {/* Gender selector */}
            <div>
              <span className={labelClass}>Gênero</span>
              <div className="flex gap-2">
                {SEXO_OPTIONS.map(({ value, label }) => {
                  const selected = fields.sexo === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFields((prev) => ({ ...prev, sexo: value }))}
                      className="flex-1 rounded-xl border py-2.5 text-[13px] font-medium transition-all duration-150"
                      style={
                        selected
                          ? {
                              background: "rgba(255,255,255,0.15)",
                              borderColor: "rgba(255,255,255,0.3)",
                              color: "rgba(255,255,255,0.92)",
                              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)",
                            }
                          : {
                              background: "rgba(255,255,255,0.04)",
                              borderColor: "rgba(255,255,255,0.09)",
                              color: "rgba(255,255,255,0.38)",
                            }
                      }
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label htmlFor="email" className={labelClass}>
                E-mail
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                className={inputClass}
                placeholder="voce@clinica.com.br"
                value={fields.email}
                onChange={(e) => { setFields((prev) => ({ ...prev, email: e.target.value })); setEmailError(null); }}
              />
              {emailError && (
                <p className="mt-1 text-[12px] text-red-300/90">{emailError}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className={labelClass}>
                Senha
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                className={inputClass}
                placeholder="Mínimo 8 caracteres"
                value={fields.password}
                onChange={setField("password")}
              />
            </div>

            <hr className="border-white/8" />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="crm" className={labelClass}>
                  CRM
                </label>
                <input
                  id="crm"
                  type="text"
                  inputMode="numeric"
                  required
                  className={inputClass}
                  placeholder="123456"
                  value={fields.crm}
                  onChange={(e) =>
                    setFields((prev) => ({
                      ...prev,
                      crm: e.target.value.replace(/\D/g, ""),
                    }))
                  }
                />
              </div>
              <div>
                <label htmlFor="uf" className={labelClass}>
                  UF do CRM
                </label>
                <select
                  id="uf"
                  required
                  className={inputClass}
                  value={fields.uf}
                  onChange={setField("uf")}
                >
                  <option value="">Estado</option>
                  {UF_LIST.map((uf) => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="especialidade" className={labelClass}>
                Especialidade
              </label>
              <select
                id="especialidade"
                className={inputClass}
                value={fields.especialidade}
                onChange={setField("especialidade")}
              >
                <option value="">Selecione</option>
                {specialtyOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="rqe" className={labelClass}>
                RQE (opcional)
              </label>
              <input
                id="rqe"
                type="text"
                className={inputClass}
                placeholder="Número do RQE"
                value={fields.rqe}
                onChange={setField("rqe")}
              />
              <p className="mt-1 text-[11px] text-white/40">
                Registro de Qualificação de Especialista — aparece na assinatura
              </p>
            </div>

            <div>
              <label htmlFor="clinic_address" className={labelClass}>
                Endereço da clínica (opcional)
              </label>
              <input
                id="clinic_address"
                type="text"
                className={inputClass}
                placeholder="Ex: Rua das Flores, 123 - Jardins, São Paulo - SP"
                value={fields.clinic_address}
                onChange={setField("clinic_address")}
              />
              <p className="mt-1 text-[11px] text-white/40">
                Aparece nas receitas e pedidos de exame
              </p>
            </div>

            {error && (
              <p className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-2.5 text-[13px] text-red-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-full bg-white/90 px-7 py-3 text-sm font-medium text-[#0a0f0b] transition-all duration-200 hover:bg-white hover:-translate-y-px hover:shadow-[0_4px_20px_rgba(255,255,255,0.15)] active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Criando conta…" : "Criar conta"}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-[13px] text-white/35">
          Já tem conta?{" "}
          <Link
            href="/login"
            className="font-medium text-white/70 underline-offset-2 hover:text-white hover:underline transition-colors"
          >
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
