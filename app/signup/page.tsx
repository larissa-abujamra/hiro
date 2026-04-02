"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ButtonHiro } from "@/components/ui/ButtonHiro";

const UF_LIST = [
  "AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT",
  "PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO",
];

const inputClass =
  "glass-card-input w-full rounded-xl px-4 py-3 text-[14px] text-hiro-text placeholder:text-hiro-muted/60 focus:outline-none focus:ring-2 focus:ring-hiro-green/30";

const labelClass =
  "block text-[11px] font-semibold uppercase tracking-wide text-hiro-muted mb-1.5";

export default function SignupPage() {
  const router = useRouter();

  const [fields, setFields] = useState({
    nome: "",
    email: "",
    password: "",
    crm: "",
    uf: "",
    especialidade: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  function set(key: keyof typeof fields) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setFields((prev) => ({ ...prev, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: fields.email,
      password: fields.password,
      options: {
        data: {
          full_name: fields.nome,
          crm: fields.crm.replace(/\D/g, ""),
          uf: fields.uf,
          especialidade: fields.especialidade,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // If a session exists the user is already confirmed (e.g. email confirmations
    // are disabled in Supabase). Update the profile and redirect.
    if (data.session) {
      await supabase.from("profiles").upsert({
        id: data.user!.id,
        full_name: fields.nome,
        crm: fields.crm.replace(/\D/g, ""),
        uf: fields.uf,
        especialidade: fields.especialidade,
      });

      router.push("/");
      router.refresh();
      return;
    }

    // Email confirmation required — show message.
    setEmailSent(true);
    setLoading(false);
  }

  if (emailSent) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="relative z-10 w-full max-w-sm text-center">
          <span className="font-serif text-4xl font-normal tracking-tight text-hiro-text">
            hiro.
          </span>
          <div className="glass-card mt-8 rounded-2xl p-7">
            <div className="mb-4 flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-hiro-green/10">
              <svg className="h-6 w-6 text-hiro-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <h1 className="font-serif text-xl font-normal text-hiro-text">
              Verifique seu e-mail
            </h1>
            <p className="mt-2 text-[13px] text-hiro-muted leading-relaxed">
              Enviamos um link de confirmação para{" "}
              <span className="font-medium text-hiro-text">{fields.email}</span>.
              Clique no link para ativar sua conta.
            </p>
          </div>
          <p className="mt-5 text-[13px] text-hiro-muted">
            Já confirmou?{" "}
            <Link
              href="/login"
              className="font-medium text-hiro-green underline-offset-2 hover:underline"
            >
              Entrar
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
        <div
          className="absolute -right-[18%] -top-[22%] h-[min(85vw,720px)] w-[min(85vw,720px)]"
          style={{
            background:
              "radial-gradient(circle at 40% 40%, rgba(198, 139, 47, 0.2) 0%, transparent 58%)",
          }}
        />
        <div
          className="absolute -bottom-[28%] -left-[20%] h-[min(90vw,780px)] w-[min(90vw,780px)]"
          style={{
            background:
              "radial-gradient(circle at 45% 45%, rgba(45, 92, 63, 0.16) 0%, transparent 60%)",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <span className="font-serif text-4xl font-normal tracking-tight text-hiro-text">
            hiro.
          </span>
          <p className="mt-1 text-[13px] text-hiro-muted">
            Assistente clínico com IA
          </p>
        </div>

        <div className="glass-card rounded-2xl p-7">
          <h1 className="mb-6 font-serif text-xl font-normal text-hiro-text">
            Criar conta
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome completo */}
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
                placeholder="Dra. Larissa Oliveira"
                value={fields.nome}
                onChange={set("nome")}
              />
            </div>

            {/* E-mail */}
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
                onChange={set("email")}
              />
            </div>

            {/* Senha */}
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
                onChange={set("password")}
              />
            </div>

            <hr className="border-black/8" />

            {/* CRM + UF side by side */}
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
                  onChange={set("uf")}
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

            {/* Especialidade */}
            <div>
              <label htmlFor="especialidade" className={labelClass}>
                Especialidade
              </label>
              <input
                id="especialidade"
                type="text"
                className={inputClass}
                placeholder="Ex: Clínica Geral, Cardiologia…"
                value={fields.especialidade}
                onChange={set("especialidade")}
              />
            </div>

            {error && (
              <p className="rounded-xl border border-hiro-red/30 bg-hiro-red/10 px-4 py-2.5 text-[13px] text-hiro-red">
                {error}
              </p>
            )}

            <ButtonHiro
              type="submit"
              className="mt-2 w-full"
              disabled={loading}
            >
              {loading ? "Criando conta…" : "Criar conta"}
            </ButtonHiro>
          </form>
        </div>

        <p className="mt-5 text-center text-[13px] text-hiro-muted">
          Já tem conta?{" "}
          <Link
            href="/login"
            className="font-medium text-hiro-green underline-offset-2 hover:underline"
          >
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
