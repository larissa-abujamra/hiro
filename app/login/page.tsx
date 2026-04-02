"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { EtherealShadow } from "@/components/ui/ethereal-shadow";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/6 px-4 py-3 text-[14px] text-white/90 placeholder:text-white/28 outline-none transition-all duration-200 focus:border-white/22 focus:bg-white/10 focus:shadow-[0_0_0_3px_rgba(255,255,255,0.05)]";

const labelClass =
  "block text-[11px] font-semibold uppercase tracking-widest text-white/35 mb-1.5";

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
    /* Full-screen canvas — EtherealShadow needs a sized parent */
    <div className="relative min-h-screen w-full" style={{ background: "#0d1a12" }}>

      {/* Animated ethereal background — fills the entire screen */}
      <div className="absolute inset-0 z-0">
        <EtherealShadow
          color="rgba(34, 87, 66, 1)"
          animation={{ scale: 80, speed: 60 }}
          noise={{ opacity: 0.3, scale: 1 }}
          style={{ width: "100%", height: "100%" }}
        />
      </div>

      {/* Extra depth layers on top of the shadow */}
      <div className="pointer-events-none absolute inset-0 z-[1]" aria-hidden>
        {/* Warm yellowish top-right hint */}
        <div
          className="absolute"
          style={{
            top: "-10%",
            right: "0%",
            width: "min(60vw, 480px)",
            height: "min(60vw, 480px)",
            background:
              "radial-gradient(ellipse at 60% 35%, rgba(180, 155, 60, 0.13) 0%, transparent 65%)",
          }}
        />
        {/* Grey-green centre vignette for depth */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(6, 14, 9, 0.55) 100%)",
          }}
        />
      </div>

      {/* Form centred on top */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">

          {/* Logo */}
          <div className="mb-8 text-center">
            <span className="font-serif text-4xl font-normal tracking-tight text-white/90">
              hiro.
            </span>
            <p className="mt-1.5 text-[13px] text-white/35">
              Assistente clínico com IA
            </p>
          </div>

          {/* Liquid glass card */}
          <div
            className="rounded-3xl border border-white/10 p-8"
            style={{
              background: "rgba(255, 255, 255, 0.07)",
              backdropFilter: "blur(48px) saturate(180%)",
              WebkitBackdropFilter: "blur(48px) saturate(180%)",
              boxShadow:
                "inset 0 1.5px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.2), 0 32px 80px rgba(0,0,0,0.5), 0 8px 24px rgba(0,0,0,0.3)",
            }}
          >
            <h1 className="mb-6 font-serif text-xl font-normal text-white/85">
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
                <p className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-2.5 text-[13px] text-red-300/90">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-1 w-full rounded-2xl py-3 text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  background: "rgba(255, 255, 255, 0.92)",
                  color: "#0d1a12",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.9)",
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.background = "rgba(255,255,255,1)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,1)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.92)";
                  e.currentTarget.style.boxShadow =
                    "0 2px 16px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.9)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {loading ? "Entrando…" : "Entrar"}
              </button>
            </form>
          </div>

          <p className="mt-5 text-center text-[13px] text-white/32">
            Ainda não tem conta?{" "}
            <Link
              href="/signup"
              className="font-medium text-white/62 underline-offset-2 transition-colors hover:text-white/90 hover:underline"
            >
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
