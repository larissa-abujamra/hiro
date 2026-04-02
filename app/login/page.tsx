"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ButtonHiro } from "@/components/ui/ButtonHiro";

const inputClass =
  "glass-card-input w-full rounded-xl px-4 py-3 text-[14px] text-hiro-text placeholder:text-hiro-muted/60 focus:outline-none focus:ring-2 focus:ring-hiro-green/30";

const labelClass =
  "block text-[11px] font-semibold uppercase tracking-wide text-hiro-muted mb-1.5";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "E-mail ou senha incorretos."
          : error.message
      );
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      {/* Background blobs — same as root layout */}
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

      <div className="relative z-10 w-full max-w-sm">
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
            Entrar na sua conta
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className={labelClass}>
                Senha
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                className={inputClass}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              {loading ? "Entrando…" : "Entrar"}
            </ButtonHiro>
          </form>
        </div>

        <p className="mt-5 text-center text-[13px] text-hiro-muted">
          Ainda não tem conta?{" "}
          <Link
            href="/signup"
            className="font-medium text-hiro-green underline-offset-2 hover:underline"
          >
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}
